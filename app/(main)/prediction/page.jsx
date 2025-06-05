import React from 'react';
import { getUserAccounts } from '@/actions/dashboard';
import PredictionClient from './components/prediction-client';

async function PredictionPage() {
  // Fetch accounts to pass to the client component
  const accounts = await getUserAccounts();
  
  return (
    <div className="px-5">
      <PredictionClient accounts={accounts} />
    </div>
  );
}

export default PredictionPage;
