"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { 
  simulateNewExpense, 
  simulateNewIncome, 
  simulateCategoryReduction,
  simulateSavingsPlan
} from "@/lib/simulator";

const serializeTransaction = (obj) => {
  const serialized = { ...obj };
  if (obj.balance && typeof obj.balance === 'object' && obj.balance.toNumber) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount && typeof obj.amount === 'object' && obj.amount.toNumber) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
};

/**
 * Obtém transações do usuário para simulação
 */
export async function getTransactionsForSimulation() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });
    
    return transactions.map(serializeTransaction);
  } catch (error) {
    console.error("Error fetching transactions for simulation:", error);
    throw error;
  }
}

/**
 * Simula o impacto de uma nova despesa
 */
export async function simulateExpenseImpact(expenseData, months = 12) {
  try {
    const transactions = await getTransactionsForSimulation();
    const result = simulateNewExpense(transactions, expenseData, months);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Expense simulation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Simula o impacto de uma nova receita
 */
export async function simulateIncomeImpact(incomeData, months = 12) {
  try {
    const transactions = await getTransactionsForSimulation();
    const result = simulateNewIncome(transactions, incomeData, months);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Income simulation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Simula o impacto de reduzir gastos em uma categoria
 */
export async function simulateCategoryReductionImpact(category, reductionPercentage, months = 12) {
  try {
    const transactions = await getTransactionsForSimulation();
    const result = simulateCategoryReduction(transactions, category, reductionPercentage, months);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Category reduction simulation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Simula um plano de economia
 */
export async function simulateSavingsPlanImpact(savingsPlan, months = 12) {
  try {
    const transactions = await getTransactionsForSimulation();
    const result = simulateSavingsPlan(transactions, savingsPlan, months);
    
    return { success: true, data: result };
  } catch (error) {
    console.error("Savings plan simulation error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Salva um cenário simulado
 */
export async function saveScenario(scenarioData) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const scenario = await db.scenario.create({
      data: {
        name: scenarioData.name,
        description: scenarioData.description,
        type: scenarioData.type,
        parameters: scenarioData.parameters,
        results: scenarioData.results,
        userId: user.id
      }
    });
    
    revalidatePath("/simulator");
    return { success: true, data: scenario };
  } catch (error) {
    console.error("Error saving scenario:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Obtém cenários salvos do usuário
 */
export async function getUserScenarios() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const scenarios = await db.scenario.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    
    return scenarios;
  } catch (error) {
    console.error("Error fetching user scenarios:", error);
    throw error;
  }
}