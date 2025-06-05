"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useMemo, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const TIME_PERIODS = {
  "6M": { label: "Últimos 6 meses", months: 6 },
  "1Y": { label: "Último ano", months: 12 },
  "2Y": { label: "Últimos 2 anos", months: 24 },
};

const DefaultAccountHistoryChart = ({ accounts, transactions }) => {
  const [timePeriod, setTimePeriod] = useState("6M");
  
  const chartData = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    
    const period = TIME_PERIODS[timePeriod];
    const now = new Date();
    
    // Criar array com os últimos N meses
    const monthsArray = Array.from({ length: period.months }, (_, i) => {
      const monthDate = subMonths(now, i);
      return {
        month: format(monthDate, 'MMM/yy', { locale: ptBR }),
        date: monthDate,
        totalBalance: 0,
        totalIncome: 0,
        totalExpense: 0
      };
    }).reverse();
    
    // Calcular o saldo inicial para cada conta
    const accountInitialBalances = {};
    
    accounts.forEach(account => {
      let initialBalance = account.balance;
      
      // Filtrar transações da conta
      const accountTransactions = transactions.filter(t => t.accountId === account.id);
      
      // Subtrair todas as transações para obter o saldo inicial
      accountTransactions.forEach(transaction => {
        if (transaction.type === "INCOME") {
          initialBalance -= transaction.amount;
        } else {
          initialBalance += transaction.amount;
        }
      });
      
      accountInitialBalances[account.id] = initialBalance;
    });
    
    // Preencher os dados do gráfico
    const result = monthsArray.map(monthData => {
      const monthStart = startOfMonth(monthData.date);
      const monthEnd = endOfMonth(monthData.date);
      
      // Objeto para armazenar o saldo de cada conta para este mês
      const accountBalances = { ...accountInitialBalances };
      let monthTotalIncome = 0;
      let monthTotalExpense = 0;
      
      // Para cada conta, calcular o saldo para este mês
      accounts.forEach(account => {
        // Filtrar transações da conta para este mês
        const monthTransactions = transactions.filter(t => {
          const transactionDate = new Date(t.date);
          return t.accountId === account.id && 
                 transactionDate >= monthStart && 
                 transactionDate <= monthEnd;
        });
        
        // Atualizar o saldo da conta com as transações deste mês
        monthTransactions.forEach(transaction => {
          if (transaction.type === "INCOME") {
            accountBalances[account.id] += transaction.amount;
            monthTotalIncome += transaction.amount;
          } else {
            accountBalances[account.id] -= transaction.amount;
            monthTotalExpense += transaction.amount;
          }
        });
      });
      
      // Calcular o saldo total de todas as contas
      const totalBalance = Object.values(accountBalances).reduce((sum, balance) => sum + balance, 0);
      
      // Criar objeto de resultado para este mês
      return {
        name: monthData.month,
        totalBalance: parseFloat(totalBalance.toFixed(2)),
        totalIncome: parseFloat(monthTotalIncome.toFixed(2)),
        totalExpense: parseFloat(monthTotalExpense.toFixed(2))
      };
    });
    
    return result;
  }, [accounts, transactions, timePeriod]);
  
  // Calcular o saldo total atual de todas as contas
  const currentTotalBalance = useMemo(() => {
    return accounts.reduce((sum, account) => sum + account.balance, 0);
  }, [accounts]);
  
  // Calcular totais de receita e despesa para o período
  const periodTotals = useMemo(() => {
    if (chartData.length === 0) return { income: 0, expense: 0 };
    
    return chartData.reduce(
      (acc, month) => ({
        income: acc.income + month.totalIncome,
        expense: acc.expense + month.totalExpense
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);
  
  if (accounts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">Histórico de Todas as Contas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">
            Nenhuma conta encontrada
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-base font-normal">
            Histórico de Todas as Contas
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Evolução do saldo, receitas e despesas ao longo do tempo
          </p>
        </div>
        <Select defaultValue={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(TIME_PERIODS).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 50, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `R$${value.toLocaleString('pt-BR', { 
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0 
                })}`}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value, name) => {
                  // Formatar o nome da conta para exibição em português
                  if (name === "totalBalance") {
                    return [`R$ ${value.toFixed(2)}`, "Saldo Total"];
                  }
                  if (name === "totalIncome") {
                    return [`R$ ${value.toFixed(2)}`, "Receita Total"];
                  }
                  if (name === "totalExpense") {
                    return [`R$ ${value.toFixed(2)}`, "Despesa Total"];
                  }
                  return [`R$ ${value.toFixed(2)}`, name];
                }}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend 
                formatter={(value) => {
                  // Traduzir as legendas para português
                  if (value === "totalBalance") return "Saldo Total";
                  if (value === "totalIncome") return "Receita Total";
                  if (value === "totalExpense") return "Despesa Total";
                  return value;
                }}
              />
              
              {/* Área para o saldo total */}
              <Area 
                type="monotone" 
                dataKey="totalBalance" 
                name="totalBalance" 
                stroke="#8884d8" 
                fill="#8884d8" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
              
              {/* Área para receita total */}
              <Area 
                type="monotone" 
                dataKey="totalIncome" 
                name="totalIncome" 
                stroke="#22c55e" 
                fill="#22c55e"
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
              
              {/* Área para despesa total */}
              <Area 
                type="monotone" 
                dataKey="totalExpense" 
                name="totalExpense" 
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.1}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Saldo Total Atual:</span>
              <span className="font-bold">R${parseFloat(currentTotalBalance).toFixed(2)}</span>
            </div>
            {chartData.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="font-medium">Variação ({TIME_PERIODS[timePeriod].label}):</span>
                <span className={`font-bold ${
                  currentTotalBalance - chartData[0].totalBalance >= 0 
                    ? "text-green-500" 
                    : "text-red-500"
                }`}>
                  {(currentTotalBalance - chartData[0].totalBalance) >= 0 ? "+" : ""}
                  R${(currentTotalBalance - chartData[0].totalBalance).toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium">Receita Total ({TIME_PERIODS[timePeriod].label}):</span>
              <span className="font-bold text-green-500">R${periodTotals.income.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Despesa Total ({TIME_PERIODS[timePeriod].label}):</span>
              <span className="font-bold text-red-500">R${periodTotals.expense.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DefaultAccountHistoryChart;
