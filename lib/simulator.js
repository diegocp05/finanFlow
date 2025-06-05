/**
 * Biblioteca para simulação de cenários financeiros
 */


import { addMonths, format, startOfMonth, endOfMonth, startOfNextMonth } from 'date-fns';
import { generatePredictions } from './prediction';

/**
 * Simula o impacto de uma nova despesa recorrente
 * @param {Array} transactions - Transações históricas
 * @param {Object} newExpense - Nova despesa a ser simulada
 * @param {Number} months - Número de meses para simular
 * @returns {Object} - Resultado da simulação
 */
export function simulateNewExpense(transactions, newExpense, months = 12) {
  // Clone as transações para não modificar os dados originais
  const simulatedTransactions = [...transactions];
  
  // Começar a partir do próximo mês
  const startDate = startOfMonth(addMonths(new Date(), 1));
  
  // Adicionar a nova despesa recorrente para cada mês futuro


  for (let i = 0; i < months; i++) {
    const transactionDate = addMonths(startDate, i);
    
    simulatedTransactions.push({

      id: `sim-expense-${i}-${Date.now()}`,
      type: "EXPENSE",

      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      date: transactionDate,
      accountId: newExpense.accountId,

      isRecurring: true,
      isSimulated: true // Flag para identificar transações simuladas
    });
  }
  


  // Gerar previsões originais (sem a nova despesa)
  const originalPredictions = generatePredictions(transactions, months);
  
  // Gerar previsões simuladas (com a nova despesa)
  const simulatedPredictions = generatePredictions(simulatedTransactions, months);
  


  // Calcular o impacto direto de forma mais precisa
  const monthlyAmount = parseFloat(newExpense.amount);
  
  // Criar previsões simuladas mais precisas, adicionando apenas o valor exato da nova despesa
  const adjustedSimulatedPredictions = originalPredictions.map(prediction => ({
    ...prediction,
    categories: {
      ...prediction.categories,
      [newExpense.category]: {
        amount: (prediction.categories[newExpense.category]?.amount || 0) + monthlyAmount,
        confidence: prediction.categories[newExpense.category]?.confidence || 0.9
      }
    },
    total: prediction.total + monthlyAmount
  }));
  
  const directImpact = {


    monthlyImpact: monthlyAmount,
    totalImpact: monthlyAmount * months, // Agora bate com o número de meses simulados
    months: months
  };
  
  return {



    type: "expense",
    originalPredictions,

    simulatedPredictions: adjustedSimulatedPredictions,
    newExpense,
    directImpact
  };
}

/**
 * Simula o impacto de uma nova receita recorrente
 * @param {Array} transactions - Transações históricas
 * @param {Object} newIncome - Nova receita a ser simulada
 * @param {Number} months - Número de meses para simular
 * @returns {Object} - Resultado da simulação
 */
export function simulateNewIncome(transactions, newIncome, months = 12) {
  // Clone as transações para não modificar os dados originais
  const simulatedTransactions = [...transactions];
  
  // Começar a partir do próximo mês
  const startDate = startOfMonth(addMonths(new Date(), 1));
  
  // Adicionar a nova receita recorrente para cada mês futuro


  for (let i = 0; i < months; i++) {
    const transactionDate = addMonths(startDate, i);
    
    simulatedTransactions.push({

      id: `sim-income-${i}-${Date.now()}`,
      type: "INCOME",

      amount: parseFloat(newIncome.amount),
      description: newIncome.description,
      category: newIncome.category,
      date: transactionDate,
      accountId: newIncome.accountId,

      isRecurring: true,
      isSimulated: true
    });
  }
  


  // Gerar previsões originais (sem a nova receita)
  const originalPredictions = generatePredictions(transactions, months);
  


  // Calcular o impacto direto de forma mais precisa
  const monthlyAmount = parseFloat(newIncome.amount);
  




  // Para receitas, criar previsões que mostram melhoria no fluxo de caixa
  // Mas invertemos a lógica para que o impacto seja calculado corretamente
  const adjustedSimulatedPredictions = originalPredictions.map(prediction => ({
    ...prediction,
    categories: {
      ...prediction.categories,
      [newIncome.category]: {


        amount: monthlyAmount, // Mostrar a receita como valor positivo
        confidence: 0.9
      }
    },



    // Para receitas, aumentamos o total para que a diferença seja positiva
    total: prediction.total + monthlyAmount
  }));
  
  const directImpact = {







    monthlyImpact: monthlyAmount, // Sempre positivo para receitas
    totalImpact: monthlyAmount * months, // Sempre positivo para receitas
    months: months,


    isIncome: true // Flag para identificar que é receita
  };
  
  return {



    type: "income",
    originalPredictions,

    simulatedPredictions: adjustedSimulatedPredictions,
    newIncome,
    directImpact
  };
}

/**
 * Simula o impacto de reduzir gastos em uma categoria
 * @param {Array} transactions - Transações históricas
 * @param {String} category - Categoria para reduzir gastos
 * @param {Number} reductionPercentage - Percentual de redução (0-100)
 * @param {Number} months - Número de meses para simular
 * @returns {Object} - Resultado da simulação
 */
export function simulateCategoryReduction(transactions, category, reductionPercentage, months = 12) {
  // Clone as transações para não modificar os dados originais
  const simulatedTransactions = transactions.map(t => {
    // Se for uma transação futura na categoria especificada, reduzir o valor
    if (t.type === "EXPENSE" && t.category === category && new Date(t.date) > new Date()) {
      return {
        ...t,
        amount: t.amount * (1 - reductionPercentage / 100)
      };
    }
    return {...t};
  });
  
  // Gerar previsões baseadas nas transações simuladas
  const predictions = generatePredictions(simulatedTransactions, months);
  
  return {
    type: "reduction",
    originalPredictions: generatePredictions(transactions, months),
    simulatedPredictions: predictions,
    category,
    reductionPercentage
  };
}

/**
 * Simula o impacto de economizar um valor fixo mensalmente
 * @param {Array} transactions - Transações históricas
 * @param {Object} savingsPlan - Plano de economia
 * @param {Number} months - Número de meses para simular
 * @returns {Object} - Resultado da simulação com projeção de patrimônio
 */
export function simulateSavingsPlan(transactions, savingsPlan, months = 12) {
  // Clone as transações para não modificar os dados originais
  const simulatedTransactions = [...transactions];
  
  // Adicionar a economia mensal como uma "despesa" para cada mês futuro
  const startDate = new Date();
  
  for (let i = 0; i < months; i++) {
    const transactionDate = addMonths(startDate, i);
    
    simulatedTransactions.push({
      id: `sim-savings-${i}`,
      type: "EXPENSE",
      amount: savingsPlan.monthlyAmount,
      description: "Economia Planejada",
      category: "savings",
      date: transactionDate,
      accountId: savingsPlan.accountId,
      isRecurring: true
    });
  }
  
  // Calcular o crescimento do patrimônio ao longo do tempo
  const netWorthProjection = [];
  let accumulatedSavings = savingsPlan.initialAmount || 0;
  
  for (let i = 0; i < months; i++) {
    accumulatedSavings += savingsPlan.monthlyAmount;
    // Adicionar juros compostos se uma taxa for especificada
    if (savingsPlan.interestRate) {
      accumulatedSavings *= (1 + savingsPlan.interestRate / 100 / 12);
    }
    
    netWorthProjection.push({
      month: format(addMonths(startDate, i), 'MMM yyyy'),
      amount: accumulatedSavings
    });
  }
  
  // Gerar previsões baseadas nas transações simuladas
  const predictions = generatePredictions(simulatedTransactions, months);
  
  return {
    type: "savings",
    originalPredictions: generatePredictions(transactions, months),
    simulatedPredictions: predictions,
    netWorthProjection,
    savingsPlan
  };
}

/**
 * Calcula o tempo necessário para atingir uma meta financeira
 * @param {Number} targetAmount - Valor alvo
 * @param {Number} monthlySavings - Economia mensal
 * @param {Number} initialAmount - Valor inicial
 * @param {Number} interestRate - Taxa de juros anual (%)
 * @returns {Number} - Número de meses necessários
 */
export function calculateTimeToGoal(targetAmount, monthlySavings, initialAmount = 0, interestRate = 0) {
  let months = 0;
  let currentAmount = initialAmount;
  const monthlyRate = interestRate / 100 / 12;
  
  while (currentAmount < targetAmount && months < 600) { // Limite de 50 anos
    currentAmount += monthlySavings;
    currentAmount *= (1 + monthlyRate);
    months++;
  }
  
  return months;
}