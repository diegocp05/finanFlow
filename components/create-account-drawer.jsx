"use client";
import React, { useEffect, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import {accountSchema} from "@/app/lib/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { createAccount } from "@/actions/dashboard";
import useFetch from '@/hooks/use-fetch';
import { Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';


const CreateAccountDrawer = ({children}) => {

const {register,handleSubmit,formState:{errors}, setValue,watch,reset} =  useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {  
      name: "",
      type: "CURRENT",
      balance: "",
      targetGoal: "",
      isDefault:false,
    },
  });

  const {data: newAccount, error, fn:createAccountFn, loading:createAccountLoading} = useFetch(createAccount);

  useEffect(()=> {
    if(newAccount && !createAccountLoading){
      toast.success("Conta criada com sucesso!");
      reset();
      setOpen(false);
    }
  },[ newAccount, createAccountLoading, reset]);
  

  useEffect(()=> {
    if(error){
      toast.error(error.message || "Ocorreu um erro ao criar a conta");
    }
  },[error])

  const onSubmit= async(data) =>{
    await createAccountFn(data);
  }

    const [open, setOpen] = useState();
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>{children}</DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Criar Uma Nova Conta</DrawerTitle>
          </DrawerHeader>
  
          <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div className="space-y-2">
              <label htmlFor="name">Nome da Conta</label>
              <Input id='name' placeholder="ex: Alimentação" {...register("name")} />
              {errors.name && (
                <p className="text=sm text-red-500">{errors.name.message}</p>
              )}
            </div>
  
            <div className="space-y-2">
              <label htmlFor="type">Tipo da Conta</label>
              <Select onValueChange={(value) => setValue("type", value)} defaultValue={watch("type")}>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo da conta" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Corrente</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text=sm text-red-500">{errors.type.message}</p>
              )}
            </div>
  
            <div className="space-y-2">
              <label htmlFor="balance">Saldo Inicial</label>
              <Input id='balance' type="number" step="0.01" placeholder="0.00" {...register("balance")} />
              {errors.balance && (
                <p className="text=sm text-red-500">{errors.balance.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="targetGoal" className="flex items-center gap-2">
                <Target size={16} className="text-blue-500" />
                Meta de Valor
              </label>
              <Input 
                id='targetGoal' 
                type="number" 
                step="0.01" 
                placeholder="Defina uma meta para esta conta" 
                {...register("targetGoal")} 
              />
              <p className="text-xs text-muted-foreground">
                Defina um valor alvo que você deseja atingir nesta conta
              </p>
              {errors.targetGoal && (
                <p className="text=sm text-red-500">{errors.targetGoal.message}</p>
              )}
            </div>
  
            <div className="space-y-2">
              <label htmlFor="isDefault">Definir como padrão</label>
              <p>Essa conta será definida como padrão para as transações</p>
              <Switch id="isDefault" onCheckedChange={(checked) => setValue("isDefault", checked)} defaultValue={watch("isDefault")} />
            </div>
  
            <div className="flex space-x-2">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">Cancelar</Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={createAccountLoading}>{createAccountLoading?(<><Loader2 className="animate-spin"/>Criando...
              </> ) :("Criar Conta")}
              </Button>
            </div>
          </form>
        </DrawerContent>
      </Drawer>
    );
  }

export default CreateAccountDrawer;