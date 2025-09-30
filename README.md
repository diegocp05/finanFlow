FinanFlow

O FinanFlow é uma aplicação completa de gestão financeira full-stack, desenvolvida com Next.js e Prisma. Ele oferece um conjunto robusto de ferramentas para rastrear, analisar e projetar finanças, voltado especialmente para casos de uso corporativos.

A aplicação conta com recursos como: gerenciamento de múltiplas contas, registro detalhado de transações, extração de dados com IA, controle de orçamento, previsões financeiras e um simulador de cenários.

🔑 Principais Funcionalidades

Dashboard Interativo:
Painel personalizável baseado em widgets que oferece uma visão geral da saúde financeira. Inclui gráficos de receita vs. despesa, distribuição por categorias, histórico de contas, principais clientes e muito mais.

Gestão de Transações:
Funcionalidade completa de CRUD para transações, incluindo exclusão em massa, filtros detalhados e ordenação.

Scanner de Recibos com IA:
Utiliza a API Gemini do Google para escanear recibos (imagens ou descrições de texto) e preencher automaticamente formulários de transação, extraindo dados como valor, data, fornecedor e categoria.

Gestão de Contas e Orçamento:
Criação e gerenciamento de múltiplas contas financeiras (corrente, poupança), definição de metas de saldo e acompanhamento da aderência ao orçamento mensal.

Previsões Financeiras:
Baseado em dados históricos, gera previsões de despesas futuras segmentadas por categoria, ajudando os usuários a se prepararem para compromissos financeiros.

Simulador de Cenários:
Ferramenta para simular o impacto financeiro de diferentes cenários, como adicionar uma nova despesa recorrente ou uma nova receita, auxiliando na tomada de decisões.

Autenticação Segura:
Autenticação de usuários feita com segurança via Clerk, com rotas protegidas para garantir a confidencialidade dos dados financeiros.

⚙️ Stack Tecnológica

Framework: Next.js (App Router, Server Actions, Turbopack)

Banco de Dados: PostgreSQL

ORM: Prisma

Autenticação: Clerk

IA: Google Gemini Pro

Componentes de UI: shadcn/ui

Estilização: Tailwind CSS

Gráficos: Recharts

Formulários: React Hook Form & Zod

Notificações: Sonner

📂 Estrutura do Projeto

app/: Todas as rotas e UI, seguindo a estrutura do App Router do Next.js.

(auth)/: Rotas de login e cadastro de usuário.

(main)/: Rotas protegidas da aplicação principal (dashboard, contas, transações).

api/: Rotas da API, incluindo endpoint para popular o banco.

actions/: Server Actions com a lógica de backend (criação de transações, contas, simulações).

components/: Componentes reutilizáveis em React, incluindo UI feita com shadcn/ui.

lib/: Funções utilitárias, inicialização do cliente Prisma, schemas (Zod) e lógica principal das previsões e simulações.

prisma/: Schema do Prisma (schema.prisma) e arquivos de migração.

hooks/: Hooks personalizados do React para busca de dados e gerenciamento de estado.

data/: Dados estáticos, como categorias pré-definidas de transações.

🚀 Como Rodar o Projeto
Pré-requisitos

Node.js (v18 ou superior)

pnpm, npm ou yarn

1. Clone o Repositório
git clone https://github.com/diegocp05/finanFlow.git
cd finanFlow

2. Instale as Dependências
npm install
# ou
pnpm install
# ou
yarn install

3. Configure as Variáveis de Ambiente

Crie um arquivo .env na raiz do projeto e adicione:

# Banco PostgreSQL (ex: Vercel Postgres, Supabase)
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Clerk Authentication Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."

# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key"

4. Configure o Banco de Dados

Execute as migrações do Prisma:

npx prisma migrate dev

5. (Opcional) Popular o Banco

O projeto inclui um script de seed para preencher o banco com dados fictícios da empresa "Usifresa", permitindo testar rapidamente as funcionalidades.

Após iniciar o servidor de desenvolvimento, acesse no navegador:

http://localhost:3000/api/seed

6. Rodar o Servidor de Desenvolvimento
npm run dev


Abra http://localhost:3000
 no navegador para visualizar a aplicação.

☁️ Deploy

A forma mais simples é usar o Vercel:

Configure suas variáveis de ambiente no painel do projeto.

O Vercel detectará automaticamente o framework Next.js, instalará as dependências e fará o build para deploy.
