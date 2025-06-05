"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, subMonths } from 'date-fns';
import React, { useMemo, useState } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const DATE_RANGES = {
  "1M": { label: "Último mês", days: 30 },
  "3M": { label: "Últimos 3 meses", days: 90 },
  "6M": { label: "Últimos 6 meses", days: 180 },
  "1Y": { label: "Último ano", days: 365 },
};

const IncomeExpenseChart = ({ transactions }) => {
  const [dateRange, setDateRange] = useState("3M");

  const chartData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = subDays(now, range.days);

    // Filtrar transações pelo período selecionado
    const filteredTransactions = transactions.filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= now
    );

    // Agrupar por mês para períodos maiores ou por dia para períodos menores
    const useMonthlyGrouping = range.days > 60;
    
    const grouped = filteredTransactions.reduce((acc, transaction) => {
      // Formatar a data como mês/ano ou dia/mês dependendo do período
      const dateFormat = useMonthlyGrouping ? "MMM/yy" : "dd/MM";
      const dateKey = format(new Date(transaction.date), dateFormat);
      
      if (!acc[dateKey]) {
        acc[dateKey] = { name: dateKey, income: 0, expense: 0 };
      }
      
      if (transaction.type === "INCOME") {
        acc[dateKey].income += transaction.amount;
      } else {
        acc[dateKey].expense += transaction.amount;
      }
      
      return acc;
    }, {});

    // Converter para array e ordenar por data
    return Object.values(grouped).sort((a, b) => {
      // Para ordenação correta, precisamos converter de volta para datas
      // Isso é uma simplificação, pode precisar de ajustes dependendo do formato exato
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);
      return dateA - dateB;
    });
  }, [transactions, dateRange]);

  // Calcular totais para exibição
  const totals = useMemo(() => {
    return chartData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [chartData]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-normal">Receitas vs Despesas</CardTitle>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Selecionar período" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground">Receita Total</p>
            <p className="text-lg font-bold text-green-500">
              R${totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Despesa Total</p>
            <p className="text-lg font-bold text-red-500">
              R${totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground">Saldo</p>
            <p className={`text-lg font-bold ${
              totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              R${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                tickFormatter={(value) => `R$${value}`} 
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value) => [`R$ ${value.toFixed(2)}`, undefined]}
                labelFormatter={(label) => `Período: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                name="Receitas" 
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="expense" 
                name="Despesas" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
