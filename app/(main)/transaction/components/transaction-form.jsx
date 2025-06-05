"use client";
import { createTransaction, updateTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import React, { useEffect } from 'react'
import CreateAccountDrawer from '@/components/create-account-drawer';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Loader2, Router } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ReceiptScanner } from './recipt-scanner';

const AddTransactionForm = ({accounts, categories, editMode = false, initialData = null}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
 const {register, setValue, handleSubmit, formState:{errors}, watch, getValues, reset} = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
    editMode && initialData
    ?{
      type: initialData.type,
      amount: initialData.amount.toString(),
      description: initialData.description,
      accountId: initialData.accountId,
      date: new Date(initialData.date),
      isRecurring: initialData.isRecurring,
      corporateName: initialData.corporateName,
      documento: initialData.documento,
      ...(initialData.recurringInterval && {
        recurringInterval: initialData.recurringInterval,
        recurringCount: initialData.recurringInterval,
      }),
      category: initialData.category,
    }
    :
     {
      type: 'EXPENSE',
      amount: "",
      description: "",
      accountId: accounts.find((ac) => ac.isDefault)?.id,
      date: new Date(),
      isRecurring: false,
      corporateName: "",
      documento: "",
    },
  });
  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");

  const onSubmit = async (data) => {
    const formData = {
      ...data,
      amount: parseFloat(data.amount),
    };
    if(editMode){
      transactionFn(editId, formData);
    }else{
    transactionFn(formData);
    }
  };

  useEffect(() => {
    if(transactionResult?.success && !transactionLoading){
      toast.success(
        editMode
        ? "Transação atualizada com sucesso"
        : "Transação criada com sucesso"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode, reset, router]);

  const filteredCategories = categories.filter(
    (category) => category.type === type
  );

  // Implementação correta da função handleScanComplete
  const handleScanComplete = (scannedData) => {
    if (!scannedData) return;
    
    // Preencher os campos do formulário com os dados escaneados
    if (scannedData.amount) {
      setValue("amount", scannedData.amount.toString());
    }
    
    if (scannedData.date) {
      setValue("date", new Date(scannedData.date));
    }
    
    if (scannedData.description) {
      setValue("description", scannedData.description);
    }
    
    // Encontrar a categoria correspondente no sistema
    if (scannedData.category) {
      const matchingCategory = categories.find(
        cat => cat.id === scannedData.category || 
               cat.name.toLowerCase() === scannedData.category.toLowerCase()
      );
      
      if (matchingCategory) {
        setValue("category", matchingCategory.id);
        
        // Atualizar o tipo de transação com base na categoria
        setValue("type", matchingCategory.type);
      }
    }
    
    if (scannedData.corporateName) {
      setValue("corporateName", scannedData.corporateName);
    }
    
    // Notificar o usuário
    toast.success("Formulário preenchido com os dados processados");
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}> 
    {/* <ReceiptScanner onScanComplete={handleScanComplete} /> */}
      <div className="space-y-6">
        <label className="text-sm font-medium">
          Tipo
        </label>
        <Select onValueChange={(value) => setValue("type", value)} defaultValue={type}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o tipo" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="EXPENSE">Despesa</SelectItem>
    <SelectItem value="INCOME">Receita</SelectItem>
  </SelectContent>
</Select>

{errors.type && (
  <p className="text-sm text-red-500">{errors.type.message}</p>
)}
 </div>

 <div className="space-y-2">
  <label className="text-sm font-medium">Nome do Cliente/Fornecedor</label>
  <Input 
    type="text" 
    placeholder="Digite o nome do cliente ou fornecedor" 
    {...register("corporateName")} 
  />
  {errors.corporateName && (
    <p className="text-sm text-red-500">{errors.corporateName.message}</p>
  )}
</div>

<div className="space-y-2">
  <label className="text-sm font-medium">Documento</label>
  <Input 
    type="text" 
    placeholder="Digite o número do documento, nota fiscal, etc." 
    {...register("documento")} 
  />
  {errors.documento && (
    <p className="text-sm text-red-500">{errors.documento.message}</p>
  )}
</div>

 <div>
 <div className="space-y-6">
        <label className="text-sm font-medium">
          Valor
        </label>
       <Input type="number" step="0.01" placeholder="0.00" {...register("amount")} />

{errors.amount && (
  <p className="text-sm text-red-500">{errors.amount.message}</p>
)}
</div>
<div className="space-y-2">
        <label className="text-sm font-medium">
          Conta
        </label>
        <Select onValueChange={(value) => setValue("accountId", value)} defaultValue={getValues("accountId")}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione a conta" />
  </SelectTrigger>
  <SelectContent>
    {accounts.map((account) => (
      <SelectItem key={account.id} value={account.id}>
        {account.name} (R${parseFloat(account.balance).toFixed(2)})
      </SelectItem>
    ))}
    <CreateAccountDrawer>
      <Button variant="ghost" className="w-full select-none items-center text-sm outline-none">Criar Conta</Button>
    </CreateAccountDrawer>
  </SelectContent>
</Select>

{errors.accountId && (
  <p className="text-sm text-red-500">{errors.accountId.message}</p>
)}
</div>
      </div>
<div className="space-y-2">
        <label className="text-sm font-medium">
          Categoria
        </label>
        <Select onValueChange={(value) => setValue("category", value)} defaultValue={getValues("category")}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione a categoria" />
  </SelectTrigger>
  <SelectContent>
    {filteredCategories.map((category) => (
      <SelectItem key={category.id} value={category.id}>
        {category.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{errors.category && (
  <p className="text-sm text-red-500">{errors.category.message}</p>
)}
</div>
<div className="space-y-2">
        <label className="text-sm font-medium">
          Data
        </label>
        <Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" className="w-full pl-3 text-left font-normal">
      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
     <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-auto p-0" align="start">
    <Calendar mode="single" selected={date} onSelect={(date) => setValue("date", date)} disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
    initialFocus
    /> 
  </PopoverContent>
</Popover>

{errors.date && (
  <p className="text-sm text-red-500">{errors.date.message}</p>
)}
</div>
  <div className="space-y-2">
    <label className="text-sm font-medium"> Descrição </label>
    <Input type="text" placeholder="Digite a descrição" {...register("description")} />
    {errors.description && (
      <p className="text-sm text-red-500">{errors.description.message}</p>
    )}
    </div>

     <div className="space-y-2">
                  <label htmlFor="isDefault">Transação Recorrente</label>
                  <p>Definir como recorrente esta transação</p>
                  <Switch id="isDefault" checked={isRecurring} onCheckedChange={(checked) => setValue("isRecurring", checked)}/>
                </div>
    
               {isRecurring && (
                <div className="space-y-2">
        <label className="text-sm font-medium">
          Intervalo Recorrente
        </label>
        <Select onValueChange={(value) => setValue("recurringInterval", value)} defaultValue={getValues("recurringInterval")}>
  <SelectTrigger>
    <SelectValue placeholder="Selecione o intervalo" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="DAILY">Diário</SelectItem>
    <SelectItem value="WEEKLY">Semanal</SelectItem>
    <SelectItem value="MONTHLY">Mensal</SelectItem>
    <SelectItem value="YEARLY">Anual</SelectItem>
  </SelectContent>
</Select>

{errors.recurringInterval && (
  <p className="text-sm text-red-500">{errors.recurringInterval.message}</p>
)}
</div>
               )}

        <div className="flex gap-4">
          <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" className="w-full" disabled={transactionLoading}>
          {transactionLoading ? (
            <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {editMode ? "Atualizando..." : "Criando..."}
            </>
          ) : editMode ? ( "Atualizar Transação" ) : ( "Criar Transação") 
        }</Button>
        </div>
    </form>
  );
};

export default AddTransactionForm;
