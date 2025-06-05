"use client";
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Wallet, CreditCard } from 'lucide-react';
import CreateAccountDrawer from '@/components/create-account-drawer';
import AccountCard from './account-card';

const AccountsYearFilter = ({ accounts }) => {
  // Extrair todos os anos únicos das contas com base na data de criação
  const accountYears = [...new Set(accounts.map(account => 
    new Date(account.createdAt).getFullYear()
  ))].sort((a, b) => b - a); // Ordenar anos em ordem decrescente
  
  // Adicionar opção para o ano atual se não existir
  const currentYear = new Date().getFullYear();
  if (!accountYears.includes(currentYear)) {
    accountYears.unshift(currentYear);
  }
  
  // Estado para o ano selecionado (padrão: ano atual ou o ano mais recente disponível)
  const defaultYear = accountYears.length > 0 ? accountYears[0].toString() : currentYear.toString();
  const [selectedYear, setSelectedYear] = useState(defaultYear);
  
  // Filtrar contas pelo ano selecionado
  const filteredAccounts = selectedYear === "all" 
    ? accounts 
    : accounts.filter(account => {
        const accountYear = new Date(account.createdAt).getFullYear().toString();
        return accountYear === selectedYear;
      });

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-blue-800 flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Minhas Contas
        </h2>
        <div className="flex items-center gap-3">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] border-blue-200 focus:ring-blue-500">
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              {accountYears.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year === currentYear ? `${year} (Atual)` : year}
                </SelectItem>
              ))}
              <SelectItem value="all">Todos os anos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateAccountDrawer>
          <div className="cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <Card className="overflow-hidden border-dashed border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 h-full">
              <div className="flex flex-col items-center justify-center p-6 h-full">
                <div className="bg-blue-600 rounded-full p-3 mb-3">
                  <Plus className="h-8 w-8 text-white" />
                </div>
                <p className="text-blue-700 text-lg text-center">Adicionar Nova Conta</p>
                <p className="text-blue-500 text-sm text-center mt-1">
                  Crie uma conta para gerenciar suas finanças
                </p>
              </div>
            </Card>
          </div>
        </CreateAccountDrawer>

        {filteredAccounts.length > 0 
          ? filteredAccounts.map(account => (
              <AccountCard key={account.id} account={account} />
            ))
          : (
              <div className="col-span-full text-center py-8 bg-blue-50 rounded-xl border border-blue-100">
                <CreditCard className="h-10 w-10 text-blue-400 mx-auto mb-2" />
                <p className="text-blue-700">Nenhuma conta encontrada para o ano {selectedYear}</p>
                <p className="text-blue-500 text-sm mt-1">Tente selecionar outro ano ou crie uma nova conta</p>
              </div>
            )
        }
      </div>
    </div>
  );
};

export default AccountsYearFilter;
