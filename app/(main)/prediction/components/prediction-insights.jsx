"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDown, ArrowUp, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const PredictionInsights = ({ predictions }) => {
  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Insights de Previsão</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            Gere previsões para ver insights
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Função para capitalizar a primeira letra
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Ordenar previsões por data
  const sortedPredictions = [...predictions].sort((a, b) => 
    new Date(a.month) - new Date(b.month)
  );
  
  // Calcular tendência geral
  const firstMonth = sortedPredictions[0];
  const lastMonth = sortedPredictions[sortedPredictions.length - 1];
  const trend = lastMonth.total - firstMonth.total;
  const trendPercentage = (trend / firstMonth.total) * 100;
  
  // Identificar categorias com maior crescimento e declínio
  const categoryTrends = {};
  
  // Para cada categoria presente na primeira previsão
  Object.entries(firstMonth.categories).forEach(([category, data]) => {
    // Verificar se a categoria também existe na última previsão
    if (lastMonth.categories[category]) {
      const firstAmount = data.amount;
      const lastAmount = lastMonth.categories[category].amount;
      const categoryTrend = lastAmount - firstAmount;
      const categoryTrendPercentage = (categoryTrend / firstAmount) * 100;
      
      categoryTrends[category] = {
        trend: categoryTrend,
        percentage: categoryTrendPercentage,
        firstAmount,
        lastAmount
      };
    }
  });
  
  // Ordenar categorias por tendência
  const sortedCategoryTrends = Object.entries(categoryTrends)
    .sort((a, b) => b[1].percentage - a[1].percentage);
  
  // Obter categorias com maior crescimento e declínio
  const topGrowingCategories = sortedCategoryTrends
    .filter(([_, data]) => data.trend > 0)
    .slice(0, 3);
  
  const topDecliningCategories = sortedCategoryTrends
    .filter(([_, data]) => data.trend < 0)
    .sort((a, b) => a[1].percentage - b[1].percentage)
    .slice(0, 3);
  
  // Calcular mês com maior gasto previsto
  const maxSpendingMonth = sortedPredictions.reduce(
    (max, prediction) => prediction.total > max.total ? prediction : max,
    sortedPredictions[0]
  );
  
  return (
    <Card className="w-medium">
      <CardHeader>
        <CardTitle>Insights de Previsão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 text-sm">
        {/* Tendência geral */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tendência Geral de Gastos</h3>
          <div className="flex items-center gap-2">
            {trend > 0 ? (
              <TrendingUp className="h-5 w-5 text-red-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-green-500" />
            )}
            <span className={cn(
              "font-bold",
              trend > 0 ? "text-red-500" : "text-green-500"
            )}>
              {trend > 0 ? "+" : ""}
              {trendPercentage.toFixed(1)}% 
              ({trend > 0 ? "+" : ""}R${Math.abs(trend).toFixed(2)})
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {trend > 0 
              ? "Seus gastos tendem a aumentar nos próximos meses." 
              : "Seus gastos tendem a diminuir nos próximos meses."}
          </p>
        </div>
        
        {/* Mês com maior gasto previsto */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Mês com Maior Gasto Previsto</h3>
          <p className="text-lg font-bold">
            {capitalizeFirstLetter(format(new Date(maxSpendingMonth.month), 'MMMM yyyy', { locale: ptBR }))}
            <span className="ml-2 text-red-500">
              R${maxSpendingMonth.total.toFixed(2)}
            </span>
          </p>
        </div>
        
        {/* Categorias com maior crescimento */}
        {topGrowingCategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categorias com Maior Aumento</h3>
            <ul className="space-y-2">
              {topGrowingCategories.map(([category, data]) => (
                <li key={category} className="flex justify-between items-center">
                  <span className="capitalize">{category}</span>
                  <div className="flex items-center gap-1 text-red-500">
                    <ArrowUp className="h-4 w-4" />
                    <span>{data.percentage.toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Categorias com maior declínio */}
        {topDecliningCategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Categorias com Maior Redução</h3>
            <ul className="space-y-2">
              {topDecliningCategories.map(([category, data]) => (
                <li key={category} className="flex justify-between items-center">
                  <span className="capitalize">{category}</span>
                  <div className="flex items-center gap-1 text-green-500">
                    <ArrowDown className="h-4 w-4" />
                    <span>{Math.abs(data.percentage).toFixed(1)}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionInsights;
