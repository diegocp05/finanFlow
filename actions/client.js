"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getClients() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Make sure db.client exists
    if (!db.client) {
      console.error("Client model not found in Prisma client");
      return [];
    }

    const clients = await db.client.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
    });

    return clients;
  } catch (error) {
    console.error("Error fetching clients:", error);
    // Return empty array instead of throwing to prevent page from crashing
    return [];
  }
}

export async function createClient(name) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const client = await db.client.create({
      data: {
        name,
        userId: user.id,
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/transaction/create");
    
    return client;
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: error.message };
  }
}
