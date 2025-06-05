"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react'
import ExpenseCategoryChart from './expense-category-chart';

const DashboardOverview = ({accounts, transactions}) => {
    const [selectedAccountId, setSelectedAccountId] = useState(accounts.find((a) => a.isDefault)?.id || accounts[0]?.id);
    
    const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId);

    const recentTransactions = accountTransactions.sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <Card className="text-sm w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-normal">Transações Recentes</CardTitle>
        <Select
          value={selectedAccountId}
          onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={account.id}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-sm">
            {recentTransactions.length === 0? (
                <p className="text-center text-muted-foreground py-4">Nenhuma transação recente</p>
            ) : (
                recentTransactions.map((transaction) => (
                    <div key={transaction.id}
                    className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{transaction.description || "Transação sem título"}</p>
                            <p className="text-sm text-muted-foreground">{format(new Date(transaction.date), "PP")}</p> 
                            {transaction.documento && (
                              <p className="text-xs text-muted-foreground">Doc: {transaction.documento}</p>
                            )}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={cn("flex items-center",
                                    transaction.type === "EXPENSE" ? "text-red-500 bg-red-50 rounded-md " : "text-green-500 bg-green-50 rounded-md"
                                )}>
                                    {transaction.type === "EXPENSE" ?(
                                        <ArrowDownRight className="mr-1 h-4 w-4" />
                                    ): (
                                        <ArrowUpRight className="mr-1 h-4 w-4" />
                                    )}
                                    R${transaction.amount.toFixed(2)}
                                </div>
                            </div>
                    </div>
                ))
            )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardOverview;
