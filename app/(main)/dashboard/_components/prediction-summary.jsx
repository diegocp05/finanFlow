"use client";
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPredictions } from '@/actions/prediction';
import { ArrowRight, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PredictionSummary = ({ transactions }) => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Função para capitalizar a primeira letra
  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const result = await getPredictions(1); // Apenas próximo mês
        if (result.success) {
          setPredictions(result.data);
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPredictions();
  }, []);
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Previsão de Gastos
          </CardTitle>
          <CardDescription>
            Carregando previsões...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!predictions || predictions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Previsão de Gastos
          </CardTitle>
          <CardDescription>
            Sem previsões disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/prediction')}
          >
            Gerar Previsões
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  // Obter previsão para o próximo mês
  const nextMonthPrediction = predictions[0];
  
  // Calcular gastos do mês atual
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthExpenses = transactions
    .filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && 
             date.getFullYear() === currentYear &&
             t.type === "EXPENSE";
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calcular diferença percentual
  const difference = nextMonthPrediction.total - currentMonthExpenses;
  const percentageDiff = currentMonthExpenses > 0 
    ? (difference / currentMonthExpenses) * 100 
    : 0;
  
  // Identificar categorias com maior aumento previsto
  const categoryDiffs = [];
  
  Object.entries(nextMonthPrediction.categories).forEach(([category, data]) => {
    // Calcular gastos atuais nesta categoria
    const currentCategoryExpenses = transactions
      .filter(t => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && 
               date.getFullYear() === currentYear &&
               t.type === "EXPENSE" &&
               t.category === category;
      })
      .reduce((sum, t) => sum + t.amount, 0);
    
    const categoryDiff = data.amount - currentCategoryExpenses;
    const categoryPercentageDiff = currentCategoryExpenses > 0 
      ? (categoryDiff / currentCategoryExpenses) * 100 
      : 0;
    
    categoryDiffs.push({
      category,
      difference: categoryDiff,
      percentageDiff: categoryPercentageDiff,
      confidence: data.confidence
    });
  });
  
  // Ordenar por maior diferença percentual
  categoryDiffs.sort((a, b) => Math.abs(b.percentageDiff) - Math.abs(a.percentageDiff));
  
  // Pegar as 2 categorias com maior variação
  const topChangingCategories = categoryDiffs.slice(0, 2);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Previsão para {capitalizeFirstLetter(format(new Date(nextMonthPrediction.month), 'MMMM', { locale: ptBR }))}
        </CardTitle>
        <CardDescription>
          Baseado nos seus padrões de gastos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm">Gasto previsto:</span>
          <span className="text-lg font-bold">
            R${nextMonthPrediction.total.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {difference > 0 ? (
            <TrendingUp className="h-5 w-5 text-red-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-green-500" />
          )}
          <span className={cn(
            "text-sm font-medium",
            difference > 0 ? "text-red-500" : "text-green-500"
          )}>
            {difference > 0 ? "+" : ""}
            {percentageDiff.toFixed(1)}% comparado ao mês atual
          </span>
        </div>
        
        {topChangingCategories.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Principais mudanças previstas:</h3>
            <ul className="space-y-1">
              {topChangingCategories.map(({ category, difference, percentageDiff }) => (
                <li key={category} className="flex justify-between items-center text-sm">
                  <span className="capitalize">{category}</span>
                  <span className={cn(
                    difference > 0 ? "text-red-500" : "text-green-500"
                  )}>
                    {difference > 0 ? "+" : ""}
                    {percentageDiff.toFixed(1)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="w-full mt-2"
          onClick={() => router.push('/prediction')}
        >
          Ver análise completa
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default PredictionSummary;
