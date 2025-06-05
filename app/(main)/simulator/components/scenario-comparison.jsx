"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScenarioComparison = ({ simulationResult }) => {
  if (!simulationResult) {
    return null;
  }
  
  const { type, data, name } = simulationResult;
  
  // Calcular diferenças entre cenário original e simulado
  const calculateDifferences = () => {
    const originalTotal = data.originalPredictions.reduce((sum, month) => sum + month.total, 0);
    const simulatedTotal = data.simulatedPredictions.reduce((sum, month) => sum + month.total, 0);
    
    const difference = simulatedTotal - originalTotal;
    const percentageDiff = originalTotal > 0 
      ? (difference / originalTotal) * 100 
      : 0;
    
    // Para planos de economia, calcular valor final acumulado
    let finalSavings = null;
    if (type === "savings" && data.netWorthProjection) {
      finalSavings = data.netWorthProjection[data.netWorthProjection.length - 1].amount;
    }
    
    return {
      originalTotal,
      simulatedTotal,
      difference,
      percentageDiff,
      finalSavings
    };
  };
  
  const differences = calculateDifferences();
  const isPositiveOutcome = (type === "expense" || type === "reduction") 
    ? differences.difference < 0 
    : differences.difference > 0;
  
  // Renderizar detalhes específicos com base no tipo de simulação
  const renderTypeSpecificDetails = () => {
    switch (type) {
      case "expense":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Detalhes da Nova Despesa</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Descrição:</span>
                <p>{data.newExpense.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Mensal:</span>
                <p className="text-red-500">R${data.newExpense.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <p className="capitalize">{data.newExpense.category}</p>
              </div>
            </div>
          </div>
        );
        
      case "income":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Detalhes da Nova Receita</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Descrição:</span>
                <p>{data.newIncome.description}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Mensal:</span>
                <p className="text-green-500">R${data.newIncome.amount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <p className="capitalize">{data.newIncome.category}</p>
              </div>
            </div>
          </div>
        );
        
      case "reduction":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Detalhes da Redução de Gastos</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Categoria:</span>
                <p className="capitalize">{data.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Percentual de Redução:</span>
                <p className="text-green-500">{data.reductionPercentage}%</p>
              </div>
            </div>
          </div>
        );
        
      case "savings":
        return (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Detalhes do Plano de Economia</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Valor Inicial:</span>
                <p>R${data.savingsPlan.initialAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Mensal:</span>
                <p>R${data.savingsPlan.monthlyAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Taxa de Juros:</span>
                <p>{data.savingsPlan.interestRate}% a.a.</p>
              </div>
              <div>
                <span className="text-muted-foreground">Valor Final Projetado:</span>
                <p className="text-green-500 font-bold">
                  R${differences.finalSavings.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Impacto Total</p>
            <div className="flex items-center gap-2 mt-1">
              {isPositiveOutcome ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
              <span className={cn(
                "text-lg font-bold",
                isPositiveOutcome ? "text-green-500" : "text-red-500"
              )}>
                {differences.difference > 0 ? "+" : ""}
                R${Math.abs(differences.difference).toFixed(2)}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Variação Percentual</p>
            <div className="flex items-center justify-end gap-1 mt-1">
              {differences.difference > 0 ? (
                <ArrowUp className={cn(
                  "h-4 w-4",
                  isPositiveOutcome ? "text-green-500" : "text-red-500"
                )} />
              ) : (
                <ArrowDown className={cn(
                  "h-4 w-4",
                  isPositiveOutcome ? "text-green-500" : "text-red-500"
                )} />
              )}
              <span className={cn(
                "text-lg font-bold",
                isPositiveOutcome ? "text-green-500" : "text-red-500"
              )}>
                {Math.abs(differences.percentageDiff).toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        
        {renderTypeSpecificDetails()}
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Comparação de Cenários</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Cenário Original</p>
              <p className="text-lg font-bold">R${differences.originalTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Cenário Simulado</p>
              <p className="text-lg font-bold">R${differences.simulatedTotal.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {isPositiveOutcome 
            ? "Este cenário tem um impacto positivo nas suas finanças."
            : "Este cenário tem um impacto negativo nas suas finanças."}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScenarioComparison;