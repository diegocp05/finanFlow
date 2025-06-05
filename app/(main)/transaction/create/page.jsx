import { getUserAccounts } from '@/actions/dashboard';
import { defaultCategories } from '@/data/categories';
import React from 'react';
import AddTransactionForm from '../components/transaction-form';
import { getTransaction } from '@/actions/transaction';

const AddTransactionPage = async ({searchParams}) => {
  const accounts = await getUserAccounts();
  // Verificar tanto editId quanto edit para compatibilidade
  const editId = searchParams?.editId || searchParams?.edit;

  console.log("Edit ID:", editId);

  let initialData = null;
  if (editId) {
    try {
      const transaction = await getTransaction(editId);
      initialData = transaction;
      console.log("Transaction loaded:", initialData);
    } catch (error) {
      console.error("Error loading transaction:", error);
    }
  }
  
  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editId ? "Editar" : "Adicionar"} Transação
      </h1>

      <AddTransactionForm 
        accounts={accounts} 
        categories={defaultCategories} 
        editMode={!!editId} 
        initialData={initialData}
      />
    </div>
  )
}

export default AddTransactionPage;
