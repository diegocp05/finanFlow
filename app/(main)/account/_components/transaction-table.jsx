"use client";
import { bulkDeleteTransactions } from '@/actions/account';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import useFetch from '@/hooks/use-fetch';
import { format } from 'date-fns';
import { Check, ChevronUp,ChevronDown , Clock, MoreHorizontal, RefreshCcw, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react'
import { BarLoader } from 'react-spinners';
import { toast } from 'sonner';

const RECURRING_INTERVALS = {
  DAILY: "Diário",
    WEEKLY: "Semanal",
    MONTHLY: "Mensal",
    YEARLY: "Anual",
  };


const TransactionTable = ({transactions}) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field:"date",
    direction:"desc",
});

const [searchTerm, setSearchTerm] = useState("");
const [typeFilter, setTypeFilter] = useState("");
const [recurringFilter, setRecurringFilter] = useState("");

const {loading: deleteLoading,
  fn: deleteFn,
  data: deleted,
} = useFetch(bulkDeleteTransactions);



  const filteredAndSortedTransactions = useMemo(()=>{
    let result = [...transactions];

    if(searchTerm){
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower) || 
        transaction.corporateName?.toLowerCase().includes(searchLower) ||
        transaction.documento?.toLowerCase().includes(searchLower)
      );
    }

    if(recurringFilter){
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    if(typeFilter){
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    result.sort((a,b) => {
      let comparison = 0;
      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "type":
          comparison = b.type.localeCompare(a.type);
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        case "corporateName":
          const nameA = a.corporateName || "";
          const nameB = b.corporateName || "";
          comparison = nameA.localeCompare(nameB);
          break;
        case "documento":
          const docA = a.documento || "";
          const docB = b.documento || "";
          comparison = docA.localeCompare(docB);
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "asc" ? comparison : -comparison;
    })

    return result;},
    [
    transactions,
    searchTerm,
    typeFilter,
    recurringFilter,
    sortConfig,
  ]);
  const handleSort = (field) =>{
    setSortConfig((current)=>({
      field, direction: current.field == field && current.direction === "asc" ? "desc" : "asc",}
    ));
  };

const handleSelect=(id)=>{
  setSelectedIds(current=>current.includes(id)?current.filter(item=>item!=id):[...current,id])
};
const handleSelectAll = () => {
  setSelectedIds((current) =>
     current.length === filteredAndSortedTransactions.length ? [] : filteredAndSortedTransactions.map((t) =>t.id));
};

const handleBulkDelete = async () => {
  console.log("Iniciando deleção em massa", { selectedIds });
  
  if(!window.confirm(
    `Tem certeza que deseja deletar ${selectedIds.length} transações?`
  )){
    console.log("Deleção cancelada pelo usuário");
    return;
  }
  
  try {
    console.log("Chamando deleteFn com IDs:", selectedIds);
    await deleteFn(selectedIds);
    console.log("Chamada deleteFn concluída");
    // A limpeza dos IDs selecionados e atualização da UI será feita no useEffect
  } catch (error) {
    console.error("Erro ao deletar transações:", error);
    toast.error("Erro ao deletar transações");
  }
};


useEffect(() => {
  if(deleted && !deleteLoading){
    toast.success("Transações deletadas com sucesso!");
    setSelectedIds([]); // Limpa os IDs selecionados após exclusão bem-sucedida
    router.refresh(); // Força a atualização da página para refletir as mudanças
  }
}, [deleted, deleteLoading, router]);

const handleClearFilters = () => {
  setSearchTerm("");
  setTypeFilter("");
  setRecurringFilter("");
  setSelectedIds([]);
};

  return (
    <div className="space-y-4">
      {deleteLoading && (<BarLoader className="mt-4" width={"100%"} color="#9333ea" />)}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar transações..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8"/>
        </div>
      </div>

      <div className="flex gap-2">
      <Select value={typeFilter} onValueChange={setTypeFilter}>
  <SelectTrigger>
    <SelectValue placeholder="Todos os tipos" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="INCOME">Renda</SelectItem>
    <SelectItem value="EXPENSE">Despesa</SelectItem>
  </SelectContent>
</Select>
 
<Select value={recurringFilter} onValueChange={(value) => (setRecurringFilter(value))}>
  <SelectTrigger className="w-[130px]">
    <SelectValue placeholder="Todos as transações" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="recurring">Apenas Recorrente</SelectItem>
    <SelectItem value="not-recurring">Apenas não Recorrente</SelectItem>
  </SelectContent>
</Select>
{selectedIds.length > 0 && (
  <div>
    <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
      <Trash className="h-4 w-4 mr-2"/>
      Deletar Seleção ({selectedIds.length})
    </Button>
    </div>
)}

 {(searchTerm || typeFilter || recurringFilter) && (
  <Button variant="outline" size="icon" onClick={handleClearFilters} title="Limpar Filtros">
    <X className="h-4 w-5" />
  </Button>
 )}
</div>

    
        <Table className="rounded-md border">
  <TableHeader>
    <TableRow>
      <TableHead className="w-[50px]">
        <Checkbox  onCheckedChange={handleSelectAll}
        checked={selectedIds.length === filteredAndSortedTransactions.length && filteredAndSortedTransactions.length > 0}/>  
      </TableHead>
      <TableHead className="cursor-pointer"
      onClick={() => handleSort("date")}>
        <div className="flex items-center"> Data
          {sortConfig.field==='date'&&(
          sortConfig.direction==="asc"? <ChevronUp className="ml-1 h-4 w-4" />: <ChevronDown className="ml-1 h-4 w-4" />
        )}</div>
        </TableHead>
         <TableHead className="cursor-pointer"
      onClick={() => handleSort("corporateName")}>
        <div className="flex items-center">Cliente/Fornecedor {sortConfig.field==='corporateName'&&(
          sortConfig.direction==="asc"? <ChevronUp className="ml-1 h-4 w-4" />: <ChevronDown className="ml-1 h-4 w-4" />
        )}</div>
         </TableHead>
         
    
      <TableHead className="cursor-pointer"
      onClick={() => handleSort("documento")}>
        <div className="flex items-center">Documento {sortConfig.field==='documento'&&(
          sortConfig.direction==="asc"? <ChevronUp className="ml-1 h-4 w-4" />: <ChevronDown className="ml-1 h-4 w-4" />
        )}</div>
      </TableHead>
        <TableHead>Descrição</TableHead>
      <TableHead className="cursor-pointer"
      onClick={() => handleSort("category")}>
        <div className="flex items-center">Categoria {sortConfig.field==='category'&&(
          sortConfig.direction==="asc"? <ChevronUp className="ml-1 h-4 w-4" />: <ChevronDown className="ml-1 h-4 w-4" />
        )}</div>
        </TableHead>
       <TableHead className="cursor-pointer flex items-center justify-end"
      onClick={() => handleSort("amount")}>Valor
      {sortConfig.field==='amount'&&(
          sortConfig.direction==="asc"? <ChevronUp className="ml-1 h-4 w-4" />: <ChevronDown className="ml-1 h-4 w-4" />
        )}
        </TableHead>
      <TableHead>Recorrente</TableHead>
      <TableHead className="w-[50px]"/>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredAndSortedTransactions.length === 0?(
      <TableRow>
        <TableCell colSpan={9} className="text-center text-muted-foreground">Nenhuma transação encontrada</TableCell>
      </TableRow>
    ):(
      filteredAndSortedTransactions.map((transaction) => (
    <TableRow key={transaction.id}>
      <TableCell>
        <Checkbox onCheckedChange={() => handleSelect(transaction.id)} 
        checked={selectedIds.includes(transaction.id)} />
      </TableCell>
      <TableCell>{format(new Date(transaction.date), "PP")}</TableCell>
      <TableCell>{transaction.corporateName || "-"}</TableCell>
      <TableCell>{transaction.documento || "-"}</TableCell>
      <TableCell>{transaction.description}</TableCell>
      <TableCell className="capitalize">
        <span style={{
          background: categoryColors [transaction.category],
        }}
        className="px-2 py-1 rounded text-white text-sm">{transaction.category}</span>
        </TableCell>
        <TableCell className="text-right font-medium"
          style={{color:transaction.type === "EXPENSE"? "red" : "green"}}>
          {transaction.type=== "EXPENSE"? "-" : "+"}
          R${transaction.amount.toFixed(2)}
          </TableCell>
          <TableCell>
            {transaction.isRecurring ? (
            <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
              <Badge variant="outline" className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
            <RefreshCcw className="w-3 h-3"/>
            {RECURRING_INTERVALS[transaction.recurringInterval]}
            </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-sm">
                  <div>
                    Próxima Data:
                  </div>
                  <div>
                    {format(new Date(transaction.nextRecurringDate), "PP")}
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          ): (<Badge variant="outline" className="gap-1">
            <Clock className="w-3 h-3"/>
            Uma vez
            </Badge>
          )}
            </TableCell>
            <TableCell>
            <DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem
    onClick={() =>
      router.push(
        `/transaction/create?edit=${transaction.id}`
      )
    }>Editar</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem className="text-destructive" 
      onClick={() => deleteFn([transaction.id])}
    >Deletar</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
            </TableCell>
    </TableRow>
      ))
    )}
  </TableBody>
</Table>

    </div>
  );
}
export default  TransactionTable;
