"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, getDaysInMonth, startOfMonth, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const AccountChart = ({ transactions }) => {
    const filteredData = useMemo(() => {
        if (!transactions || transactions.length === 0) return [];

        // Determinar o mês das transações (usar o primeiro mês encontrado)
        const firstTransaction = transactions[0];
        const referenceDate = new Date(firstTransaction.date);
        const year = referenceDate.getFullYear();
        const month = referenceDate.getMonth();
        
        // Obter número de dias no mês
        const daysInMonth = getDaysInMonth(referenceDate);
        
        // Criar array com todos os dias do mês
        const dailyData = [];
        for (let day = 1; day <= daysInMonth; day++) {
            dailyData.push({
                day: day,
                date: `${day}`,
                income: 0,
                expense: 0
            });
        }
        
        // Agrupar transações por dia
        transactions.forEach(transaction => {
            const transactionDate = new Date(transaction.date);
            const transactionDay = transactionDate.getDate();
            const transactionMonth = transactionDate.getMonth();
            const transactionYear = transactionDate.getFullYear();
            
            // Verificar se a transação é do mesmo mês/ano de referência
            if (transactionMonth === month && transactionYear === year) {
                const dayIndex = transactionDay - 1; // Array é 0-indexed
                
                if (transaction.type === "INCOME") {
                    dailyData[dayIndex].income += transaction.amount;
                } else {
                    dailyData[dayIndex].expense += transaction.amount;
                }
            }
        });
        
        return dailyData;
    }, [transactions]);

    const totals = useMemo(() => {
        return filteredData.reduce(
            (acc, day) => ({
                income: acc.income + day.income,
                expense: acc.expense + day.expense,
            }),
            { income: 0, expense: 0 }
        );
    }, [filteredData]);

    if (filteredData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-base font-normal">Visão Geral da Transação</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada para esta conta
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Determinar o nome do mês para o título
    const firstTransaction = transactions[0];
    const monthName = format(new Date(firstTransaction.date), 'MMMM yyyy', { locale: ptBR });
    const capitalizedMonthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-normal">
                    Transações Diárias - {capitalizedMonthName}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-around mb-6 text-sm">
                    <div className="text-center">
                        <p className="text-muted-foreground">Receita Total</p>
                        <p className="text-lg font-bold text-green-500">
                            R${totals.income.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-muted-foreground">Despesa Total</p>
                        <p className="text-lg font-bold text-red-500">
                            R${totals.expense.toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-muted-foreground">Líquido</p>
                        <p className={`text-lg font-bold ${
                            totals.income - totals.expense >= 0 ? "text-green-500" : "text-red-500"
                            }`}
                        >
                            R${(totals.income - totals.expense).toFixed(2)}</p>
                    </div>
                </div>
                <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={filteredData}
                            margin={{
                                top: 10,
                                right: 10,
                                left: 10,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis 
                                dataKey="date" 
                                fontSize={10}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis 
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `R$ ${value}`} 
                            />
                            <Tooltip 
                                formatter={(value, name) => [
                                    `R$ ${value.toFixed(2)}`, 
                                    name === 'income' ? 'Receita' : 'Despesa'
                                ]}
                                labelFormatter={(label) => `Dia ${label}`}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="#22c55e" name="Receita" radius={[2, 2, 0, 0]} />
                            <Bar dataKey="expense" fill="#ef4444" name="Despesa" radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                
                {/* Estatísticas adicionais */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-muted-foreground">Dias com Receitas</p>
                        <p className="font-bold text-blue-600">
                            {filteredData.filter(day => day.income > 0).length}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-muted-foreground">Dias com Despesas</p>
                        <p className="font-bold text-red-600">
                            {filteredData.filter(day => day.expense > 0).length}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-muted-foreground">Maior Receita</p>
                        <p className="font-bold text-green-600">
                            R${Math.max(...filteredData.map(day => day.income)).toFixed(2)}
                        </p>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <p className="text-muted-foreground">Maior Despesa</p>
                        <p className="font-bold text-orange-600">
                            R${Math.max(...filteredData.map(day => day.expense)).toFixed(2)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountChart;
