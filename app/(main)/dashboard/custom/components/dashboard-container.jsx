"use client";
import React, { useState } from 'react';
import DashboardGrid from './dashboard-grid';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Check } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteDashboardLayout, setDefaultDashboardLayout } from '@/actions/dashboard-layout';
import { toast } from 'sonner';

const DashboardContainer = ({ initialLayouts, availableWidgets, accounts, transactions }) => {
  const [layouts, setLayouts] = useState(initialLayouts);
  const [selectedLayoutId, setSelectedLayoutId] = useState(
    initialLayouts.find(l => l.isDefault)?.id || initialLayouts[0]?.id
  );
  const [isCreatingLayout, setIsCreatingLayout] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState("Meu Dashboard");
  const [newLayoutIsDefault, setNewLayoutIsDefault] = useState(false);
  
  const handleCreateLayout = () => {
    // Criar um novo layout vazio
    const newLayout = {
      id: `temp-${Date.now()}`,
      name: newLayoutName,
      isDefault: newLayoutIsDefault,
      layout: { lg: [] },
      widgets: [],
      isTemporary: true,
    };
    
    setLayouts(prev => [...prev, newLayout]);
    setSelectedLayoutId(newLayout.id);
    setIsCreatingLayout(false);
    
    // Limpar o formulário
    setNewLayoutName("Meu Dashboard");
    setNewLayoutIsDefault(false);
  };
  
  const handleDeleteLayout = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este dashboard?")) {
      return;
    }
    
    try {
      const result = await deleteDashboardLayout(id);
      
      if (result.success) {
        toast.success("Dashboard excluído com sucesso!");
        
        // Atualizar a lista de layouts
        setLayouts(prev => prev.filter(l => l.id !== id));
        
        // Se o layout excluído era o selecionado, selecionar outro
        if (id === selectedLayoutId) {
          const defaultLayout = layouts.find(l => l.isDefault && l.id !== id);
          setSelectedLayoutId(defaultLayout?.id || layouts[0]?.id);
        }
      } else {
        toast.error(result.error || "Erro ao excluir dashboard");
      }
    } catch (error) {
      console.error("Error deleting layout:", error);
      toast.error("Ocorreu um erro ao excluir o dashboard");
    }
  };
  
  const handleSetDefaultLayout = async (id) => {
    try {
      const result = await setDefaultDashboardLayout(id);
      
      if (result.success) {
        toast.success("Dashboard definido como padrão!");
        
        // Atualizar a lista de layouts
        setLayouts(prev => prev.map(l => ({
          ...l,
          isDefault: l.id === id
        })));
      } else {
        toast.error(result.error || "Erro ao definir dashboard padrão");
      }
    } catch (error) {
      console.error("Error setting default layout:", error);
      toast.error("Ocorreu um erro ao definir o dashboard padrão");
    }
  };
  
  const selectedLayout = layouts.find(l => l.id === selectedLayoutId);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Select
            value={selectedLayoutId}
            onValueChange={setSelectedLayoutId}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Selecione um dashboard" />
            </SelectTrigger>
            <SelectContent>
              {layouts.map(layout => (
                <SelectItem key={layout.id} value={layout.id}>
                  <div className="flex items-center gap-2">
                    {layout.name}
                    {layout.isDefault && (
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {selectedLayout && !selectedLayout.isDefault && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSetDefaultLayout(selectedLayoutId)}
            >
              <Check className="h-4 w-4 mr-2" />
              Definir como Padrão
            </Button>
          )}
          
          {selectedLayout && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleDeleteLayout(selectedLayoutId)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Dashboard
            </Button>
          )}
        </div>
        
        <Dialog open={isCreatingLayout} onOpenChange={setIsCreatingLayout}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Dashboard</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="layoutName">Nome do Dashboard</Label>
                <Input 
                  id="layoutName"
                  value={newLayoutName}
                  onChange={(e) => setNewLayoutName(e.target.value)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isDefault">Definir como padrão</Label>
                <Switch 
                  id="isDefault"
                  checked={newLayoutIsDefault}
                  onCheckedChange={setNewLayoutIsDefault}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleCreateLayout}>Criar Dashboard</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {selectedLayout ? (
        <DashboardGrid 
          key={selectedLayoutId}
          initialLayout={selectedLayout}
          availableWidgets={availableWidgets}
          accounts={accounts}
          transactions={transactions}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-muted-foreground mb-4">
            Você ainda não tem nenhum dashboard. Crie um novo para começar.
          </p>
          <Button onClick={() => setIsCreatingLayout(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Dashboard
          </Button>
        </div>
      )}
    </div>
  );
};

export default DashboardContainer;