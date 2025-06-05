"use client";
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '@/components/ui/button';
import { Plus, Save, Trash2, Settings } from 'lucide-react';
import { saveDashboardLayout } from '@/actions/dashboard-layout';
import { toast } from 'sonner';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import WidgetSelector from './widget-selector';
import WidgetRenderer from './widget-renderer';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DashboardGrid = ({ initialLayout, availableWidgets, accounts, transactions }) => {
  const [layouts, setLayouts] = useState(initialLayout.layout || { lg: [] });
  const [widgets, setWidgets] = useState(initialLayout.widgets || []);
  const [dashboardName, setDashboardName] = useState(initialLayout.name || "Meu Dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
  };

  const handleSaveLayout = async () => {
    try {
      setIsSaving(true);
      const result = await saveDashboardLayout({
        id: initialLayout.id,
        name: dashboardName,
        layout: layouts,
        widgets: widgets,
        isDefault: initialLayout.isDefault,
      });
      
      if (result.success) {
        toast.success("Dashboard salvo com sucesso!");
      } else {
        toast.error("Erro ao salvar dashboard");
      }
    } catch (error) {
      console.error("Error saving layout:", error);
      toast.error("Ocorreu um erro ao salvar o layout");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType,
      settings: {}
    };
    
    setWidgets(prev => [...prev, newWidget]);
    
    // Adicionar ao layout
    const newLayoutItem = {
      i: newWidget.id,
      x: 0,
      y: Infinity, // Coloca no final
      w: 6,
      h: 4,
      minW: 3,
      minH: 3
    };
    
    setLayouts(prev => ({
      ...prev,
      lg: [...(prev.lg || []), newLayoutItem]
    }));
    
    setIsAddingWidget(false);
  };

  const handleRemoveWidget = (widgetId) => {
    setWidgets(prev => prev.filter(w => w.id !== widgetId));
    setLayouts(prev => ({
      ...prev,
      lg: (prev.lg || []).filter(item => item.i !== widgetId)
    }));
  };

  const handleWidgetSettingsChange = (widgetId, newSettings) => {
    setWidgets(prev => 
      prev.map(w => w.id === widgetId ? { ...w, settings: { ...w.settings, ...newSettings } } : w)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Input 
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
              className="w-64"
            />
          ) : (
            <h2 className="text-2xl font-bold">{dashboardName}</h2>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={isEditing ? "default" : "outline"} 
            size="sm"
              onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? "Concluir Edição" : "Editar Dashboard"}
          </Button>
          
          {isEditing && (
            <>
              <Dialog open={isAddingWidget} onOpenChange={setIsAddingWidget}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Widget
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Widget</DialogTitle>
                  </DialogHeader>
                  <WidgetSelector 
                    availableWidgets={availableWidgets}
                    onSelect={handleAddWidget}
                  />
                </DialogContent>
              </Dialog>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSaveLayout}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Salvando..." : "Salvar Layout"}
              </Button>
            </>
          )}
        </div>
      </div>
      
      <div className={`border rounded-lg p-4 ${isEditing ? 'bg-gray-50' : ''}`}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={100}
          isDraggable={isEditing}
          isResizable={isEditing}
          onLayoutChange={handleLayoutChange}
        >
          {widgets.map(widget => {
            const layoutItem = (layouts.lg || []).find(item => item.i === widget.id);
            if (!layoutItem) return null;
            
            return (
              <div key={widget.id} className="border rounded-lg bg-white shadow-sm overflow-hidden">
                {isEditing && (
                  <div className="bg-gray-100 p-2 flex justify-between items-center">
                    <span className="text-sm font-medium">{widget.type}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveWidget(widget.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
                <div className="p-4 h-full">
                  <WidgetRenderer 
                    widget={widget}
                    isEditing={isEditing}
                    onSettingsChange={(settings) => handleWidgetSettingsChange(widget.id, settings)}
                    accounts={accounts}
                    transactions={transactions}
                  />
                </div>
              </div>
            );
          })}
        </ResponsiveGridLayout>
        
        {widgets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">
              Seu dashboard está vazio. Adicione widgets para personalizar sua visualização.
            </p>
            {isEditing && (
              <Button 
                onClick={() => setIsAddingWidget(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Widget
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardGrid;