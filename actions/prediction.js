"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generatePredictions } from "@/lib/prediction";
import { revalidatePath } from "next/cache";

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
 * Obtém previsões de gastos para o usuário atual
 * @param {Number} months - Número de meses para prever
 * @param {String} accountId - ID da conta (opcional)
 * @returns {Object} - Dados de previsão
 */
export async function getPredictions(months = 3, accountId = null) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Obter transações históricas
    const whereClause = {
      userId: user.id,
      ...(accountId ? { accountId } : {})
    };
    
    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });
    
    const serializedTransactions = transactions.map(serializeTransaction);
    
    // Gerar previsões
    const predictions = generatePredictions(serializedTransactions, months);
    
    // Salvar previsões no banco de dados
    await savePredictions(user.id, predictions, accountId);
    
    return { success: true, data: predictions };
  } catch (error) {
    console.error("Prediction error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Salva previsões no banco de dados
 * @param {String} userId - ID do usuário
 * @param {Array} predictions - Previsões geradas
 * @param {String} accountId - ID da conta (opcional)
 */
async function savePredictions(userId, predictions, accountId) {
  try {
    // Para cada previsão mensal
    for (const prediction of predictions) {
      // Converter categorias para formato adequado para armazenamento
      const categoriesData = Object.entries(prediction.categories).map(([category, data]) => ({
        category,
        amount: data.amount,
        confidence: data.confidence
      }));
      
      // Criar ou atualizar previsão no banco
      await db.prediction.upsert({
        where: {
          userId_month_accountId: {
            userId,
            month: prediction.date.toISOString(),
            accountId: accountId || "all"
          }
        },
        update: {
          total: prediction.total,
          categories: categoriesData
        },
        create: {
          userId,
          month: prediction.date.toISOString(),
          accountId: accountId || "all",
          total: prediction.total,
          categories: categoriesData
        }
      });
    }
    
    // Move revalidation outside of the render phase
    // These will be called when the function is used in client actions
    // but not during server rendering
    if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build') {
      // Only run during non-rendering server operations
      revalidatePath("/prediction");
      revalidatePath("/dashboard");
    }
  } catch (error) {
    console.error("Error saving predictions:", error);
  }
}

/**
 * Compara previsões anteriores com gastos reais
 * @returns {Object} - Dados de comparação
 */
export async function getPredictionAccuracy() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Obter previsões anteriores
    const pastPredictions = await db.prediction.findMany({
      where: {
        userId: user.id,
        month: {
          lt: new Date().toISOString() // Apenas previsões para meses já passados
        }
      }
    });
    
    // Obter transações reais para os mesmos períodos
    const comparisonData = [];
    
    for (const prediction of pastPredictions) {
      const predictionDate = new Date(prediction.month);
      const startOfPredictionMonth = new Date(predictionDate.getFullYear(), predictionDate.getMonth(), 1);
      const endOfPredictionMonth = new Date(predictionDate.getFullYear(), predictionDate.getMonth() + 1, 0);
      
      // Consultar transações reais do período
      const whereClause = {
        userId: user.id,
        type: "EXPENSE",
        date: {
          gte: startOfPredictionMonth,
          lte: endOfPredictionMonth
        }
      };
      
      if (prediction.accountId !== "all") {
        whereClause.accountId = prediction.accountId;
      }
      
      const actualTransactions = await db.transaction.findMany({
        where: whereClause
      });
      
      // Calcular totais reais por categoria
      const actualByCategory = {};
      let actualTotal = 0;
      
      actualTransactions.forEach(transaction => {
        const amount = transaction.amount.toNumber();
        actualTotal += amount;
        
        if (!actualByCategory[transaction.category]) {
          actualByCategory[transaction.category] = 0;
        }
        
        actualByCategory[transaction.category] += amount;
      });
      
      // Comparar previsão com realidade
      const comparisonByCategory = {};
      
      // Para cada categoria prevista
      prediction.categories.forEach(catPrediction => {
        const actualAmount = actualByCategory[catPrediction.category] || 0;
        const predictedAmount = catPrediction.amount;
        const difference = actualAmount - predictedAmount;
        const percentageDiff = predictedAmount > 0 
          ? (difference / predictedAmount) * 100 
          : 0;
        
        comparisonByCategory[catPrediction.category] = {
          predicted: predictedAmount,
          actual: actualAmount,
          difference,
          percentageDiff
        };
      });
      
      // Adicionar categorias que não foram previstas
      Object.keys(actualByCategory).forEach(category => {
        if (!comparisonByCategory[category]) {
          comparisonByCategory[category] = {
            predicted: 0,
            actual: actualByCategory[category],
            difference: actualByCategory[category],
            percentageDiff: 100
          };
        }
      });
      
      comparisonData.push({
        month: prediction.month,
        predictedTotal: prediction.total,
        actualTotal,
        difference: actualTotal - prediction.total,
        percentageDiff: prediction.total > 0 
          ? ((actualTotal - prediction.total) / prediction.total) * 100 
          : 0,
        categories: comparisonByCategory,
        accountId: prediction.accountId
      });
    }
    
    return { success: true, data: comparisonData };
  } catch (error) {
    console.error("Prediction accuracy error:", error);
    return { success: false, error: error.message };
  }
}