"use server";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getDashboardLayouts() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    const layouts = await db.dashboardLayout.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });
    
    return { success: true, data: layouts };
  } catch (error) {
    console.error("Error fetching dashboard layouts:", error);
    return { success: false, error: error.message };
  }
}

export async function saveDashboardLayout(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    let layout;
    
    if (data.id) {
      // Atualizar layout existente
      layout = await db.dashboardLayout.update({
        where: {
          id: data.id,
          userId: user.id,
        },
        data: {
          name: data.name,
          layout: data.layout,
          widgets: data.widgets,
          isDefault: data.isDefault || false,
        },
      });
    } else {
      // Criar novo layout
      // Se este for o primeiro layout ou estiver marcado como padrão
      const existingLayouts = await db.dashboardLayout.findMany({
        where: { userId: user.id },
      });
      
      const shouldBeDefault = existingLayouts.length === 0 || data.isDefault;
      
      // Se este layout deve ser padrão, desmarcar outros layouts padrão
      if (shouldBeDefault) {
        await db.dashboardLayout.updateMany({
          where: { 
            userId: user.id,
            isDefault: true,
          },
          data: { isDefault: false },
        });
      }
      
      layout = await db.dashboardLayout.create({
        data: {
          name: data.name,
          layout: data.layout,
          widgets: data.widgets,
          isDefault: shouldBeDefault,
          userId: user.id,
        },
      });
    }
    
    revalidatePath("/dashboard/custom");
    return { success: true, data: layout };
  } catch (error) {
    console.error("Error saving dashboard layout:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteDashboardLayout(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Verificar se o layout existe e pertence ao usuário
    const layout = await db.dashboardLayout.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });
    
    if (!layout) {
      throw new Error("Layout not found");
    }
    
    // Se este é o layout padrão, não permitir exclusão se for o único
    if (layout.isDefault) {
      const layoutCount = await db.dashboardLayout.count({
        where: { userId: user.id },
      });
      
      if (layoutCount <= 1) {
        throw new Error("Não é possível excluir o único dashboard");
      }
      
      // Se não for o único, definir outro como padrão
      const anotherLayout = await db.dashboardLayout.findFirst({
        where: {
          userId: user.id,
          id: { not: id },
        },
      });
      
      if (anotherLayout) {
        await db.dashboardLayout.update({
          where: { id: anotherLayout.id },
          data: { isDefault: true },
        });
      }
    }
    
   // Excluir o layout
    await db.dashboardLayout.delete({
      where: { id },
    });
    
    revalidatePath("/dashboard/custom");
    return { success: true };
  } catch (error) {
    console.error("Error deleting dashboard layout:", error);
    return { success: false, error: error.message };
  }
}

export async function setDefaultDashboardLayout(id) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");
    
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    // Desmarcar todos os layouts padrão
    await db.dashboardLayout.updateMany({
      where: { 
        userId: user.id,
        isDefault: true,
      },
      data: { isDefault: false },
    });
    
    // Definir o novo layout padrão
    const layout = await db.dashboardLayout.update({
      where: {
        id,
        userId: user.id,
      },
      data: { isDefault: true },
    });
    
    revalidatePath("/dashboard/custom");
    return { success: true, data: layout };
  } catch (error) {
    console.error("Error setting default dashboard layout:", error);
    return { success: false, error: error.message };
  }
}