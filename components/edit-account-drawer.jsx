"use client";
import React, { useEffect, useState } from 'react';
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from './ui/drawer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Input } from './ui/input';
import { accountSchema } from "@/app/lib/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { updateAccount, deleteAccount } from "@/actions/account";
import useFetch from '@/hooks/use-fetch';
import { Loader2, Target } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const EditAccountDrawer = ({ children, account }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account.name,
      type: account.type,
      balance: account.balance.toString(),
      targetGoal: account.targetGoal ? account.targetGoal.toString() : "",
      isDefault: account.isDefault,
    },
  });

  const { data: updatedAccount, error: updateError, fn: updateAccountFn, loading: updateLoading } = useFetch(updateAccount);
  const { data: deletedAccount, error: deleteError, fn: deleteAccountFn, loading: deleteLoading } = useFetch(deleteAccount);

  useEffect(() => {
    if (updatedAccount && !updateLoading) {
      toast.success("Conta atualizada com sucesso!");
      setOpen(false);
      router.refresh();
    }
  }, [updatedAccount, updateLoading, router]);

  useEffect(() => {
    if (deletedAccount && !deleteLoading) {
      toast.success("Conta deletada com sucesso!");
      setOpen(false);
      router.push('/dashboard');
    }
  }, [deletedAccount, deleteLoading, router]);

  useEffect(() => {
    if (updateError) {
      toast.error(updateError.message || "Ocorreu um erro ao atualizar a conta");
    }
    if (deleteError) {
      toast.error(deleteError.message || "Ocorreu um erro ao deletar a conta");
    }
  }, [updateError, deleteError]);

  const onSubmit = async (data) => {
    await updateAccountFn(account.id, data);
  };

  const handleDelete = async () => {
    if (window.confirm("Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita.")) {
      await deleteAccountFn(account.id);
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Editar Conta</DrawerTitle>
        </DrawerHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4 px-4'>
          <div className="space-y-2">
            <label htmlFor="name">Nome da Conta</label>
            <Input id='name' placeholder="ex: Alimentação" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
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
                <SelectItem value="SAVINGS">Economias</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="balance">Saldo</label>
            <Input id='balance' type="number" step="0.01" placeholder="0.00" {...register("balance")} />
            {errors.balance && (
              <p className="text-sm text-red-500">{errors.balance.message}</p>
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
              <p className="text-sm text-red-500">{errors.targetGoal.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="isDefault">Definir como padrão</label>
            <p>Essa conta será definida como padrão para as transações</p>
            <Switch id="isDefault" onCheckedChange={(checked) => setValue("isDefault", checked)} checked={watch("isDefault")} />
          </div>

          <div className="flex space-x-2 pb-4">
            <Button 
              type="button" 
              variant="destructive" 
              className="flex-1" 
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <><Loader2 className="animate-spin mr-2"/>Deletando...</>
              ) : (
                "Deletar Conta"
              )}
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={updateLoading}
            >
              {updateLoading ? (
                <><Loader2 className="animate-spin mr-2"/>Atualizando...</>
              ) : (
                "Atualizar Conta"
              )}
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
};

export default EditAccountDrawer;