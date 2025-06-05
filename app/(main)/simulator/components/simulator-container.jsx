"use client";
import React, { useState } from 'react';
import SimulatorForm from './simulator-form';
import ScenarioComparison from './scenario-comparison';
import ImpactChart from './impact-chart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveScenario } from '@/actions/simulator';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { toast } from 'sonner';

const SimulatorContainer = ({ accounts }) => {
  const [simulationResult, setSimulationResult] = useState(null);
  const [savingScenario, setSavingScenario] = useState(false);
  
  const handleSimulationResult = (result) => {
    setSimulationResult(result);
  };
  
  const handleSaveScenario = async () => {
    if (!simulationResult) return;
    
    setSavingScenario(true);
    try {
      const scenarioData = {
        name: simulationResult.name,
        description: `Simulação de ${getScenarioTypeName(simulationResult.type)}`,
        type: simulationResult.type,
        parameters: simulationResult.data.type === "savings" 
          ? simulationResult.data.savingsPlan 
          : simulationResult.data.type === "expense" 
            ? simulationResult.data.newExpense
            : simulationResult.data.type === "income"
              ? simulationResult.data.newIncome
              : { 
                  category: simulationResult.data.category, 
                  reductionPercentage: simulationResult.data.reductionPercentage 
                },
        results: {
          originalPredictions: simulationResult.data.originalPredictions,
          simulatedPredictions: simulationResult.data.simulatedPredictions,
          ...(simulationResult.data.netWorthProjection && { 
            netWorthProjection: simulationResult.data.netWorthProjection 
          })
        }
      };
      
      const result = await saveScenario(scenarioData);
      
      if (result.success) {
        toast.success("Cenário salvo com sucesso!");
      } else {
        toast.error(result.error || "Erro ao salvar cenário");
      }
    } catch (error) {
      console.error("Error saving scenario:", error);
      toast.error("Ocorreu um erro ao salvar o cenário");
    } finally {
      setSavingScenario(false);
    }
  };
  
  const getScenarioTypeName = (type) => {
    switch (type) {
      case "expense": return "Nova Despesa";
      case "income": return "Nova Receita";
      case "reduction": return "Redução de Gastos";
      case "savings": return "Plano de Economia";
      default: return "Cenário";
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <SimulatorForm 
          accounts={accounts} 
          onSimulationResult={handleSimulationResult}
        />
      </div>
      
      <div className="lg:col-span-2">
        {simulationResult ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{simulationResult.name}</h2>
              {/* <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveScenario}
                disabled={savingScenario}
              >
                <Save className="mr-2 h-4 w-4" />
                {savingScenario ? "Salvando..." : "Salvar Cenário"}
              </Button> */}
            </div>
            
            <Tabs defaultValue="comparison">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="comparison">Comparação</TabsTrigger>
                <TabsTrigger value="chart">Gráfico de Impacto</TabsTrigger>
              </TabsList>
              <TabsContent value="comparison" className="mt-4">
                <ScenarioComparison simulationResult={simulationResult} />
              </TabsContent>
              <TabsContent value="chart" className="mt-4">
                <ImpactChart simulationResult={simulationResult} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-muted-foreground py-12">
              Configure um cenário no formulário ao lado e execute a simulação para ver os resultados aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorContainer;