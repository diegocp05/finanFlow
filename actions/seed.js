"use server";

import { db } from "@/lib/prisma";
import { addDays, addMonths, format } from "date-fns";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

const ACCOUNT_ID = "5a4988d6-8b6e-4f61-9a9c-3600f722fde2";
const USER_ID = "adb65981-f8af-4a09-8663-4f6d245415c9";

// Categorias específicas para a Usifresa
const CATEGORIES = {
  INCOME: [
    { name: "vendas-maquinas", range: [50000, 250000] },
    { name: "servicos-manutencao", range: [5000, 30000] },
    { name: "pecas-reposicao", range: [3000, 15000] },
    { name: "projetos-especiais", range: [20000, 100000] },
    { name: "consultoria-tecnica", range: [2000, 10000] },
  ],
  EXPENSE: [
    { name: "materia-prima", range: [10000, 50000] },
    { name: "folha-pagamento", range: [20000, 40000] },
    { name: "maquinario", range: [5000, 80000] },
    { name: "utilidades", range: [2000, 5000] },
    { name: "transporte", range: [1000, 8000] },
    { name: "impostos", range: [5000, 30000] },
    { name: "marketing", range: [1000, 5000] },
    { name: "pesquisa-desenvolvimento", range: [3000, 15000] },
    { name: "viagens-negocios", range: [2000, 10000] },
    { name: "manutencao-fabrica", range: [1000, 7000] },
  ],
  TRANSFER: [
    { name: "transferencia", range: [5000, 50000] },
  ]
};

// Clientes e fornecedores específicos para a Usifresa
const CORPORATE_NAMES = {
  INCOME: [
    "Kimberly-Clark Brasil", 
    "Santher Papel", 
    "Melhoramentos CMPC", 
    "Suzano Papel e Celulose",
    "Papirus Indústria de Papel",
    "Mili S.A.",
    "Sepac Serrados e Pasta de Celulose",
    "Carta Fabril S.A.",
    "Copapa Cia Paduana de Papéis",
    "Fábrica de Papel Santa Therezinha",
    "Damapel Indústria de Papéis",
    "Indaial Papel",
    "Manikraft Guaianazes",
    "Papéis Amália",
    "Tissue Brasil"
  ],
  EXPENSE: [
    "Aço Serrana Ltda", 
    "Metalúrgica São Paulo", 
    "Eletro Componentes Brasil", 
    "Hidráulica Industrial SP", 
    "Parafusos e Fixadores Técnicos",
    "Motores Elétricos Nacional",
    "Rolamentos Precisão",
    "Automação Industrial Tech",
    "Ferramentas Especiais Ltda",
    "Borrachas e Vedações Técnicas",
    "Transportadora Expressa",
    "Distribuidora de Aços Inox",
    "Compressores Brasil",
    "Tintas Industriais SP",
    "Soldas Especiais",
    "Lubrificantes Industriais",
    "Embalagens Industriais",
    "Segurança do Trabalho EPI",
    "Serviços Contábeis Associados",
    "Energia Elétrica Paulista"
  ],
  TRANSFER: [
    "Banco do Brasil",
    "Itaú Unibanco",
    "Bradesco",
    "Santander",
    "Caixa Econômica Federal",
    "Nubank",
    "Inter",
    "Sicoob"
  ]
};

// Tipos de documentos específicos para a Usifresa
const DOCUMENT_TYPES = [
  "NF-e 12345", 
  "Pedido 98765", 
  "Contrato 54321", 
  "Orçamento 67890",
  "Projeto 13579",
  "Ordem de Serviço 24680",
  "Nota Fiscal 45678",
  "Fatura 87654",
  "Proposta Técnica 98123",
  "Contrato de Manutenção 45612",
  "Relatório Técnico 78901",
  "Guia de Remessa 34567",
  "TED 11223",
  "DOC 44556",
  "PIX 77889"
];

// Descrições para transações específicas da Usifresa
const DESCRIPTIONS = {
  INCOME: [
    "Venda de máquina de papel toalha interfolhado",
    "Venda de máquina de papel higiênico",
    "Serviço de manutenção preventiva",
    "Venda de peças de reposição",
    "Projeto especial para linha de produção",
    "Consultoria técnica em processo produtivo",
    "Venda de máquina de guardanapos",
    "Upgrade de equipamento existente",
    "Venda de máquina de lençol hospitalar",
    "Serviço de manutenção corretiva"
  ],
  EXPENSE: [
    "Compra de chapas de aço inox",
    "Pagamento de salários",
    "Aquisição de componentes eletrônicos",
    "Compra de motores elétricos",
    "Pagamento de energia elétrica",
    "Recolhimento de impostos",
    "Compra de ferramentas especiais",
    "Despesas com frete de materiais",
    "Investimento em P&D",
    "Manutenção de equipamentos da fábrica",
    "Viagem para feira do setor",
    "Compra de material de escritório",
    "Pagamento de consultoria jurídica"
  ],
  TRANSFER: [
    "Transferência para conta poupança",
    "Transferência para conta corrente",
    "Aplicação em CDB",
    "Resgate de investimento",
    "Transferência entre contas",
    "Depósito em conta investimento",
    "Movimentação de capital de giro",
    "Transferência para reserva de emergência"
  ]
};

// Helper para gerar distribuição normal
function normalRandom(min, max) {
  let u = 0, v = 0;
  while(u === 0) u = Math.random();
  while(v === 0) v = Math.random();
  
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  
  num = (num + 3) / 6;
  num = Math.max(0, Math.min(1, num));
  
  return min + (num * (max - min));
}

// Helper to generate random amount within a range
function getRandomAmount(min, max) {
  const amount = normalRandom(min, max);
  const cents = Math.random() * 0.99;
  
  if (Math.random() < 0.2) {
    if (Math.random() < 0.5) {
      return Number((amount * (1.5 + Math.random())).toFixed(2));
    } else {
      return Number((amount * 0.5 * Math.random()).toFixed(2));
    }
  }
  
  return Number((amount + cents).toFixed(2));
}

// Helper to get random category with amount
function getRandomCategory(type) {
  const categories = CATEGORIES[type];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const amount = getRandomAmount(category.range[0], category.range[1]);
  return { category: category.name, amount };
}

// Helper to get random corporate name
function getRandomCorporateName(type) {
  const names = CORPORATE_NAMES[type];
  return names[Math.floor(Math.random() * names.length)];
}

// Helper to get random document
function getRandomDocument() {
  return Math.random() > 0.2 ? DOCUMENT_TYPES[Math.floor(Math.random() * DOCUMENT_TYPES.length)] : null;
}

// Helper to get random description
function getRandomDescription(type) {
  const descriptions = DESCRIPTIONS[type];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Helper to determine if transaction is recurring
function isRecurring() {
  return Math.random() < 0.3;
}

// Helper to get random recurring interval
function getRandomRecurringInterval() {
  const random = Math.random();
  if (random < 0.6) return "MONTHLY";
  if (random < 0.8) return "WEEKLY";
  if (random < 0.95) return "YEARLY";
  return "DAILY";
}

// Helper to calculate next recurring date
function calculateNextRecurringDate(date, interval) {
  const nextDate = new Date(date);
  
  switch (interval) {
    case "DAILY":
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case "WEEKLY":
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case "MONTHLY":
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case "YEARLY":
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  return nextDate;
}

// Função para dividir um array em lotes menores
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function seedTransactions(targetAccountId = null) {
  try {
    // Obter o usuário autenticado
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Se um ID de conta específico foi fornecido, use-o
    let account;
    if (targetAccountId) {
      account = await db.account.findUnique({
        where: { 
          id: targetAccountId,
          userId: user.id // Garantir que a conta pertence ao usuário
        },
      });
      
      if (!account) {
        throw new Error("Account not found or does not belong to you");
      }
    } else {
      // Caso contrário, use a conta padrão
      account = await db.account.findFirst({
        where: { userId: user.id, isDefault: true },
      });
      
      if (!account) {
        throw new Error("Default account not found. Please create an account first.");
      }
    }
    
    const accountId = account.id;
    
    // Gerar transações para junho de 2025 (dias 1 a 5)
    const transactions = [];
    let totalBalance = parseFloat(account.balance);
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfers = 0;

    // Criar transações para os primeiros 5 dias de junho de 2025
    for (let day = 1; day <= 5; day++) {      
      // Criar data para junho de 2025
      const date = new Date(2025, 5, day); // Junho é mês 5 em JavaScript (0-indexed)
      
      // Gerar 2-4 transações por dia
      const transactionsPerDay = Math.floor(Math.random() * 3) + 2;

      for (let j = 0; j < transactionsPerDay; j++) {
        // Adicionar hora aleatória para mais realismo
        const hours = Math.floor(Math.random() * 14) + 8; // Entre 8h e 22h
        const minutes = Math.floor(Math.random() * 60);
        date.setHours(hours, minutes);
        
        // 30% chance de receita, 50% chance de despesa, 20% chance de transferência
        const random = Math.random();
        let type;
        if (random < 0.3) {
          type = "INCOME";
        } else if (random < 0.8) {
          type = "EXPENSE";
        } else {
          type = "TRANSFER";
        }
        
        const { category, amount } = getRandomCategory(type);
        const recurring = type !== "TRANSFER" ? isRecurring() : false; // Transferências geralmente não são recorrentes
        const recurringInterval = recurring ? getRandomRecurringInterval() : null;
        const nextRecurringDate = recurring ? calculateNextRecurringDate(date, recurringInterval) : null;
        
        // Descrição mais variada
        const baseDescription = getRandomDescription(type);
        const corporateName = getRandomCorporateName(type);
        
        const transaction = {
          type,
          amount,
          description: `${baseDescription} - ${corporateName}`,
          corporateName,
          documento: getRandomDocument(),
          date,
          category,
          isRecurring: recurring,
          recurringInterval,
          nextRecurringDate,
          status: "COMPLETED",
          userId: user.id,
          accountId,
        };

        // Atualizar totais
        if (type === "INCOME") {
          totalIncome += amount;
          totalBalance += amount;
        } else if (type === "EXPENSE") {
          totalExpense += amount;
          totalBalance -= amount;
        } else if (type === "TRANSFER") {
          totalTransfers += amount;
          // Para transferências, não alteramos o saldo total pois é movimentação interna
        }
        
        transactions.push(transaction);
      }
    }

    // Adicionar algumas transferências específicas para os primeiros dias
    const specificTransfers = [
      {
        day: 1,
        description: "Transferência para conta poupança - reserva mensal",
        amount: 25000,
        corporateName: "Banco do Brasil"
      },
      {
        day: 2,
        description: "Aplicação em CDB - investimento de curto prazo",
        amount: 15000,
        corporateName: "Itaú Unibanco"
      },
      {
        day: 3,
        description: "Transferência PIX para fornecedor",
        amount: 8500,
        corporateName: "Bradesco"
      },
      {
        day: 4,
        description: "Resgate de investimento - capital de giro",
        amount: 30000,
        corporateName: "Santander"
      },
      {
        day: 5,
        description: "Transferência entre contas - movimentação interna",
        amount: 12000,
        corporateName: "Nubank"
      }
    ];

    // Adicionar as transferências específicas
    for (const transfer of specificTransfers) {
      const date = new Date(2025, 5, transfer.day); // Junho de 2025
      date.setHours(14, 30); // 14:30
      
      const transaction = {
        type: "TRANSFER",
        amount: transfer.amount,
        description: transfer.description,
        corporateName: transfer.corporateName,
        documento: getRandomDocument(),
        date,
        category: "transferencia",
        isRecurring: false,
        recurringInterval: null,
        nextRecurringDate: null,
        status: "COMPLETED",
        userId: user.id,
        accountId,
      };
      
      totalTransfers += transfer.amount;
      transactions.push(transaction);
    }

    // Adicionar transações recorrentes fixas para junho
    const recurringTransactions = [
      {
        type: "EXPENSE",
        description: "Aluguel do galpão industrial",
        amount: 15000,
        category: "utilidades",
        isRecurring: true,
        recurringInterval: "MONTHLY",
        corporateName: "Imobiliária Industrial SP"
      },
      {
        type: "EXPENSE",
        description: "Folha de pagamento",
        amount: 35000,
        category: "folha-pagamento",
        isRecurring: true,
        recurringInterval: "MONTHLY",
        corporateName: "Usifresa Ltda"
      },
      {
        type: "EXPENSE",
        description: "Plano de saúde dos funcionários",
        amount: 8500,
        category: "folha-pagamento",
        isRecurring: true,
        recurringInterval: "MONTHLY",
        corporateName: "Unimed São Paulo"
      },
      {
        type: "EXPENSE",
        description: "Serviço de contabilidade",
        amount: 3200,
        category: "utilidades",
        isRecurring: true,
        recurringInterval: "MONTHLY",
        corporateName: "Contábil Serrana"
      }
    ];

    // Adicionar as transações recorrentes para junho (apenas no dia 5)
    for (const recTx of recurringTransactions) {
      const date = new Date(2025, 5, 5); // 5 de junho de 2025
      date.setHours(10, 0); // 10:00 AM
      
      const nextRecurringDate = calculateNextRecurringDate(date, recTx.recurringInterval);
      
      const transaction = {
        ...recTx,
        date,
        nextRecurringDate,
        documento: getRandomDocument(),
        status: "COMPLETED",
        userId: user.id,
        accountId,
      };
      
      totalExpense += recTx.amount;
      totalBalance -= recTx.amount;
      transactions.push(transaction);
    }

    // Adicionar uma grande venda no dia 3 para garantir fluxo positivo
    const bigSaleDate = new Date(2025, 5, 3); // 3 de junho de 2025
    bigSaleDate.setHours(11, 30);
    
    const bigSaleAmount = 180000; // Valor fixo para uma grande venda
    
    const bigSaleTransaction = {
      type: "INCOME",
      amount: bigSaleAmount,
      description: "Venda de máquina de papel toalha interfolhado - Projeto Especial Junho",
      corporateName: "Kimberly-Clark Brasil",
      documento: "NF-e 78945",
      date: bigSaleDate,
      category: "vendas-maquinas",
      isRecurring: false,
      status: "COMPLETED",
      userId: user.id,
      accountId,
    };
    
    totalIncome += bigSaleAmount;
    totalBalance += bigSaleAmount;
    transactions.push(bigSaleTransaction);

    // Limpar transações existentes
    await db.transaction.deleteMany({
      where: { accountId },
    });

    // Dividir transações em lotes de 20 para evitar timeout
    const batches = chunkArray(transactions, 20);
    
    // Processar cada lote separadamente
    for (const batch of batches) {
      await db.transaction.createMany({
        data: batch,
      });
    }

    // Atualizar o saldo da conta
    await db.account.update({
      where: { id: accountId },
      data: { balance: totalBalance },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);

    return {
      success: true,
      message: `Criadas ${transactions.length} transações para os primeiros 5 dias de junho de 2025 na conta ${account.name}`,
      totalBalance,
      totalIncome,
      totalExpense,
      totalTransfers,
      profit: totalIncome - totalExpense,
      details: {
        regularTransactions: transactions.length - specificTransfers.length - recurringTransactions.length - 1,
        specificTransfers: specificTransfers.length,
        recurringTransactions: recurringTransactions.length,
        bigSale: 1
      }
    };
  } catch (error) {
    console.error("Error seeding transactions:", error);
    return { success: false, error: error.message };
  }
}

// Função para seed completo do ano (mantida para compatibilidade, mas simplificada)
export async function seedTransactionsFullYear(targetAccountId = null) {
  // Redireciona para a função principal que agora foca em junho
  return await seedTransactions(targetAccountId);
}
