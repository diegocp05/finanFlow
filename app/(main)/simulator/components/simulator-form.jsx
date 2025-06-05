"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  simulateExpenseImpact, 
  simulateIncomeImpact, 
  simulateCategoryReductionImpact,
  simulateSavingsPlanImpact,
  saveScenario
} from '@/actions/simulator';
import { defaultCategories } from '@/data/categories';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const SimulatorForm = ({ accounts, onSimulationResult }) => {
  const [activeTab, setActiveTab] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [simulationMonths, setSimulationMonths] = useState(12);
  
  // Estado para nova despesa
  const [expenseData, setExpenseData] = useState({
    description: "",
    amount: "",
    category: "",
    accountId: accounts[0]?.id || ""
  });
  
  // Estado para nova receita
  const [incomeData, setIncomeData] = useState({
    description: "",
    amount: "",
    category: "",
    accountId: accounts[0]?.id || ""
  });
  
  // Estado para redução de categoria
  const [categoryReduction, setCategoryReduction] = useState({
    category: "",
    reductionPercentage: 10
  });
  
  // Estado para plano de economia
  const [savingsPlan, setSavingsPlan] = useState({
    initialAmount: "",
    monthlyAmount: "",
    interestRate: "0",
    accountId: accounts[0]?.id || ""
  });
  
  // Filtrar categorias por tipo
  const expenseCategories = defaultCategories.filter(cat => cat.type === "EXPENSE");
  const incomeCategories = defaultCategories.filter(cat => cat.type === "INCOME");
  
  const handleExpenseChange = (field, value) => {
    setExpenseData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleIncomeChange = (field, value) => {
    setIncomeData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleCategoryReductionChange = (field, value) => {
    setCategoryReduction(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSavingsPlanChange = (field, value) => {
    setSavingsPlan(prev => ({ ...prev, [field]: value }));
  };
  
  const runSimulation = async () => {
    setLoading(true);
    try {
      let result;
      
      switch (activeTab) {
        case "expense":
          if (!expenseData.description || !expenseData.amount || !expenseData.category || !expenseData.accountId) {
            toast.error("Preencha todos os campos da despesa");
            return;
          }
          result = await simulateExpenseImpact({
            ...expenseData,
            amount: parseFloat(expenseData.amount)
          }, simulationMonths);
          break;
          
        case "income":
          if (!incomeData.description || !incomeData.amount || !incomeData.category || !incomeData.accountId) {
            toast.error("Preencha todos os campos da receita");
            return;
          }
          result = await simulateIncomeImpact({
            ...incomeData,
            amount: parseFloat(incomeData.amount)
          }, simulationMonths);
          break;
          
        case "reduction":
          if (!categoryReduction.category) {
            toast.error("Selecione uma categoria para redução");
            return;
          }
          result = await simulateCategoryReductionImpact(
            categoryReduction.category,
            categoryReduction.reductionPercentage,
            simulationMonths
          );
          break;
          
        case "savings":
          if (!savingsPlan.monthlyAmount) {
            toast.error("Defina o valor mensal de economia");
            return;
          }
          result = await simulateSavingsPlanImpact({
            ...savingsPlan,
            initialAmount: parseFloat(savingsPlan.initialAmount || 0),
            monthlyAmount: parseFloat(savingsPlan.monthlyAmount),
            interestRate: parseFloat(savingsPlan.interestRate || 0)
          }, simulationMonths);
          break;
      }
      
      if (result.success) {
        onSimulationResult({
          type: activeTab,
          data: result.data,
          name: scenarioName || `Simulação de ${getScenarioTypeName(activeTab)}`
        });
        toast.success("Simulação concluída com sucesso!");
      } else {
        toast.error(result.error || "Erro ao executar simulação");
      }
    } catch (error) {
      console.error("Simulation error:", error);
      toast.error("Ocorreu um erro ao executar a simulação");
    } finally {
      setLoading(false);
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
    <Card>
      <CardHeader>
        <CardTitle>Simulador de Cenários Financeiros</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="scenario-name">Nome do Cenário (opcional)</Label>
              <Input 
                id="scenario-name" 
                placeholder="Ex: Compra de equipamento" 
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="simulation-months">Meses</Label>
              <Select 
                value={simulationMonths.toString()} 
                onValueChange={(value) => setSimulationMonths(parseInt(value))}
              >
                <SelectTrigger id="simulation-months" className="w-[100px]">
                  <SelectValue placeholder="Meses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem>
                  <SelectItem value="12">1 ano</SelectItem>
                  <SelectItem value="24">2 anos</SelectItem>
                  <SelectItem value="36">3 anos</SelectItem>
                  <SelectItem value="60">5 anos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-6 text-xs">
              <TabsTrigger value="expense" className="text-xs">Nova Despesa</TabsTrigger>
              <TabsTrigger value="income" className="text-xs">Nova Receita</TabsTrigger>
              {/* <TabsTrigger value="reduction" className="text-xs">Redução de Gastos</TabsTrigger>
              <TabsTrigger value="savings" className="text-xs mt-2">Plano de Economia</TabsTrigger> */}
            </TabsList>
            
            <TabsContent value="expense" className="space-y-">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-description">Descrição da Despesa</Label>
                  <Input 
                    id="expense-description" 
                    placeholder="Ex: Financiamento de carro" 
                    value={expenseData.description}
                    onChange={(e) => handleExpenseChange("description", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Valor Mensal (R$)</Label>
                  <Input 
                    id="expense-amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={expenseData.amount}
                    onChange={(e) => handleExpenseChange("amount", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-category">Categoria</Label>
                  <Select 
                    value={expenseData.category} 
                    onValueChange={(value) => handleExpenseChange("category", value)}
                  >
                    <SelectTrigger id="expense-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-account">Conta</Label>
                  <Select 
                    value={expenseData.accountId} 
                    onValueChange={(value) => handleExpenseChange("accountId", value)}
                  >
                    <SelectTrigger id="expense-account">
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="income" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="income-description">Descrição da Receita</Label>
                  <Input 
                    id="income-description" 
                    placeholder="Ex: Venda de máquina" 
                    value={incomeData.description}
                    onChange={(e) => handleIncomeChange("description", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="income-amount">Valor Mensal (R$)</Label>
                  <Input 
                    id="income-amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={incomeData.amount}
                    onChange={(e) => handleIncomeChange("amount", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2">
                <div>
                  <Label htmlFor="income-category">Categoria</Label>
                  <Select 
                    value={incomeData.category} 
                    onValueChange={(value) => handleIncomeChange("category", value)}
                  >
                    <SelectTrigger id="income-category">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {incomeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="income-account">Conta</Label>
                  <Select 
                    value={incomeData.accountId} 
                    onValueChange={(value) => handleIncomeChange("accountId", value)}
                  >
                    <SelectTrigger id="income-account">
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reduction" className="space-y-4">
              <div>
                <Label htmlFor="reduction-category">Categoria para Reduzir Gastos</Label>
                <Select 
                  value={categoryReduction.category} 
                  onValueChange={(value) => handleCategoryReductionChange("category", value)}
                >
                  <SelectTrigger id="reduction-category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="reduction-percentage">Percentual de Redução</Label>
                  <span>{categoryReduction.reductionPercentage}%</span>
                </div>
                <Slider
                  id="reduction-percentage"
                  min={5}
                  max={100}
                  step={5}
                  value={[categoryReduction.reductionPercentage]}
                  onValueChange={(value) => handleCategoryReductionChange("reductionPercentage", value[0])}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="savings" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="savings-initial">Valor Inicial (R$)</Label>
                  <Input 
                    id="savings-initial" 
                    type="number" 
                    placeholder="0.00" 
                    value={savingsPlan.initialAmount}
                    onChange={(e) => handleSavingsPlanChange("initialAmount", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="savings-monthly">Valor Mensal (R$)</Label>
                  <Input 
                    id="savings-monthly" 
                    type="number" 
                    placeholder="0.00" 
                    value={savingsPlan.monthlyAmount}
                    onChange={(e) => handleSavingsPlanChange("monthlyAmount", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="savings-interest">Taxa de Juros Anual (%)</Label>
                  <Input 
                    id="savings-interest" 
                    type="number" 
                    placeholder="0.00" 
                    value={savingsPlan.interestRate}
                    onChange={(e) => handleSavingsPlanChange("interestRate", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="savings-account">Conta</Label>
                  <Select 
                    value={savingsPlan.accountId} 
                    onValueChange={(value) => handleSavingsPlanChange("accountId", value)}
                  >
                    <SelectTrigger id="savings-account">
                      <SelectValue placeholder="Selecione uma conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <Button 
            onClick={runSimulation} 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulando...
              </>
            ) : (
              "Executar Simulação"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimulatorForm;