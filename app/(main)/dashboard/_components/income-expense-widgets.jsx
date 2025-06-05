"use client";
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { cn } from '@/lib/utils';

const IncomeExpenseWidgets = ({ transactions, defaultAccount }) => {
  // Filter transactions for the default account
  const accountTransactions = useMemo(() => {
    if (!transactions || !defaultAccount) return [];
    return transactions.filter(t => t.accountId === defaultAccount.id);
  }, [transactions, defaultAccount]);

  // Calculate total income and expenses
  const totals = useMemo(() => {
    if (!accountTransactions.length) return { income: 0, expense: 0 };
    
    return accountTransactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [accountTransactions]);

  // Prepare chart data - last 7 days
  const chartData = useMemo(() => {
    if (!accountTransactions.length) return [];
    
    const now = new Date();
    const days = 7;
    const result = [];
    
    // Initialize data for the last 7 days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStr = format(date, 'dd/MM');
      
      result.push({
        name: dayStr,
        income: 0,
        expense: 0,
      });
    }
    
    // Fill in the actual transaction data
    accountTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const dayDiff = Math.round((now - transactionDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff >= 0 && dayDiff < days) {
        const index = days - 1 - dayDiff;
        if (transaction.type === "INCOME") {
          result[index].income += transaction.amount;
        } else {
          result[index].expense += transaction.amount;
        }
      }
    });
    
    return result;
  }, [accountTransactions]);

  // Calculate monthly trends
  const monthlyTrends = useMemo(() => {
    if (!accountTransactions.length) return { income: 0, expense: 0 };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Current month transactions
    const currentMonthStart = startOfMonth(new Date(currentYear, currentMonth));
    const currentMonthEnd = endOfMonth(new Date(currentYear, currentMonth));
    
    // Last month transactions
    const lastMonthStart = startOfMonth(new Date(lastMonthYear, lastMonth));
    const lastMonthEnd = endOfMonth(new Date(lastMonthYear, lastMonth));
    
    const currentMonthData = { income: 0, expense: 0 };
    const lastMonthData = { income: 0, expense: 0 };
    
    accountTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      
      if (date >= currentMonthStart && date <= currentMonthEnd) {
        if (transaction.type === "INCOME") {
          currentMonthData.income += transaction.amount;
        } else {
          currentMonthData.expense += transaction.amount;
        }
      } else if (date >= lastMonthStart && date <= lastMonthEnd) {
        if (transaction.type === "INCOME") {
          lastMonthData.income += transaction.amount;
        } else {
          lastMonthData.expense += transaction.amount;
        }
      }
    });
    
    // Calculate percentage changes
    const incomeTrend = lastMonthData.income === 0 
      ? 100 
      : ((currentMonthData.income - lastMonthData.income) / lastMonthData.income) * 100;
    
    const expenseTrend = lastMonthData.expense === 0 
      ? 100 
      : ((currentMonthData.expense - lastMonthData.expense) / lastMonthData.expense) * 100;
    
    return {
      income: incomeTrend,
      expense: expenseTrend
    };
  }, [accountTransactions]);

  // Função para formatar valores monetários de forma responsiva
  const formatCurrency = (value) => {
    // Para valores muito grandes, podemos abreviar
    if (value >= 1000000) {
      return `R$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `R$${(value / 1000).toFixed(1)}K`;
    } else {
      return `R$${value.toFixed(2)}`;
    }
  };

  if (!defaultAccount) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Nenhuma conta padrão definida</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 w-90 h-[100%]">
      {/* Income Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">Receitas</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Valor responsivo com classes de tamanho diferentes */}
            <div className="text-xl sm:text-2xl font-bold text-green-500 truncate">
              <span className="hidden lg:inline">{`R$${totals.income.toFixed(2)}`}</span>
              <span className="lg:hidden">{formatCurrency(totals.income)}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyTrends.income > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={cn(
                monthlyTrends.income > 0 ? "text-green-500" : "text-red-500"
              )}>
                {monthlyTrends.income > 0 ? "+" : ""}
                {monthlyTrends.income.toFixed(1)}%
              </span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </div>
          
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#22c55e" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Tooltip 
                  formatter={(value) => [`R$${value.toFixed(2)}`, 'Receita']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <XAxis dataKey="name" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Expense Widget */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-normal">Despesas</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* Valor responsivo com classes de tamanho diferentes */}
            <div className="text-xl sm:text-2xl font-bold text-red-500 truncate">
              <span className="hidden lg:inline">{`R$${totals.expense.toFixed(2)}`}</span>
              <span className="lg:hidden">{formatCurrency(totals.expense)}</span>
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              {monthlyTrends.expense > 0 ? (
                <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
              )}
              <span className={cn(
                monthlyTrends.expense > 0 ? "text-red-500" : "text-green-500"
              )}>
                {monthlyTrends.expense > 0 ? "+" : ""}
                {monthlyTrends.expense.toFixed(1)}%
              </span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </div>
          
          <div className="h-[100px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  dot={false}
                />
                <Tooltip 
                  formatter={(value) => [`R$${value.toFixed(2)}`, 'Despesa']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <XAxis dataKey="name" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeExpenseWidgets;
