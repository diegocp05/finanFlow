// Adicione estas categorias específicas da Usifresa ao array defaultCategories
export const defaultCategories = [
  // Categorias existentes...
  
  // Categorias de receita da Usifresa
  {
    id: "vendas-maquinas",
    name: "Vendas de Máquinas",
    type: "INCOME",
    color: "#22c55e", // verde
    icon: "Package",
  },
  {
    id: "servicos-manutencao",
    name: "Serviços de Manutenção",
    type: "INCOME",
    color: "#06b6d4", // ciano
    icon: "Tool",
  },
  {
    id: "pecas-reposicao",
    name: "Peças de Reposição",
    type: "INCOME",
    color: "#6366f1", // índigo
    icon: "Cog",
  },
  {
    id: "projetos-especiais",
    name: "Projetos Especiais",
    type: "INCOME",
    color: "#ec4899", // rosa
    icon: "FileText",
  },
  {
    id: "consultoria-tecnica",
    name: "Consultoria Técnica",
    type: "INCOME",
    color: "#f59e0b", // âmbar
    icon: "Briefcase",
  },
  
  // Categorias de despesa da Usifresa
  {
    id: "materia-prima",
    name: "Matéria Prima",
    type: "EXPENSE",
    color: "#ef4444", // vermelho
    icon: "Package",
  },
  {
    id: "folha-pagamento",
    name: "Folha de Pagamento",
    type: "EXPENSE",
    color: "#f97316", // laranja
    icon: "Users",
  },
  {
    id: "maquinario",
    name: "Maquinário",
    type: "EXPENSE",
    color: "#84cc16", // lima
    icon: "Cpu",
  },
  {
    id: "utilidades",
    name: "Utilidades",
    type: "EXPENSE",
    color: "#06b6d4", // ciano
    icon: "Zap",
  },
  {
    id: "transporte",
    name: "Transporte",
    type: "EXPENSE",
    color: "#8b5cf6", // violeta
    icon: "Truck",
  },
  {
    id: "impostos",
    name: "Impostos",
    type: "EXPENSE",
    color: "#f43f5e", // rosa
    icon: "FileText",
  },
  {
    id: "marketing",
    name: "Marketing",
    type: "EXPENSE",
    color: "#ec4899", // rosa
    icon: "TrendingUp",
  },
  {
    id: "pesquisa-desenvolvimento",
    name: "Pesquisa e Desenvolvimento",
    type: "EXPENSE",
    color: "#14b8a6", // teal
    icon: "Flask",
  },
  {
    id: "viagens-negocios",
    name: "Viagens de Negócios",
    type: "EXPENSE",
    color: "#0ea5e9", // azul-céu
    icon: "Plane",
  },
  {
    id: "manutencao-fabrica",
    name: "Manutenção da Fábrica",
    type: "EXPENSE",
    color: "#64748b", // cinza
    icon: "Tool",
  },
];

// O objeto categoryColors é gerado automaticamente a partir de defaultCategories
export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});
