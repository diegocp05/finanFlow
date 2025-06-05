/**
 * Biblioteca para previsão de gastos baseada em padrões históricos
 */

import { addMonths, subMonths, format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

/**
 * Calcula a média móvel de gastos para previsão
 * @param {Array} transactions - Transações históricas
 * @param {Number} months - Número de meses para calcular a média
 * @param {String} category - Categoria para filtrar (opcional)
 * @returns {Number} - Valor médio previsto
 */
export function calculateMovingAverage(transactions, months = 3, category = null) {
  if (!transactions || transactions.length === 0) return 0;
  
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, months));
  
  // Filtrar transações pelo período e categoria (se especificada)
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const isInPeriod = isWithinInterval(transactionDate, {
      start: startDate,
      end: endOfMonth(now)
    });
    
    if (!isInPeriod) return false;
    if (t.type !== "EXPENSE") return false;
    if (category && t.category !== category) return false;
    
    return true;
  });
  
  if (filteredTransactions.length === 0) return 0;
  
  // Calcular a média
  const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  return total / months;
}

/**
 * Identifica padrões sazonais nos gastos
 * @param {Array} transactions - Transações históricas
 * @param {String} category - Categoria para analisar
 * @returns {Object} - Fatores sazonais por mês
 */
export function calculateSeasonalFactors(transactions, category) {
  if (!transactions || transactions.length === 0) return {};
  
  // Filtrar apenas despesas da categoria especificada
  const filteredTransactions = transactions.filter(t => 
    t.type === "EXPENSE" && t.category === category
  );
  
  if (filteredTransactions.length === 0) return {};
  
  // Agrupar transações por mês
  const monthlyTotals = {};
  const monthCounts = {};
  
  filteredTransactions.forEach(t => {
    const transactionDate = new Date(t.date);
    const month = transactionDate.getMonth();
    
    if (!monthlyTotals[month]) {
      monthlyTotals[month] = 0;
      monthCounts[month] = 0;
    }
    
    monthlyTotals[month] += t.amount;
    monthCounts[month]++;
  });
  
  // Calcular médias mensais
  const monthlyAverages = {};
  for (const month in monthlyTotals) {
    monthlyAverages[month] = monthlyTotals[month] / monthCounts[month];
  }
  
  // Calcular média global
  const totalAmount = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0);
  const totalCount = Object.values(monthCounts).reduce((sum, val) => sum + val, 0);
  const globalAverage = totalAmount / totalCount;
  
  // Calcular fatores sazonais
  const seasonalFactors = {};
  for (const month in monthlyAverages) {
    seasonalFactors[month] = monthlyAverages[month] / globalAverage;
  }
  
  return seasonalFactors;
}

/**
 * Gera previsão de gastos para os próximos meses
 * @param {Array} transactions - Transações históricas
 * @param {Number} futurePeriod - Número de meses para prever
 * @returns {Array} - Previsões de gastos por categoria e mês
 */
export function generatePredictions(transactions, futurePeriod = 3) {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  const now = new Date();
  const predictions = [];
  
  // Obter categorias únicas de despesas
  const categories = [...new Set(
    transactions
      .filter(t => t.type === "EXPENSE")
      .map(t => t.category)
  )];
  
  // Calcular fatores sazonais para cada categoria
  const categorySeasonalFactors = {};
  categories.forEach(category => {
    categorySeasonalFactors[category] = calculateSeasonalFactors(transactions, category);
  });
  
  // Gerar previsões para cada mês futuro
  for (let i = 1; i <= futurePeriod; i++) {
    const targetMonth = addMonths(now, i);
    const monthIndex = targetMonth.getMonth();
    const monthName = format(targetMonth, 'MMM yyyy');
    
    const monthPredictions = {
      month: monthName,
      date: targetMonth,
      categories: {}
    };
    
    // Calcular previsão para cada categoria
    categories.forEach(category => {
      // Obter média móvel para a categoria
      const baseAverage = calculateMovingAverage(transactions, 3, category);
      
      // Aplicar fator sazonal se disponível
      const seasonalFactor = categorySeasonalFactors[category][monthIndex] || 1;
      const predictedAmount = baseAverage * seasonalFactor;
      
      monthPredictions.categories[category] = {
        amount: predictedAmount,
        confidence: calculateConfidence(transactions, category)
      };
    });
    
    // Calcular total previsto para o mês
    monthPredictions.total = Object.values(monthPredictions.categories)
      .reduce((sum, cat) => sum + cat.amount, 0);
    
    predictions.push(monthPredictions);
  }
  
  return predictions;
}

/**
 * Calcula o nível de confiança da previsão com base na consistência dos dados históricos
 * @param {Array} transactions - Transações históricas
 * @param {String} category - Categoria para analisar
 * @returns {Number} - Nível de confiança (0-1)
 */
function calculateConfidence(transactions, category) {
  if (!transactions || transactions.length === 0) return 0;
  
  // Filtrar transações da categoria
  const categoryTransactions = transactions.filter(t => 
    t.type === "EXPENSE" && t.category === category
  );
  
  if (categoryTransactions.length < 3) return 0.3; // Poucos dados = baixa confiança
  
  // Calcular variação nos valores
  const amounts = categoryTransactions.map(t => t.amount);
  const average = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
  
  // Calcular desvio padrão
  const squaredDiffs = amounts.map(val => Math.pow(val - average, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / amounts.length;
  const stdDev = Math.sqrt(variance);
  
  // Coeficiente de variação (menor = mais consistente = maior confiança)
  const cv = stdDev / average;
  
  // Converter para um score de confiança (0-1)
  // CV menor que 0.1 = alta consistência, CV maior que 1 = baixa consistência
  const confidence = Math.max(0, Math.min(1, 1 - cv));
  
  return confidence;
}