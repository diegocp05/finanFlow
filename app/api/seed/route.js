import { seedTransactions } from "@/actions/seed";  
import { seedTransactionsFullYear } from "@/actions/seed"; 

export async function GET() {  
  const result = await seedTransactions();  
  return Response.json(result);  
}  