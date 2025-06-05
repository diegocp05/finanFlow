import {date, z} from "zod";

export const accountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["CURRENT", "SAVINGS"]),
  balance: z.string().min(1,"Saldo é obrigatório"),
  targetGoal: z.string().optional(),
  isDefault: z.boolean().default(false),
});

export const transactionSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.string().min(1,"Valor é obrigatório"),
  description: z.string().min(1,"Descrição é obrigatória"),
  date: z.date(),
  accountId: z.string().min(1,"Conta é obrigatória"),
  category: z.string().min(1,"Categoria é obrigatória"),
  corporateName: z.string().optional(), // Nome do cliente/fornecedor
  documento: z.string().optional(), // Novo campo para documento
  isRecurring: z.boolean().default(false),
  recurringInterval: z
  .enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"])
  .optional(),
}).superRefine((data, ctx) => {
  if (data.isRecurring && !data.recurringInterval) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Recorrência é obrigatória quando a transação é recorrente",
      path: ["recurringInterval"],
    });
  }
})
