"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ExpenseCategoryChart from '@/app/(main)/dashboard/_components/expense-category-chart';
import IncomeCategoryChart from '@/app/(main)/dashboard/_components/income-category-chart';
import DashboardOverview from '@/app/(main)/dashboard/_components/transaction-overview';
import BudgetProgress from '@/app/(main)/dashboard/_components/budget-progress';
import AccountCard from '@/app/(main)/dashboard/_components/account-card';
import DefaultAccountHistoryChart from '@/app/(main)/dashboard/_components/default-account-history-chart';
import WidgetSettings from './widget-settings';




const WidgetRenderer = ({ widget, isEditing, onSettingsChange, accounts, transactions }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);


  
  // Renderizar o widget com base no tipo
  const renderWidgetContent = () => {

    if (!accounts || !transactions) {
      return <div className="flex items-center justify-center h-full">Carregando...</div>;
    }
    
    const defaultAccount = accounts?.find(a => a.isDefault);
    
    switch (widget.type) {
      case 'expense-category':
        return <ExpenseCategoryChart 
          transactions={transactions || []} 
          accountId={widget.settings.accountId || defaultAccount?.id}
        />;
        
      case 'income-category':
        return <IncomeCategoryChart 
          transactions={transactions || []}
        />;
        
      case 'transaction-history':
        return <DefaultAccountHistoryChart 
          accounts={accounts || []} 
          transactions={transactions || []}
        />;
        
      case 'account-balance':
        const selectedAccount = accounts?.find(a => a.id === widget.settings.accountId) || defaultAccount;
        if (!selectedAccount) return <div>Selecione uma conta nas configurações</div>;
        return <AccountCard account={selectedAccount} />;
        
      case 'accounts-overview':
        return <div className="grid grid-cols-2 gap-4">
          {accounts?.slice(0, 4).map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>;
        
      case 'budget-progress':
        return <BudgetProgress accounts={accounts || []} />;
        
      case 'recent-transactions':
        return <DashboardOverview 
          accounts={accounts || []} 
          transactions={transactions || []}
        />;
        
      default:
        return <div>Widget não reconhecido: {widget.type}</div>;
    }
  };
  
  return (
    <div className="h-full relative">
      {isEditing && (
        <div className="absolute top-0 right-0 z-10">
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Configurações do Widget</DialogTitle>
              </DialogHeader>
              <WidgetSettings 
                widget={widget}
                accounts={accounts || []}
                onSettingsChange={(newSettings) => {
                  onSettingsChange(newSettings);
                  setIsSettingsOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
      
      <div className="h-full">
        {renderWidgetContent()}
      </div>
    </div>
  );
};

export default WidgetRenderer;