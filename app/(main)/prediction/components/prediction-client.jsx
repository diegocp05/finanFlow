"use client";

import React, { useEffect, useState } from 'react';
import { getPredictions, getPredictionAccuracy } from '@/actions/prediction';
import { BarLoader } from 'react-spinners';
import PredictionChart from './prediction-chart';
import PredictionInsights from './prediction-insights';
import PredictionSettings from './prediction-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const PredictionClient = ({ accounts }) => {
  const [predictions, setPredictions] = useState([]);
  const [accuracy, setAccuracy] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [months, setMonths] = useState(3); // Default to 3 months prediction

  useEffect(() => {
    loadPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadPredictions = async () => {
    setLoading(true);
    try {
      // Load predictions
      const result = await getPredictions(months);
      if (result.success) {
        setPredictions(result.data);
      } else {
        toast.error("Erro ao carregar previsões");
      }

      // Load accuracy data
      const accuracyResult = await getPredictionAccuracy();
      if (accuracyResult.success) {
        setAccuracy(accuracyResult.data);
      }
    } catch (error) {
      console.error("Error loading predictions:", error);
      toast.error("Erro ao carregar dados de previsão");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await getPredictions(months);
      if (result.success) {
        setPredictions(result.data);
        toast.success("Previsões atualizadas com sucesso");
      } else {
        toast.error("Erro ao atualizar previsões");
      }
    } catch (error) {
      console.error("Error refreshing predictions:", error);
      toast.error("Erro ao atualizar previsões");
    } finally {
      setRefreshing(false);
    }
  };

  const handleMonthsChange = (newMonths) => {
    setMonths(newMonths);
    // Reload predictions with new month setting
    getPredictions(newMonths).then(result => {
      if (result.success) {
        setPredictions(result.data);
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Previsões Financeiras</CardTitle>
            <CardDescription>Carregando suas previsões...</CardDescription>
          </CardHeader>
          <CardContent>
            <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Previsões Financeiras</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Atualizando...' : 'Atualizar Previsões'}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <PredictionChart predictions={predictions} accounts={accounts} />
        </div>
        <div>
          <PredictionInsights predictions={predictions} />
        </div>
      <PredictionSettings 
        currentMonths={months} 
        onMonthsChange={handleMonthsChange} 
      />

      </div>


      {accuracy.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Precisão das Previsões Anteriores</CardTitle>
            <CardDescription>
              Comparação entre previsões passadas e gastos reais
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* You could add a component here to display accuracy data */}
            <pre className="text-xs overflow-auto">
              {JSON.stringify(accuracy, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionClient;