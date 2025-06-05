// "use client";
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Progress } from '@/components/ui/progress';
// import { PlusCircle, Target, Trash } from 'lucide-react';
// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// // Dados de exemplo - em produção, estes viriam de uma API
// const mockGoals = [
//   {
//     id: 1,
//     name: "Fundo de emergência",
//     currentAmount: 5000,
//     targetAmount: 10000,
//     deadline: "2023-12-31",
//     category: "savings",
//     color: "#4EDCD4"
//   },
//   {
//     id: 2,
//     name: "Viagem para Europa",
//     currentAmount: 3500,
//     targetAmount: 15000,
//     deadline: "2024-06-30",
//     category: "travel",
//     color: "#FF6B6B"
//   },
//   {
//     id: 3,
//     name: "Entrada para apartamento",
//     currentAmount: 25000,
//     targetAmount: 50000,
//     deadline: "2025-01-15",
//     category: "housing",
//     color: "#45B7D1"
//   }
// ];

// const GOAL_CATEGORIES = [
//   { value: "savings", label: "Poupança" },
//   { value: "travel", label: "Viagem" },
//   { value: "housing", label: "Moradia" },
//   { value: "education", label: "Educação" },
//   { value: "retirement", label: "Aposentadoria" },
//   { value: "vehicle", label: "Veículo" },
//   { value: "other", label: "Outro" }
// ];

// const COLORS = [  
//   "#FF6B6B",  
//   "#4EDCD4",  
//   "#45B7D1",  
//   "#96CEB4",  
//   "#FFEEAD",  
//   "#D4A5A5",  
//   "#9F8DAA"  
// ];

// const FinanGoals = () => {
//   const [goals, setGoals] = useState(mockGoals);
//   const [newGoal, setNewGoal] = useState({
//     name: "",
//     currentAmount: 0,
//     targetAmount: 0,
//     deadline: "",
//     category: "",
//     color: COLORS[0]
//   });
//   const [isDialogOpen, setIsDialogOpen] = useState(false);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setNewGoal(prev => ({
//       ...prev,
//       [name]: name === 'currentAmount' || name === 'targetAmount' ? parseFloat(value) || 0 : value
//     }));
//   };

//   const handleSelectChange = (name, value) => {
//     setNewGoal(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   const handleAddGoal = () => {
//     if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline || !newGoal.category) {
//       alert("Por favor, preencha todos os campos obrigatórios");
//       return;
//     }

//     const goalToAdd = {
//       ...newGoal,
//       id: Date.now(),
//       color: COLORS[Math.floor(Math.random() * COLORS.length)]
//     };

//     setGoals(prev => [...prev, goalToAdd]);
//     setNewGoal({
//       name: "",
//       currentAmount: 0,
//       targetAmount: 0,
//       deadline: "",
//       category: "",
//       color: COLORS[0]
//     });
//     setIsDialogOpen(false);
//   };

//   const handleDeleteGoal = (id) => {
//     if (confirm("Tem certeza que deseja excluir esta meta?")) {
//       setGoals(prev => prev.filter(goal => goal.id !== id));
//     }
//   };

//   const calculateDaysRemaining = (deadline) => {
//     const today = new Date();
//     const deadlineDate = new Date(deadline);
//     const diffTime = deadlineDate - today;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays > 0 ? diffDays : 0;
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-xl font-semibold">Metas Financeiras</CardTitle>
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogTrigger asChild>
//             <Button size="sm" className="flex items-center gap-1">
//               <PlusCircle className="h-4 w-4" />
//               Nova Meta
//             </Button>
//           </DialogTrigger>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>Adicionar Nova Meta</DialogTitle>
//               <DialogDescription>
//                 Defina uma nova meta financeira para acompanhar seu progresso.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="name" className="text-right">
//                   Nome
//                 </Label>
//                 <Input
//                   id="name"
//                   name="name"
//                   value={newGoal.name}
//                   onChange={handleInputChange}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="currentAmount" className="text-right">
//                   Valor Atual
//                 </Label>
//                 <Input
//                   id="currentAmount"
//                   name="currentAmount"
//                   type="number"
//                   value={newGoal.currentAmount}
//                   onChange={handleInputChange}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="targetAmount" className="text-right">
//                   Valor Alvo
//                 </Label>
//                 <Input
//                   id="targetAmount"
//                   name="targetAmount"
//                   type="number"
//                   value={newGoal.targetAmount}
//                   onChange={handleInputChange}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="deadline" className="text-right">
//                   Prazo
//                 </Label>
//                 <Input
//                   id="deadline"
//                   name="deadline"
//                   type="date"
//                   value={newGoal.deadline}
//                   onChange={handleInputChange}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <Label htmlFor="category" className="text-right">
//                   Categoria
//                 </Label>
//                 <Select 
//                   value={newGoal.category} 
//                   onValueChange={(value) => handleSelectChange("category", value)}
//                 >
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Selecione uma categoria" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {GOAL_CATEGORIES.map((category) => (
//                       <SelectItem key={category.value} value={category.value}>
//                         {category.label}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//             <DialogFooter>
//               <Button type="submit" onClick={handleAddGoal}>Adicionar Meta</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </CardHeader>
//       <CardContent>
//         {goals.length === 0 ? (
//           <div className="text-center py-6 text-muted-foreground">
//             <Target className="mx-auto h-12 w-12 opacity-50 mb-2" />
//             <p>Você ainda não tem metas financeiras.</p>
//             <p className="text-sm">Adicione sua primeira meta para começar a acompanhar seu progresso.</p>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {goals.map((goal) => {
//               const progress = (goal.currentAmount / goal.targetAmount) * 100;
//               const daysRemaining = calculateDaysRemaining(goal.deadline);
              
//               return (
//                 <div key={goal.id} className="border rounded-lg p-4">
//                   <div className="flex justify-between items-start mb-2">
//                     <div>
//                       <h3 className="font-medium">{goal.name}</h3>
//                       <p className="text-sm text-muted-foreground capitalize">{
//                         GOAL_CATEGORIES.find(cat => cat.value === goal.category)?.label || goal.category
//                       }</p>
//                     </div>
//                     <Button 
//                       variant="ghost" 
//                       size="icon" 
//                       className="h-8 w-8" 
//                       onClick={() => handleDeleteGoal(goal.id)}
//                     >
//                       <Trash className="h-4 w-4 text-red-500" />
//                     </Button>
//                   </div>
                  
//                   <div className="mb-2">
//                     <div className="flex justify-between text-sm mb-1">
//                       <span>Progresso: {progress.toFixed(0)}%</span>
//                       <span>R$ {goal.currentAmount.toFixed(2)} / R$ {goal.targetAmount.toFixed(2)}</span>
//                     </div>
//                     <Progress value={progress} className="h-2" indicatorColor={goal.color} />
//                   </div>
                  
//                   <div className="text-sm text-muted-foreground flex justify-between">
//                     <span>Prazo: {new Date(goal.deadline).toLocaleDateString()}</span>
//                     <span>{daysRemaining} dias restantes</span>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// export default FinanGoals;
