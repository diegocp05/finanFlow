"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
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

  export async function createAccount(data) {
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
  
      // Check if this is the user's first account
      const existingAccounts = await db.account.findMany({
        where: { userId: user.id },
      });
  
      // If it's the first account, make it default regardless of user input
      // If not, use the user's preference
      const shouldBeDefault =
        existingAccounts.length === 0 ? true : data.isDefault;
  
      // If this account should be default, unset other default accounts
      if (shouldBeDefault) {
        await db.account.updateMany({
          where: { userId: user.id, isDefault: true },
          data: { isDefault: false },
        });
      }

      const account = await db.account.create({
        data: {
          ...data,
          balance: balanceFloat,
          targetGoal: targetGoalFloat,
          userId: user.id,
          isDefault: shouldBeDefault, // Override the isDefault based on our logic
        },
      });
  
      // Serialize the account before returning
      const serializedAccount = serializeTransaction(account);
  
      revalidatePath("/dashboard");
      return { success: true, data: serializedAccount };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  export async function getUserAccounts() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: {
        createdAt: "desc",},
        include:{
          _count:{
            select:{
              transactions: true,
            }
          }
        }
    });


    
    // Make sure serializeTransaction properly handles all Decimal fields
    const serializedAccounts = accounts.map(serializeTransaction);
    return serializedAccounts;
  }
    export async function getDashBoardData() {
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
        orderBy: {
          date: "desc",
        },
      });
  
      // Verificar se existem previsões recentes
      const recentPrediction = await db.prediction.findFirst({
        where: { 
          userId: user.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Última semana
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
  
      // Se não houver previsões recentes, gerar automaticamente
      if (!recentPrediction) {
        try {
          const serializedTransactions = transactions.map(serializeTransaction);
          const predictions = generatePredictions(serializedTransactions, 3);
        
          // Salvar previsões no banco de dados
          for (const prediction of predictions) {
            const categoriesData = Object.entries(prediction.categories).map(([category, data]) => ({
              category,
              amount: data.amount,
              confidence: data.confidence
            }));
          
            await db.prediction.upsert({
              where: {
                userId_month_accountId: {
                  userId: user.id,
                  month: prediction.date.toISOString(),
                  accountId: "all"
                }
              },
              update: {
                total: prediction.total,
                categories: categoriesData
              },
              create: {
                userId: user.id,
                month: prediction.date.toISOString(),
                accountId: "all",
                total: prediction.total,
                categories: categoriesData
              }
            });
          }
        } catch (error) {
          console.error("Error generating automatic predictions:", error);
        }
      }
  
      return transactions.map(serializeTransaction);
  }