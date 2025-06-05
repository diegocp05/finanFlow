import React from 'react';
import { getUserAccounts } from '@/actions/dashboard';
import { getDashBoardData } from '@/actions/dashboard';




import SimulatorContainer from './components/simulator-container';

const SimulatorPage = async () => {
  const accounts = await getUserAccounts();

  
  return (
    <div className="space-y-8 px-5">
      <div>
        <h1 className="text-5xl sm:text-6xl font-bold gradient-title">
          Simulador Financeiro
        </h1>
        <p className="text-muted-foreground mt-2">
          Simule diferentes cenários financeiros e veja o impacto nas suas finanças
        </p>
      </div>
      <SimulatorContainer accounts={accounts} />
    </div>
  );
};

export default SimulatorPage;