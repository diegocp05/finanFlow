"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart as LineChartIcon, TrendingUp } from 'lucide-react';

const CHART_TYPES = {
  BAR: "bar",
  LINE: "line",
  AREA: "area"
};

const ImpactChart = ({ simulationResult }) => {
  const [chartType, setChartType] = useState(CHART_TYPES.LINE);
  
  if (!simulationResult) {
    return null;
  }
  
  const { type, data, name } = simulationResult;
  
  // Preparar dados para o gráfico
  const prepareChartData = () => {
    // Para planos de economia, mostrar projeção de patrimônio
    if (type === "savings" && data.netWorthProjection) {
      return data.netWorthProjection.map(item => ({
        month: item.month,
        "Patrimônio Projetado": item.amount
      }));
    }
    
    // Para outros tipos, comparar gastos originais vs. simulados
    return data.originalPredictions.map((original, index) => {
      const simulated = data.simulatedPredictions[index];
      return {
        month: format(new Date(original.month), 'MMM yyyy'),
        "Cenário Original": original.total,
        "Cenário Simulado": simulated.total,
        "Diferença": simulated.total - original.total
      };
    });
  };
  
  const chartData = prepareChartData();
  
  const renderChart = () => {
    if (type === "savings") {
      // Renderizar gráfico de crescimento patrimonial para planos de economia
      return (
        <ResponsiveContainer width="100%" height={400}>
          {chartType === CHART_TYPES.AREA ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$${value.toFixed(2)}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Patrimônio Projetado" 
                fill="#8884d8" 
                stroke="#8884d8" 
                fillOpacity={0.3}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Patrimônio Projetado" 
                stroke="#8884d8" 
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      );
    }
    
    // Renderizar gráfico de comparação para outros tipos de simulação
    switch (chartType) {
      case CHART_TYPES.BAR:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$${value.toFixed(2)}`} />
              <Legend />
              <Bar dataKey="Cenário Original" fill="#8884d8" />
              <Bar dataKey="Cenário Simulado" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.LINE:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$${value.toFixed(2)}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Cenário Original" 
                stroke="#8884d8" 
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="Cenário Simulado" 
                stroke="#82ca9d" 
                strokeWidth={2} 
              />
            </LineChart>
          </ResponsiveContainer>
        );
        
      case CHART_TYPES.AREA:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `R$${value.toFixed(2)}`} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Cenário Original" 
                fill="#8884d8" 
                stroke="#8884d8" 
                fillOpacity={0.3} 
              />
              <Area 
                type="monotone" 
                dataKey="Cenário Simulado" 
                fill="#82ca9d" 
                stroke="#82ca9d" 
                fillOpacity={0.3} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Impacto ao Longo do Tempo</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-md">
            <Button 
              variant={chartType === CHART_TYPES.BAR ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType(CHART_TYPES.BAR)}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === CHART_TYPES.LINE ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType(CHART_TYPES.LINE)}
            >
              <LineChartIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={chartType === CHART_TYPES.AREA ? "default" : "ghost"}
              size="sm"
              className="h-8 px-2"
              onClick={() => setChartType(CHART_TYPES.AREA)}
            >
              <TrendingUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ImpactChart;