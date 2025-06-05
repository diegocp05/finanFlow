import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart2, CreditCard, PieChart, Shield, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12">
        {/* Conteúdo de texto */}
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title">
            FinanFlow
            <span className="block text-2xl sm:text-3xl mt-2 text-blue-600">
              Gerenciamento Financeiro Inteligente
            </span>
             <span className="block text-sm sm:text-3xl mt-2 text-blue-800">
              Um sistema Usifresa
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 max-w-2xl">
            Simplifique o controle financeiro da sua empresa com nossa plataforma completa. 
            Acompanhe receitas, despesas, e obtenha insights valiosos para tomar decisões 
            estratégicas baseadas em dados.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-6 rounded-lg text-lg shadow-lg transition-all duration-300 hover:shadow-xl">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            
            <Link href="/simulator">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50 px-6 py-6 rounded-lg text-lg transition-all duration-300">
                Simular Cenários
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
            <div className="flex items-center gap-2 text-blue-700">
              <CreditCard className="h-5 w-5" />
              <span>Múltiplas Contas</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <PieChart className="h-5 w-5" />
              <span>Análise por Categoria</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <BarChart2 className="h-5 w-5" />
              <span>Relatórios Detalhados</span>
            </div>
            <div className="flex items-center gap-2 text-blue-700">
              <Shield className="h-5 w-5" />
              <span>Dados Seguros</span>
            </div>
          </div>
        </div>
        
        {/* Imagem ou ilustração */}
        <div className="flex-1 relative">
          <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-8 rounded-2xl shadow-xl">
            <div className="grid gap-4">
              {/* Card de Saldo */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Saldo Total</h3>
                <p className="text-3xl font-bold text-blue-700">R$ 157.350,00</p>
                <div className="mt-4 h-2 bg-blue-100 rounded-full">
                  <div className="h-2 bg-blue-600 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-gray-500">Meta: R$ 200.000,00</span>
                  <span className="text-blue-600 font-medium">78%</span>
                </div>
              </div>
              
              {/* Card de Transações */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-green-100">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Receitas vs Despesas</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Receitas</p>
                    <p className="text-xl font-bold text-green-600">R$ 85.200,00</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Despesas</p>
                    <p className="text-xl font-bold text-red-600">R$ 42.850,00</p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <div className="h-8 bg-green-500 rounded-l-lg w-2/3"></div>
                  <div className="h-8 bg-red-500 rounded-r-lg w-1/3"></div>
                </div>
              </div>
              
              {/* Card de Previsão */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">Previsão Inteligente</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Projeção para o próximo trimestre baseada em IA
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Crescimento Projetado</p>
                    <p className="text-xl font-bold text-purple-600">+15.2%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Elementos decorativos */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-300 rounded-full opacity-50 blur-xl"></div>
          <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-blue-500 rounded-full opacity-40 blur-xl"></div>
        </div>
      </div>
      
      {/* Seção de recursos */}
      <div className="mt-24 text-center">
        <h2 className="text-3xl font-bold text-blue-800 mb-12">Recursos Poderosos para Sua Empresa</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-7 w-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Gestão de Contas</h3>
            <p className="text-gray-600">
              Gerencie múltiplas contas com facilidade, defina metas e acompanhe o progresso em tempo real.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart2 className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Análise Avançada</h3>
            <p className="text-gray-600">
              Visualize dados financeiros com gráficos interativos e obtenha insights valiosos sobre seu fluxo de caixa.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md border border-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-7 w-7 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-purple-800 mb-2">Previsões com IA</h3>
            <p className="text-gray-600">
              Nossa inteligência artificial analisa seus dados para prever tendências e ajudar no planejamento financeiro.
            </p>
          </div>
        </div>
      </div>
      
      {/* CTA Final */}
      <div className="mt-24 mb-12 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-12 rounded-2xl shadow-xl text-white">
          <h2 className="text-3xl font-bold mb-4">Pronto para transformar suas finanças?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de empresas que já otimizaram seu gerenciamento financeiro com o FinanFlow.
          </p>
          <Link href="/dashboard">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-6 rounded-lg text-lg font-medium shadow-lg transition-all duration-300">
              Começar 
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
