import { getAccountWithTransactions } from '@/actions/account'
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import TransactionTable from '../_components/transaction-table';
import { BarLoader } from 'react-spinners';
import AccountChart from '../_components/account-chart';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

const AccountsPage = async ({params}) => {
    const accountData = await getAccountWithTransactions(params.id);

    if(!accountData){
        notFound();
    }

    const {transactions, ...account} = accountData;
    
    // Calcular a porcentagem de progresso para a meta
    const progressPercentage = account.targetGoal 
      ? Math.min(100, (parseFloat(account.balance) / parseFloat(account.targetGoal)) * 100) 
      : null;
      
  return (
    <div className="space-y-8 px-5">
        <div className="flex gap-4 items-end justify-between">
        
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title capitalize">Conta: {account.name}
        <p className="text-sm text-muted-foreground text-left ml-1">Conta {account.type.charAt(0) + account.type.slice(1).toLowerCase()}</p>
    </h1>
        <div className="text-right pb-2"> 
            <div className="text-xl sm:text-2xl font-bold">R${parseFloat(account.balance).toFixed(2)}</div>
            <p className="text-sm text-muted-foreground">{account._count.transactions} Transações</p>
        </div>
        
    </div>

    {account.targetGoal && (
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-blue-500" />
            <span className="font-medium">Meta da Conta</span>
          </div>
          <span className="text-sm font-medium">
            {progressPercentage.toFixed(0)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2 mb-2" />
        <div className="flex justify-between text-sm">
          <span>Saldo Atual: R${parseFloat(account.balance).toFixed(2)}</span>
          <span>Meta: R${parseFloat(account.targetGoal).toFixed(2)}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {progressPercentage >= 100 
            ? "Meta atingida! Parabéns!" 
            : `Faltam R${(parseFloat(account.targetGoal) - parseFloat(account.balance)).toFixed(2)} para atingir sua meta.`}
        </p>
      </div>
    )}

    <Suspense
            fallback= {<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
                <AccountChart transactions = {transactions} />
        </Suspense>

        <Suspense
            fallback= {<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}>
                <TransactionTable transactions={transactions} />
        </Suspense>
        
    
    </div>
  )
}   

export default AccountsPage;
