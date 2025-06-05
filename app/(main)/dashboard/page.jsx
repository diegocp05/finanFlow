import { getDashBoardData, getUserAccounts } from '@/actions/dashboard'
import CreateAccountDrawer from '@/components/create-account-drawer'
import { getCurrentBudget } from '@/actions/budget'
import { LayoutDashboard, TrendingUp, PieChart, CreditCard, BarChart2, Plus, ArrowRight, Wallet } from 'lucide-react'
import { React, Suspense } from 'react'
import AccountCard from './_components/account-card'
import BudgetProgress from './_components/budget-progress'
import DashboardOverview from './_components/transaction-overview'
import AccountsYearFilter from './_components/accounts-year-filter'
import IncomeExpenseChart from './_components/income-expense-chart'
import IncomeCategoryChart from './_components/income-category-chart'
import DefaultAccountHistoryChart from './_components/default-account-history-chart'
import ExpenseCategoryChart from './_components/expense-category-chart'
import PredictionSummary from './_components/prediction-summary'
import IncomeExpenseWidgets from './_components/income-expense-widgets'
import TopClientsChart from './_components/top-clients-chart'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

async function DashboardPage() {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((account) => account.isDefault);
  const defaultAccountId = defaultAccount?.id;

  let budgetData = null;
  if (defaultAccount){
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  const transactions = await getDashBoardData();
  
  // Loader para componentes em suspense
  const SuspenseLoader = () => (
    <div className="p-8 text-center bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-blue-100 animate-pulse">
      <div className="flex flex-col items-center">
        <div className="h-8 w-3/4 bg-blue-200/50 rounded-full mb-4"></div>
        <div className="h-64 w-full bg-gradient-to-r from-blue-100/50 to-indigo-100/50 rounded-lg"></div>
      </div>
    </div>
  );
  
  return (
    <div className="px-5 text-sm">
      {/* Header com design moderno */}
      <div className="py-6 mb-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center">
          <LayoutDashboard className="mr-2 h-8 w-8" />
          Dashboard Financeiro
        </h1>
        <p className="text-blue-100">Acompanhe suas finanças em um só lugar</p>
      </div>
      
      {/* Seção de KPIs e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Coluna 1: Resumo Financeiro */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl shadow-md border border-indigo-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Resumo Financeiro
              </h2>
              <Link href="/prediction">
                <Button variant="outline" size="sm" className="text-xs">
                  Ver Previsões
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <PredictionSummary transactions={transactions || []} />
              <IncomeExpenseWidgets 
                transactions={transactions || []} 
                defaultAccount={defaultAccount} 
              />
            </div>
          </div>
          
          {/* Histórico de Contas */}
          <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl shadow-md border border-sky-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                <BarChart2 className="mr-2 h-5 w-5" />
                Histórico Financeiro
              </h2>
            </div>
            <Suspense fallback={<SuspenseLoader />}>
              <DefaultAccountHistoryChart 
                accounts={accounts || []} 
                transactions={transactions || []} 
              />
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
          <PieChart className="mr-2 h-5 w-5" />
          Análise Detalhada
        </h2>
        <Suspense fallback={<SuspenseLoader />}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            
              <IncomeCategoryChart transactions={transactions || []} />
<ExpenseCategoryChart 
  transactions={transactions} 
  accountId={defaultAccountId} 
/>
            
          </div>
        </Suspense>
      </div>
            </Suspense>
          </div>
        </div>
        
        {/* Coluna 2: Orçamento e Metas */}
        <div className="space-y-6">
          {accounts.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Orçamento e Metas
                </h2>
                <CreateAccountDrawer>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg flex items-center text-xs transition-colors duration-200">
                    <Plus className="mr-1 h-3 w-3" />
                    Nova Conta
                  </button>
                </CreateAccountDrawer>
              </div>
              <BudgetProgress accounts={accounts} />
            </div>
          )}
          
          {/* Conta Padrão e Transações */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 p-6 rounded-xl shadow-md border border-amber-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-blue-800 flex items-center">
                <Wallet className="mr-2 h-5 w-5" />
                Conta Padrão
              </h2>
            </div>
            <div className="space-y-6">
              <DashboardOverview
                accounts={accounts}
                transactions={transactions || []}
              />
              {defaultAccountId && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-shadow duration-300">
              <TopClientsChart transactions={transactions || []} />
            </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Seção de Análise por Categoria e Clientes */}
      
      {/* Seção de Contas */}
      <div className="mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
          <AccountsYearFilter accounts={accounts} />
        </div>
      </div>
      
      {/* Footer com design moderno */}
      <div className="mt-8">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-6 rounded-xl shadow-lg text-white text-center">
          <p className="font-medium">FinanFlow - Gerenciamento Financeiro Inteligente</p>
          <p className="text-sm mt-2 text-blue-200">Desenvolvido para simplificar suas finanças</p>
          <p className="text-sm mt-2 text-blue-200">Um sistema Usifresa</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
