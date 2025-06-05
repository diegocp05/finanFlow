"use client";
import { updateDefaultAccount } from '@/actions/account';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { ArrowDownRight, ArrowUpRight, Pencil, Target, Trash, CreditCard, Star, Wallet, DollarSign } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import EditAccountDrawer from '@/components/edit-account-drawer';
import { Button } from '@/components/ui/button';

const AccountCard = ({account}) => {
    const {name, type, balance, isDefault, id, targetGoal} = account;
    
    const {loading: updateDefaultLoading, 
      fn: updateDefaultFn,
      data: updatedAccount,
      error,
    } = useFetch(updateDefaultAccount);

    // Calcular a porcentagem de progresso para a meta
    const progressPercentage = targetGoal 
      ? Math.min(100, (parseFloat(balance) / parseFloat(targetGoal)) * 100) 
      : null;

    const handleDefaultChange = async (event) => {
      event.preventDefault();
      event.stopPropagation(); // Impedir que o clique propague para o Link
      
      // Verifica se a conta já é a padrão
      if (isDefault) {
        toast.warning("Você precisa ter pelo menos uma conta padrão");
        return;
      }
      
      // Tenta atualizar a conta padrão
      const result = await updateDefaultFn(id);
      
      // Verifica se a atualização foi bem-sucedida
      if (result?.success) {
        toast.success("Conta padrão atualizada");
      } else {
        toast.error("Erro ao atualizar a conta padrão");
      }
    };

    const handleEditClick = (event) => {
      event.preventDefault();
      event.stopPropagation(); // Impedir que o clique propague para o Link
    };
    
    useEffect(() =>{
      if(updatedAccount?.success){
        toast.success("Conta padrao atualizada");
      }
    }, [updatedAccount]);

    useEffect(() =>{
      if(error){
        toast.error(error.message || "Ocorreu um erro ao atualizar a conta padrao");;
      }
    }, [error]);
    
    // Determinar estilo com base no tipo de conta
    const getAccountStyle = () => {
      if (type === "SAVINGS") {
        return {
          bgColor: "bg-blue-600",
          iconColor: "text-blue-100",
          textColor: "text-blue-100",
          progressColor: "bg-blue-300"
        };
      }
      return {
        bgColor: "bg-emerald-600",
        iconColor: "text-emerald-100",
        textColor: "text-emerald-100",
        progressColor: "bg-emerald-300"
      };
    };
    
    const style = getAccountStyle();
    
    return (
      <Link href={`/account/${id}`} className="block">
        <Card className="overflow-hidden rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 cursor-pointer">
          {/* Cabeçalho colorido */}
          <div className={`${style.bgColor} p-4 relative`}>
            <div className="absolute top-3 right-3 flex items-center gap-2">
              {isDefault && (
                <div className="bg-white/20 p-1 rounded-full">
                  <Star className="h-4 w-4 text-white fill-white" />
                </div>
              )}
              <EditAccountDrawer account={account}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
                  onClick={handleEditClick}
                >
                  <Pencil size={16} />
                </Button>
              </EditAccountDrawer>
            </div>
            
            <div className="flex items-center mb-3">
              <div className="bg-white/20 p-2 rounded-lg mr-3">
                {type === "SAVINGS" ? 
                  <Wallet className={`h-6 w-6 ${style.iconColor}`} /> : 
                  <CreditCard className={`h-6 w-6 ${style.iconColor}`} />
                }
              </div>
              <div>
                <h3 className="text-white font-medium">{name}</h3>
                <p className={`text-xs ${style.textColor} opacity-80`}>
                  {type.charAt(0) + type.slice(1).toLowerCase()} Conta
                </p>
              </div>
            </div>
            
            <div className="mt-4 flex items-baseline">
              <p className="h-5 w-5 text-white text-lg mr-1">R$</p>
              <span className="text-2xl font-bold text-white">
                {parseFloat(balance) >= 0 ? "" : "-"}
                {Math.abs(parseFloat(balance)).toFixed(2)}
              </span>
            </div>
            
            {account._count?.transactions && (
              <div className="mt-1">
                <span className="text-xs text-white/70">
                  {account._count.transactions} transações
                </span>
              </div>
            )}
          </div>
          
          <CardContent className="p-4 bg-white">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                  <ArrowUpRight className="mr-1 h-3 w-3"/>
                  Receitas
                </div>
                <div className="flex items-center text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                  <ArrowDownRight className="mr-1 h-3 w-3"/>
                  Despesas
                </div>
              </div>
              
              <div className="flex items-center" onClick={handleDefaultChange}>
                <span className="text-xs text-gray-500 mr-2">Padrão</span>
                <Switch
                  checked={isDefault}
                  disabled={updateDefaultLoading}
                  className={`${isDefault ? style.bgColor : ""}`}
                />
              </div>
            </div>
            
            {targetGoal && (
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Target size={14} className={`text-${type === "SAVINGS" ? "blue" : "emerald"}-500`} />
                    <span>Meta: R${parseFloat(targetGoal).toFixed(2)}</span>
                  </div>
                  <span className={`text-xs font-medium ${progressPercentage >= 100 ? "text-green-600" : `text-${type === "SAVINGS" ? "blue" : "emerald"}-600`}`}>
                    {progressPercentage.toFixed(0)}%
                  </span>
                </div>
                <Progress 
                  value={progressPercentage} 
                  className="h-2" 
                />
                {progressPercentage >= 100 ? (
                  <p className="text-[10px] text-green-600 mt-1 text-right">Meta atingida! 🎉</p>
                ) : (
                  <p className="text-[10px] text-gray-500 mt-1 text-right">
                    Faltam R${(parseFloat(targetGoal) - parseFloat(balance)).toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </Link>
    );
};

export default AccountCard;
