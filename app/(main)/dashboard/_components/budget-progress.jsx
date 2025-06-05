"use client";
import React, { useEffect, useState } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { updateBudget } from '@/actions/budget';
import { Check, Pencil, Target, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useFetch from '@/hooks/use-fetch';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
  

const BudgetProgress = ({ accounts }) => {
    // Filtrar apenas contas que têm metas definidas
    const accountsWithGoals = accounts.filter(account => account.targetGoal);
    
    // Calcular a porcentagem média de progresso para todas as metas
    const calculateOverallProgress = () => {
        if (accountsWithGoals.length === 0) return 0;
        
        let totalPercentage = 0;
        
        accountsWithGoals.forEach(account => {
            const percentage = Math.min(100, (parseFloat(account.balance) / parseFloat(account.targetGoal)) * 100);
            totalPercentage += percentage;
        });
        
        return totalPercentage / accountsWithGoals.length;
    };
    
    const overallProgress = calculateOverallProgress();
    
    // Calcular quantas contas atingiram suas metas
    const goalsAchieved = accountsWithGoals.filter(account => 
        parseFloat(account.balance) >= parseFloat(account.targetGoal)
    ).length;
    
    // Calcular o total de todas as metas e o total de todos os saldos
    const totalGoals = accountsWithGoals.reduce((sum, account) => 
        sum + parseFloat(account.targetGoal), 0);
    
    const totalBalances = accountsWithGoals.reduce((sum, account) => 
        sum + parseFloat(account.balance), 0);
    
    // Calcular quanto falta para atingir todas as metas
    const remainingToGoals = Math.max(0, totalGoals - totalBalances);
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                        <Target size={20} className="text-blue-500" />
                        Progresso das Metas
                    </CardTitle>
                    <CardDescription>
                        {accountsWithGoals.length === 0 
                            ? "Nenhuma conta com meta definida" 
                            : `${goalsAchieved} de ${accountsWithGoals.length} metas atingidas`}
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                {accountsWithGoals.length > 0 && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Progress value={overallProgress} className="h-2" />
                            <div className="text-xs text-muted-foreground text-right">
                                <span>{overallProgress.toFixed(1)}% concluído</span>
                            </div>
                        </div>
                        
                        <div className="flex justify-between text-sm">
                            <span>Total acumulado: R${totalBalances.toFixed(2)}</span>
                            <span>Meta total: R${totalGoals.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BudgetProgress;
