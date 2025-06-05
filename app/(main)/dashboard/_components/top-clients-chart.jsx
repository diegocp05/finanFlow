"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TopClientsChart = ({ transactions }) => {
  const topClients = useMemo(() => {
    // Filtrar apenas transações de receita que têm nome de cliente
    const incomeTransactions = transactions.filter(
      (t) => t.type === "INCOME" && t.corporateName
    );

    // Agrupar por cliente e somar os valores
    const clientTotals = incomeTransactions.reduce((acc, transaction) => {
      const clientName = transaction.corporateName;
      if (!acc[clientName]) {
        acc[clientName] = 0;
      }
      acc[clientName] += transaction.amount;
      return acc;
    }, {});

    // Converter para array e ordenar por valor (decrescente)
    const sortedClients = Object.entries(clientTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Pegar apenas os top 5

    return sortedClients;
  }, [transactions]);

  // Se não houver clientes, mostrar mensagem
  if (topClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-normal">Top 5 Clientes (em Receita)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-10">
            Nenhum cliente encontrado. Adicione transações com nomes de clientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal">Top 5 Clientes (em Receita)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topClients}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={120}
                tickFormatter={(value) => 
                  value.length > 15 ? `${value.substring(0, 15)}...` : value
                }
              />
              <Tooltip 
                formatter={(value) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Receita Total']}
                labelFormatter={(label) => `Cliente: ${label}`}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                name="Receita Total" 
                fill="#22c55e" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4">
          <p className="text-xs text-muted-foreground text-center">
            Os 5 clientes que mais geraram receita para o seu negócio
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopClientsChart;
