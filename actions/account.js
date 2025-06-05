"use server";
import { db } from "@/lib/prisma";
import {auth} from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized = { ...obj };
    if (obj.balance && typeof obj.balance === 'object' && obj.balance.toNumber) {
      serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount && typeof obj.amount === 'object' && obj.amount.toNumber) {
      serialized.amount = obj.amount.toNumber();
    }
    if (obj.targetGoal && typeof obj.targetGoal === 'object' && obj.targetGoal.toNumber) {
      serialized.targetGoal = obj.targetGoal.toNumber();
    }
    return serialized;
  };

  export async function updateDefaultAccount(accountId){
    try{
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where:{clerkUserId: userId},
        });
        if(!user){
            throw new Error("User not found");
        }
          await db.account.updateMany({
                  where: { userId: user.id, isDefault: true, },
                  data: { isDefault: false },
                });

    const account = await db.account.update({
        where: {id: accountId,
            userId: user.id,
        },
        data: {isDefault: true},
    });

    revalidatePath("/dashboard");
    return {success: true, data: serializeTransaction(account)};
    }catch(error){
        return {success: false, error: error.message};
    }
  }

  export async function getAccountWithTransactions(accountId){
    const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");

        const user = await db.user.findUnique({
            where:{clerkUserId: userId},
        });
        if(!user){
            throw new Error("User not found");
        }
        const account = await db.account.findUnique({
            where: {id: accountId, userId: user.id},
            include: {
                transactions: {
                  orderBy: {date: "desc"}
                },
            _count:{
              select:{transactions: true},
            },
          },
        });


        if(!account) return null;

        // Properly serialize all Decimal values
        return{
          ...serializeTransaction(account),

          transactions: account.transactions.map(serializeTransaction),
        };
      }

      export async function bulkDeleteTransactions(transactionIds) {
        try {
          console.log("Iniciando exclusão em lote das transações..."); // Log inicial
          console.log("IDs das transações recebidos:", transactionIds); // Log dos IDs
      
          const { userId } = await auth();
          if (!userId) throw new Error("Unauthorized");
      
          const user = await db.user.findUnique({
            where: { clerkUserId: userId },
          });
          if (!user) {
            throw new Error("User not found");
          }
      
          console.log("Usuário encontrado:", user.id); // Log do usuário
      
          // Busca as transações no banco de dados
          const transactions = await db.transaction.findMany({
            where: {
              id: { in: transactionIds },
              userId: user.id,
            },
          });
      
          console.log("Transações encontradas para exclusão:", transactions); // Log das transações
      
          // Calcula as mudanças no saldo das contas
          const accountBalanceChanges = transactions.reduce((acc, transaction) => {
            // Certifique-se de que o valor é tratado como número
            const amount = typeof transaction.amount === 'object' && transaction.amount.toNumber 
              ? transaction.amount.toNumber() 
              : Number(transaction.amount);
              
            const change = transaction.type === "EXPENSE" ? amount : -amount;
            
            // Certifique-se de que o acumulador também é um número
            acc[transaction.accountId] = (acc[transaction.accountId] || 0) + change;
            return acc;
          }, {});
      
          console.log("Mudanças no saldo das contas:", accountBalanceChanges); // Log das mudanças
      
          // Executa a exclusão e atualização do saldo em uma transação
          await db.$transaction(async (tx) => {
            await tx.transaction.deleteMany({
              where: {
                id: { in: transactionIds },
                userId: user.id,
              },
            });
      
            console.log("Transações excluídas com sucesso."); // Log após exclusão
      
            for (const [accountId, balanceChange] of Object.entries(accountBalanceChanges)) {
              await tx.account.update({
                where: { id: accountId },
                data: { balance: { increment: balanceChange } },
              });
      
              console.log(`Saldo da conta ${accountId} atualizado com sucesso.`); // Log após atualização
            }
          });
      
          revalidatePath("/dashboard");
          revalidatePath("/account/[id]");
      
          console.log("Exclusão em lote concluída com sucesso."); // Log final
          return { success: true };
        } catch (error) {
          console.error("Erro durante a exclusão em lote:", error); // Log de erro
          return { success: false, error: error.message };
        }
      }

      export async function updateAccount(accountId, data) {
        try {
          const { userId } = await auth();
          if (!userId) throw new Error("Unauthorized");

          const user = await db.user.findUnique({
            where: { clerkUserId: userId },
          });
          if (!user) {
            throw new Error("User not found");
          }

          // Convert balance to float before saving
          const balanceFloat = parseFloat(data.balance);
          if (isNaN(balanceFloat)) {
            throw new Error("Invalid balance amount");
          }
        
          // Convert target goal to float if provided
          let targetGoalFloat = null;
          if (data.targetGoal && data.targetGoal.trim() !== '') {
            targetGoalFloat = parseFloat(data.targetGoal);
            if (isNaN(targetGoalFloat)) {
              throw new Error("Invalid target goal amount");
            }
          }

          // If this account should be default, unset other default accounts
          if (data.isDefault) {
            await db.account.updateMany({
              where: { userId: user.id, isDefault: true, id: { not: accountId } },
              data: { isDefault: false },
            });
          }

          const account = await db.account.update({
            where: {
              id: accountId,
              userId: user.id,
            },
            data: {
              name: data.name,
              type: data.type,
              balance: balanceFloat,
              targetGoal: targetGoalFloat,
              isDefault: data.isDefault,
            },
          });

          revalidatePath("/dashboard");
          revalidatePath(`/account/${accountId}`);
          return { success: true, data: serializeTransaction(account) };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }

      export async function deleteAccount(accountId) {
        try {
          const { userId } = await auth();
          if (!userId) throw new Error("Unauthorized");

          const user = await db.user.findUnique({
            where: { clerkUserId: userId },
          });
          if (!user) {
            throw new Error("User not found");
          }

          // Check if this is the only account
          const accountCount = await db.account.count({
            where: { userId: user.id },
          });

          if (accountCount <= 1) {
            throw new Error("Você não pode deletar sua única conta");
          }

          // Check if this is the default account
          const account = await db.account.findUnique({
            where: { id: accountId, userId: user.id },
          });

          // Delete the account and its transactions
          await db.$transaction(async (tx) => {
            // Delete all transactions associated with this account
            await tx.transaction.deleteMany({
              where: { accountId, userId: user.id },
            });

            // Delete the account
            await tx.account.delete({
              where: { id: accountId, userId: user.id },
            });

            // If this was the default account, set another account as default
            if (account.isDefault) {
              const anotherAccount = await tx.account.findFirst({
                where: { userId: user.id, id: { not: accountId } },
              });
              
              if (anotherAccount) {
                await tx.account.update({
                  where: { id: anotherAccount.id },
                  data: { isDefault: true },
                });
              }
            }
          });

          revalidatePath("/dashboard");
          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }