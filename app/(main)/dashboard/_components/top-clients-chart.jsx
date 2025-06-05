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
      .map(([name, value]) => ({ 
        name, 
        value,
        shortName: name.length > 8 ? `${name.substring(0, 8)}...` : name,
        mobileShortName: name.length > 15 ? `${name.substring(0, 15)}...` : name
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Pegar apenas os top 5

    return sortedClients;
  }, [transactions]);

  // Se não houver clientes, mostrar mensagem
  if (topClients.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm sm:text-base font-normal">
            Top 5 Clientes (em Receita)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6 sm:py-10 text-sm">
            Nenhum cliente encontrado. Adicione transações com nomes de clientes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm sm:text-base font-normal">
          Top 5 Clientes (em Receita)
        </CardTitle>
      </CardHeader>
      <CardContent className="px-2 sm:px-6">
        {/* Gráfico - oculto em mobile */}
        <div className="h-[300px] hidden sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={topClients}
              margin={{ 
                top: 5, 
                right: 30, 
                left: 5, 
                bottom: 5 
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false} 
              />
              <XAxis 
                type="number" 
                tickFormatter={(value) => {
                  if (value >= 1000) {
                    return `R$${(value / 1000).toFixed(0)}k`;
                  }
                  return `R$${value.toFixed(0)}`;
                }}
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                type="category" 
                dataKey="shortName" 
                width={70}
                fontSize={9}
                tick={{ fontSize: 9 }}
                interval={0}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `R$ ${value.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}`, 
                  'Receita Total'
                ]}
                labelFormatter={(label, payload) => {
                  // Mostrar o nome completo no tooltip
                  const fullName = payload?.[0]?.payload?.name || label;
                  return `Cliente: ${fullName}`;
                }}
                contentStyle={{ 
                  fontSize: '12px',
                  padding: '8px',
                  borderRadius: '6px'
                }}
              />
              <Legend 
                wrapperStyle={{ fontSize: '11px' }}
              />
              <Bar 
                dataKey="value" 
                name="Receita Total" 
                fill="#22c55e" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Lista compacta para mobile - sempre visível em mobile */}
        <div className="block sm:hidden">
          <div className="space-y-3">
            {topClients.map((client, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-gray-500 mr-2 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client.mobileShortName}
                      </p>
                      {client.name !== client.mobileShortName && (
                        <p className="text-xs text-gray-500 truncate">
                          {client.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">
                    R$ {client.value.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Estatísticas adicionais */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="text-center p-2 sm:p-3 bg-green-50 rounded-lg">
            <p className="text-muted-foreground text-xs">Total dos Top 5</p>
            <p className="font-bold text-green-600 text-sm sm:text-base">
              R$ {topClients.reduce((sum, client) => sum + client.value, 0).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </p>
          </div>
          <div className="text-center p-2 sm:p-3 bg-blue-50 rounded-lg">
            <p className="text-muted-foreground text-xs">Melhor Cliente</p>
            <p className="font-bold text-blue-600 text-sm sm:text-base truncate" title={topClients[0]?.name}>
              {topClients[0]?.shortName || 'N/A'}
            </p>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-xs text-muted-foreground text-center">
            Os 5 clientes que mais geraram receita para o seu negócio
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopClientsChart;
