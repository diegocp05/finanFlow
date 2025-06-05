"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function checkUser() {
    try {
      const { userId } = await auth();
      if (!userId) return null;
    
      const user = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    
      if (!user) {
        // Create user if not exists
        const { userId: clerkUserId, emailAddresses } = await auth();
        const email = emailAddresses[0]?.emailAddress;
      
        if (email) {
          await db.user.create({
            data: {
              clerkUserId,
              email,
            },
          });
        }
      }
    
      return user;
    } catch (error) {
      console.error("Error checking user:", error);
      return null;
    }
}