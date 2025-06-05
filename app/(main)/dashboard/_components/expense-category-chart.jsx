"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, isWithinInterval, startOfYear, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import React, { useState } from 'react'
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const COLORS = [  
  "#FF6B6B",  
  "#4EDCD4",  
  "#45B7D1",  
  "#96CEB4",  
  "#FFEEAD",  
  "#D4A5A5",  
  "#9F8DAA",
  "#FF9A8B",
  "#88D8B0",
  "#B5B9FF"
];  

const PERIODS = {
  DAY: "day",
  FIFTEEN_DAYS: "15days",
  MONTH: "month",
  THREE_MONTHS: "3months",
  SIX_MONTHS: "6months",
  YEAR: "year"
};

const CHART_TYPES = {
  PIE: "pie",
  BAR: "bar"
};

const ExpenseCategoryChart = ({ transactions, accountId }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(PERIODS.MONTH);
    const [chartType, setChartType] = useState(CHART_TYPES.PIE);
    
    const accountTransactions = transactions?.filter(
      (t) => t.accountId === accountId) || [];
    
    const currentDate = new Date();
    
    const getFilteredExpenses = () => {
      return accountTransactions.filter((t) => {
        const transactionDate = new Date(t.date);
        
        if (t.type !== "EXPENSE") return false;
        
        switch (selectedPeriod) {
          case PERIODS.DAY:
            return (
              transactionDate.getDate() === currentDate.getDate() &&
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          case PERIODS.FIFTEEN_DAYS:
            const fifteenDaysAgo = subDays(currentDate, 15);
            return isWithinInterval(transactionDate, {
              start: fifteenDaysAgo,
              end: currentDate
            });
          case PERIODS.MONTH:
            return (
              transactionDate.getMonth() === currentDate.getMonth() &&
              transactionDate.getFullYear() === currentDate.getFullYear()
            );
          case PERIODS.THREE_MONTHS:
            const threeMonthsAgo = subMonths(currentDate, 3);
            return isWithinInterval(transactionDate, {
              start: threeMonthsAgo,
              end: currentDate
            });
          case PERIODS.SIX_MONTHS:
            const sixMonthsAgo = subMonths(currentDate, 6);
            return isWithinInterval(transactionDate, {
              start: sixMonthsAgo,
              end: currentDate
            });
          case PERIODS.YEAR:
            const startOfCurrentYear = startOfYear(currentDate);
            return isWithinInterval(transactionDate, {
              start: startOfCurrentYear,
              end: currentDate
            });
          default:
            return false;
        }
      });
    };

    const filteredExpenses = getFilteredExpenses();

    // Dados para visualização por categoria
    const expensesByCategory = filteredExpenses.reduce((acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += transaction.amount;
      return acc;
    }, {});

    const chartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
      name: category,
      value: amount,
    })).sort((a, b) => b.value - a.value); // Ordenar por valor decrescente

    // Calcular total de despesas
    const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0);

    const getPeriodTitle = () => {
      switch (selectedPeriod) {
        case PERIODS.DAY:
          return "Despesas do Dia";
        case PERIODS.FIFTEEN_DAYS:
          return "Despesas dos Últimos 15 Dias";
        case PERIODS.MONTH:
          return "Despesas do Mês";
        case PERIODS.THREE_MONTHS:
          return "Despesas dos Últimos 3 Meses";
        case PERIODS.SIX_MONTHS:
          return "Despesas dos Últimos 6 Meses";
        case PERIODS.YEAR:
          return "Despesas do Ano";
        default:
          return "Relatório de Despesas";
      }
    };

    // Componente de tooltip personalizado para o gráfico de pizza
    const CustomPieTooltip = ({ active, payload }) => {
      if (active && payload && payload.length) {
        const data = payload[0];
        const categoryName = data.name;
        const value = data.value;
        const percentage = ((value / totalExpenses) * 100).toFixed(1);
        
        // Contar quantas transações existem nesta categoria
        const transactionCount = filteredExpenses.filter(t => t.category === categoryName).length;
        
        return (
          <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
            <p className="font-medium text-gray-900 capitalize">{categoryName}</p>
            <p className="text-red-600 font-medium">R$ {value.toFixed(2)}</p>
            <p className="text-gray-500 text-sm">{percentage}% do total</p>
            <p className="text-gray-500 text-sm">{transactionCount} transações</p>
          </div>
        );
      }
      return null;
    };

    const renderChart = () => {
      if (chartData.length === 0) {
        return <p className="text-center text-muted-foreground p-4">Sem despesas neste período</p>;
      }

      if (chartType === CHART_TYPES.PIE) {
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">Total de despesas:</span>
                <span className="ml-2 text-red-500 font-bold">R$ {totalExpenses.toFixed(2)}</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <PieChart width={730} height={250}>
                <Pie 
                  data={chartData} 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={100} 
                  fill="#8884d8" 
                  dataKey="value" 
                  label={({name, value}) => `${name}: R$${value.toFixed(0)}`}
                  labelLine={true}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Top 3 categorias */}
            {chartData.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">Principais categorias de despesa:</h4>
                <div className="space-y-2">
                  {chartData.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm capitalize">{item.name}</span>
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">R$ {item.value.toFixed(2)}</span>
                        <span className="text-gray-500 ml-2">
                          ({((item.value / totalExpenses) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <div>
                <span className="font-medium">Total de despesas:</span>
                <span className="ml-2 text-red-500 font-bold">R$ {totalExpenses.toFixed(2)}</span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={280}>
              <BarChart 
                width={730} 
                height={250} 
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={(value) => `R$${value.toLocaleString('pt-BR', { 
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  })}`}
                />
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="value" name="Valor" fill="#FF6B6B">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }
    };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{getPeriodTitle()}</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button 
              variant={chartType === CHART_TYPES.PIE ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType(CHART_TYPES.PIE)}
            >
              <PieChartIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === CHART_TYPES.BAR ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType(CHART_TYPES.BAR)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="text-xs">Período</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
              <div className="space-y-1">
                <Button 
                  variant={selectedPeriod === PERIODS.DAY ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.DAY)}
                >
                  Hoje
                </Button>
                <Button 
                  variant={selectedPeriod === PERIODS.FIFTEEN_DAYS ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.FIFTEEN_DAYS)}
                >
                  Últimos 15 dias
                </Button>
                <Button 
                  variant={selectedPeriod === PERIODS.MONTH ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.MONTH)}
                >
                  Este mês
                </Button>
                <Button 
                  variant={selectedPeriod === PERIODS.THREE_MONTHS ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.THREE_MONTHS)}
                >
                  Últimos 3 meses
                </Button>
                <Button 
                  variant={selectedPeriod === PERIODS.SIX_MONTHS ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.SIX_MONTHS)}
                >
                  Últimos 6 meses
                </Button>
                <Button 
                  variant={selectedPeriod === PERIODS.YEAR ? "default" : "ghost"} 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setSelectedPeriod(PERIODS.YEAR)}
                >
                  Este ano
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="p-0 pb-5 px-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ExpenseCategoryChart;
