"use client";
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

const WidgetSettings = ({ widget, accounts, onSettingsChange }) => {
  const renderSettingsFields = () => {
    switch (widget.type) {
      case 'expense-category':
      case 'account-balance':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountId">Conta</Label>
              <Select 
                value={widget.settings.accountId || ''} 
                onValueChange={(value) => onSettingsChange({ accountId: value })}
              >
                <SelectTrigger id="accountId">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 'transaction-history':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timeRange">Período de Tempo</Label>
              <Select 
                value={widget.settings.timeRange || '30'} 
                onValueChange={(value) => onSettingsChange({ timeRange: value })}
              >
                <SelectTrigger id="timeRange">
                  <SelectValue placeholder="Selecione um período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 3 meses</SelectItem>
                  <SelectItem value="180">Últimos 6 meses</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showIncome">Mostrar Receitas</Label>
                <Switch 
                  id="showIncome"
                  checked={widget.settings.showIncome !== false}
                  onCheckedChange={(checked) => onSettingsChange({ showIncome: checked })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="showExpense">Mostrar Despesas</Label>
                <Switch 
                  id="showExpense"
                  checked={widget.settings.showExpense !== false}
                  onCheckedChange={(checked) => onSettingsChange({ showExpense: checked })}
                />
              </div>
            </div>
          </div>
        );
        
      case 'recent-transactions':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transactionCount">Número de Transações</Label>
              <Slider
                id="transactionCount"
                defaultValue={[widget.settings.transactionCount || 5]}
                min={3}
                max={10}
                step={1}
                onValueChange={([value]) => onSettingsChange({ transactionCount: value })}
              />
              <div className="text-center text-sm text-muted-foreground">
                {widget.settings.transactionCount || 5} transações
              </div>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center text-muted-foreground py-4">
            Este widget não possui configurações personalizáveis.
          </div>
        );
    }
  };
  
  return (
    <div className="space-y-6 py-4">
      {renderSettingsFields()}
      
      <Button 
        className="w-full" 
        onClick={() => onSettingsChange(widget.settings)}
      >
        Aplicar Configurações
      </Button>
    </div>
  );
};

export default WidgetSettings;