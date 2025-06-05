"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const serializeAmount = (obj) => ({
    ...obj,
    amount: obj.amount.toNumber(),
})

export async function createTransaction(data){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where:{clerkUserId: userId},
        });
        if(!user){
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: {id: data.accountId, userId: user.id},
        });
        if(!account) throw new Error("Account not found");
        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? 
                        calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                }
            });
            await tx.account.update({
                where: {id: data.accountId},
                data: {balance: newBalance},
            });
            return newTransaction;
        });     
        
        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`);
        
        return {success: true, data: serializeAmount(transaction)}; 
    } catch(error){
        console.error("Transaction creation error:", error);
        return {success: false, error: error.message};
    }
}

function calculateNextRecurringDate(startDate, interval) {  
    const date = new Date(startDate);  

    switch (interval) {  
        case "DAILY":  
            date.setDate(date.getDate() + 1);  
            break;  

        case "WEEKLY":  
            date.setDate(date.getDate() + 7);  
            break;  

        case "MONTHLY":  
            date.setMonth(date.getMonth() + 1);  
            break;  

        case "YEARLY":  
            date.setFullYear(date.getFullYear() + 1);  
            break;  
    }

    return date;  
}  

export async function getTransaction(id){
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where:{clerkUserId: userId},
        });
        if(!user){
            throw new Error("User not found");
        }
        const transaction = await db.transaction.findUnique({
            where:{
                id,
                userId: user.id,
            }
        });
        if(!transaction) throw new Error("Transaction not found");
        return serializeAmount(transaction);
    } catch (error) {
        console.error("Get transaction error:", error);
        throw error;
    }
}

export async function updateTransaction(id, data){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user = await db.user.findUnique({
            where:{clerkUserId: userId},
        });
        if(!user){
            throw new Error("User not found");
        }
        const originalTransaction = await db.transaction.findUnique({
            where:{
                id,
                userId: user.id,
            },
            include:{
                account: true,
            },
        });
        if(!originalTransaction) throw new Error("Transaction not found");
        const oldBalanceChange = originalTransaction.type === "EXPENSE" ? -originalTransaction.amount.toNumber() : originalTransaction.amount.toNumber();
        const newBalanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const netBalanceChange = newBalanceChange - oldBalanceChange;

        const transaction = await db.$transaction(async (tx) => {
            const updated = await tx.transaction.update({
                where:{
                    id,
                    userId: user.id,
                },
                data:{
                    ...data,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? 
                        calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                }
            });
            await tx.account.update({
                where:{id: data.accountId},
                data:{
                    balance: {
                        increment: netBalanceChange,
                    },
                },
            });
            return updated;
        });
        revalidatePath("/dashboard");
        revalidatePath(`/account/${data.accountId}`);
        return {success: true, data: serializeAmount(transaction)};
    } catch(error){
        console.error("Update transaction error:", error);
        return {success: false, error: error.message};
    }
}

export async function scanReceipt(file) {
    try {
        const model = genAi.getGenerativeModel({model: "gemini-1.5-flash"});
        
        // Verificar se é um arquivo de texto ou imagem
        const isTextFile = file.type === "text/plain";
        
        let prompt;
        let content;
        
        if (isTextFile) {
            // Processar arquivo de texto
            const text = await file.text();
            prompt = `
            Analise esta descrição de transação e extraia as seguintes informações em formato JSON:
            - Valor total (apenas o número)
            - Data (em formato ISO)
            - Descrição ou itens comprados (resumo breve)
            - Nome do estabelecimento/fornecedor
            - Categoria sugerida (uma das seguintes: materia-prima, folha-pagamento, maquinario, utilidades, transporte, impostos, marketing, pesquisa-desenvolvimento, viagens-negocios, manutencao-fabrica, vendas-maquinas, servicos-manutencao, pecas-reposicao, projetos-especiais, consultoria-tecnica)
            
            Texto da transação: "${text}"
            
            Responda apenas com JSON válido neste formato exato:
            {
              "amount": number,
              "date": "string em formato ISO",
              "description": "string",
              "merchantName": "string",
              "category": "string"
            }
            
            Se não conseguir extrair alguma informação, use valores padrão razoáveis.`;
            
            content = prompt;
        } else {
            // Processar arquivo de imagem
            const arrayBuffer = await file.arrayBuffer();
            const base64String = Buffer.from(arrayBuffer).toString('base64');
            prompt = `
            Analise esta imagem de nota fiscal/recibo e extraia as seguintes informações em formato JSON:
            - Valor total (apenas o número)
            - Data (em formato ISO)
            - Descrição ou itens comprados (resumo breve)
            - Nome do estabelecimento/fornecedor
            - Categoria sugerida (uma das seguintes: materia-prima, folha-pagamento, maquinario, utilidades, transporte, impostos, marketing, pesquisa-desenvolvimento, viagens-negocios, manutencao-fabrica, vendas-maquinas, servicos-manutencao, pecas-reposicao, projetos-especiais, consultoria-tecnica)
            
            Responda apenas com JSON válido neste formato exato:
            {
              "amount": number,
              "date": "string em formato ISO",
              "description": "string",
              "merchantName": "string",
              "category": "string"
            }
            
            Se não for uma nota fiscal, retorne um objeto vazio.`;
            
            content = [
                {
                    inlineData: {
                        data: base64String,
                        mimeType: file.type,
                    }
                }
            ];
        }

        const result = await model.generateContent(content);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        
        try {
            const data = JSON.parse(cleanedText);
            return {
              amount: parseFloat(data.amount),
              date: new Date(data.date),
              description: data.description,
              category: data.category,
              corporateName: data.merchantName,
            };
        } catch (parseError) {
            console.error("Erro ao analisar resposta JSON:", parseError);
            throw new Error("Formato de resposta inválido da IA");
        }
    } catch (error) {
        console.error("Erro ao processar dados:", error);
        throw new Error("Falha ao processar os dados");
    }
}
