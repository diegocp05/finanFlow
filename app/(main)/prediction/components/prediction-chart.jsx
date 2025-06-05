"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import React, { useState } from 'react';
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
  Line
} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart3, LineChart as LineChartIcon } from 'lucide-react';

const CHART_TYPES = {
  BAR: "bar",
  LINE: "line"
};

const PredictionChart = ({ predictions, accounts }) => {
  const [selectedAccountId, setSelectedAccountId] = useState("all");
  const [chartType, setChartType] = useState(CHART_TYPES.BAR);
  
  // Filtrar previsões pela conta selecionada
  const filteredPredictions = predictions.filter(p => 
    selectedAccountId === "all" || p.accountId === selectedAccountId
  );
  
  // Preparar dados para o gráfico
  const chartData = filteredPredictions.map(prediction => {
    const date = new Date(prediction.month);
    return {
      month: format(date, 'MMM yyyy', { locale: ptBR }),
      total: prediction.total,
      ...Object.entries(prediction.categories).reduce((acc, [category, data]) => {
        acc[category] = data.amount;
        return acc;
      }, {})
    };
  });
  
  // Obter todas as categorias únicas para mostrar no gráfico
  const allCategories = new Set();
  filteredPredictions.forEach(prediction => {
    Object.keys(prediction.categories).forEach(category => {
      allCategories.add(category);
    });
  });
  
  // Cores para as categorias atualizadas da Usifresa
  const categoryColors = {
    // Categorias de despesa da Usifresa
    "materia-prima": "#ef4444", // vermelho
    "folha-pagamento": "#f97316", // laranja
    "maquinario": "#84cc16", // lima
    "utilidades": "#06b6d4", // ciano
    "transporte": "#8b5cf6", // violeta
    "impostos": "#f43f5e", // rosa
    "marketing": "#ec4899", // rosa
    "pesquisa-desenvolvimento": "#14b8a6", // teal
    "viagens-negocios": "#0ea5e9", // azul-céu
    "manutencao-fabrica": "#64748b", // cinza
    
    // Categorias de receita da Usifresa
    "vendas-maquinas": "#22c55e", // verde
    "servicos-manutencao": "#06b6d4", // ciano
    "pecas-reposicao": "#6366f1", // índigo
    "projetos-especiais": "#ec4899", // rosa
    "consultoria-tecnica": "#f59e0b", // âmbar
    
    // Manter algumas categorias genéricas para compatibilidade
    "housing": "#ef4444",
    "transportation": "#f97316",
    "groceries": "#84cc16",
    "utilities": "#06b6d4",
    "entertainment": "#8b5cf6",
    "food": "#f43f5e",
    "shopping": "#ec4899",
    "healthcare": "#14b8a6",
    "education": "#6366f1",
    "personal": "#d946ef",
    "travel": "#0ea5e9",
    "insurance": "#64748b",
    "gifts": "#f472b6",
    "bills": "#fb7185",
    "other-expense": "#94a3b8",
  };
  
  // Função para obter nome amigável da categoria
  const getCategoryDisplayName = (categoryId) => {
    const categoryNames = {
      // Categorias de despesa da Usifresa
      "materia-prima": "Matéria Prima",
      "folha-pagamento": "Folha de Pagamento",
      "maquinario": "Maquinário",
      "utilidades": "Utilidades",
      "transporte": "Transporte",
      "impostos": "Impostos",
      "marketing": "Marketing",
      "pesquisa-desenvolvimento": "P&D",
      "viagens-negocios": "Viagens",
      "manutencao-fabrica": "Manutenção",
      
      // Categorias de receita da Usifresa
      "vendas-maquinas": "Vendas de Máquinas",
      "servicos-manutencao": "Serviços",
      "pecas-reposicao": "Peças de Reposição",
      "projetos-especiais": "Projetos Especiais",
      "consultoria-tecnica": "Consultoria",
    };
    
    return categoryNames[categoryId] || categoryId;
  };
  
  const renderChart = () => {
    if (chartData.length === 0) {
      return <p className="text-center text-muted-foreground p-4">Sem previsões disponíveis</p>;
    }
    
    if (chartType === CHART_TYPES.BAR) {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={chartData}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `R${value.toLocaleString('pt-BR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}`} 
            />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${value.toFixed(2)}`, 
                getCategoryDisplayName(name)
              ]} 
            />
            <Legend formatter={(value) => getCategoryDisplayName(value)} />
            {Array.from(allCategories).map(category => (
              <Bar 
                key={category} 
                dataKey={category} 
                name={category} 
                stackId="a" 
                fill={categoryColors[category] || "#8884d8"} 
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    } 
    else {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={chartData}
            margin={{ left: 50, right: 20, top: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `R${value.toLocaleString('pt-BR', { 
                minimumFractionDigits: 0,
                maximumFractionDigits: 0 
              })}`} 
            />
            <Tooltip 
              formatter={(value, name) => [
                `R$ ${value.toFixed(2)}`, 
                name === "total" ? "Total Previsto" : getCategoryDisplayName(name)
              ]} 
            />
            <Legend formatter={(value) => value === "total" ? "Total Previsto" : getCategoryDisplayName(value)} />
            <Line 
              type="monotone" 
              dataKey="total" 
              name="total" 
              stroke="#8884d8" 
              strokeWidth={2} 
            />
            {Array.from(allCategories).map(category => (
              <Line 
                key={category} 
                type="monotone" 
                dataKey={category} 
                name={category} 
                stroke={categoryColors[category] || "#82ca9d"} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Previsão de Gastos Futuros</CardTitle>
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
          </div>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione uma conta" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as contas</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default PredictionChart;
