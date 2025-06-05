"use client";
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  DollarSign, 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  List 
} from 'lucide-react';

const WidgetSelector = ({ availableWidgets, onSelect }) => {
  // Definir ícones para cada tipo de widget
  const widgetIcons = {
    'expense-category': <PieChart className="h-6 w-6" />,
    'income-category': <PieChart className="h-6 w-6" />,
    'transaction-history': <BarChart3 className="h-6 w-6" />,
    'account-balance': <DollarSign className="h-6 w-6" />,
    'accounts-overview': <CreditCard className="h-6 w-6" />,
    'budget-progress': <TrendingUp className="h-6 w-6" />,
    'recent-transactions': <List className="h-6 w-6" />,
    'monthly-comparison': <LineChart className="h-6 w-6" />,
    'upcoming-transactions': <Calendar className="h-6 w-6" />,
  };

  // Definir nomes amigáveis para cada tipo de widget
  const widgetNames = {
    'expense-category': 'Categorias de Despesas',
    'income-category': 'Categorias de Receitas',
    'transaction-history': 'Histórico de Transações',
    'account-balance': 'Saldo da Conta',
    'accounts-overview': 'Visão Geral das Contas',
    'budget-progress': 'Progresso do Orçamento',
    'recent-transactions': 'Transações Recentes',
    'monthly-comparison': 'Comparação Mensal',
    'upcoming-transactions': 'Transações Futuras',
  };

  return (
    <div className="grid grid-cols-2 gap-4 py-4">
      {availableWidgets.map(widgetType => (
        <Card 
          key={widgetType}
          className="cursor-pointer hover:border-primary transition-colors"
          onClick={() => onSelect(widgetType)}
        >
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="mb-4 text-primary">
              {widgetIcons[widgetType] || <div className="h-6 w-6 bg-primary/20 rounded-full" />}
            </div>
            <h3 className="text-sm font-medium text-center">
              {widgetNames[widgetType] || widgetType}
            </h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WidgetSelector;