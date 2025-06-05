import React from 'react';
import { getUserAccounts, getDashBoardData } from '@/actions/dashboard';
import { getDashboardLayouts } from '@/actions/dashboard-layout';
import DashboardContainer from './components/dashboard-container';

const CustomDashboardPage = async () => {
  const accounts = await getUserAccounts();
  const transactions = await getDashBoardData();
  const layoutsResult = await getDashboardLayouts();
  
  const availableWidgets = [
    'expense-category',
    'income-category',
    'transaction-history',
    'account-balance',
    'accounts-overview',
    'budget-progress',
    'recent-transactions',
    'monthly-comparison',
    'upcoming-transactions',
  ];
  
  return (
    <div className="space-y-8 px-5">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title">
          Dashboard Personalizado
        </h1>
        <p className="text-muted-foreground mt-2">
          Arraste e solte widgets para personalizar seu dashboard
        </p>
      </div>
      
      <DashboardContainer 
        initialLayouts={layoutsResult.success ? layoutsResult.data : []}
        availableWidgets={availableWidgets}
        accounts={accounts}
        transactions={transactions}
      />
    </div>
  );
};

export default CustomDashboardPage;