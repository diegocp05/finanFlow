"use client";
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

const PredictionSettings = ({ currentMonths = 3, onMonthsChange }) => {
  // Default values for months options if not provided
  const monthsOptions = [1, 3, 6, 12];
  
  const handleMonthsChange = (value) => {
    if (onMonthsChange) {
      onMonthsChange(value);
    }
  };

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Configurações de Previsão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">Período de Previsão</h3>
          <div className="flex flex-wrap gap-2">
            {/* Make sure monthsOptions is defined before mapping */}
            {monthsOptions && monthsOptions.map((months) => (
              <Button
                key={months}
                variant={currentMonths === months ? "default" : "outline"}
                size="sm"
                onClick={() => handleMonthsChange(months)}
              >
                {months} {months === 1 ? 'mês' : 'meses'}
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium mb-2">Ajustar Período (1-12 meses)</h3>
          <Slider
            defaultValue={[currentMonths]}
            min={1}
            max={12}
            step={1}
            onValueChange={(values) => handleMonthsChange(values[0])}
          />
          <div className="text-center mt-2">
            <span className="text-sm font-medium">{currentMonths} {currentMonths === 1 ? 'mês' : 'meses'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictionSettings;
