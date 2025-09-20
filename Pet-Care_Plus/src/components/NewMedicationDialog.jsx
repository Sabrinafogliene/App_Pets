import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from "@/lib/utils";

const NewMedicationDialog = ({ open, onOpenChange, onMedicationAdded, pets, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: '',
    name: '',
    dosage: '',
    frequency: '',
    active: true,
    inicio: '',
    termino: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };
  
  const handleSwitchChange = (id, checked) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Você precisa estar logado.' });
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.from('medications').insert([
      {
        ...formData,
        user_id: user.id,
        inicio: formData.inicio || null,
        termino: formData.termino || null,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar medicamento',
        description: error.message,
      });
    } else {
      toast({
        title: 'Medicamento cadastrado com sucesso!',
      });
      onMedicationAdded();
      onOpenChange(false);
      setFormData({ pet_id: '', name: '', dosage: '', frequency: '', active: true, inicio: '', termino: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Novo Medicamento</DialogTitle>
          <DialogDescription>
            Registre um novo medicamento ou tratamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pet_id" className="text-right">Pet</Label>
              <Select onValueChange={(value) => handleSelectChange('pet_id', value)} value={formData.pet_id}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o pet" /></SelectTrigger>
                <SelectContent>
                  {pets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" placeholder="Nome do medicamento" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">Dosagem</Label>
              <Input id="dosage" value={formData.dosage} onChange={handleInputChange} className="col-span-3" placeholder="Ex: 1 comprimido, 5ml" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="frequency" className="text-right">Frequência</Label>
              <Input id="frequency" value={formData.frequency} onChange={handleInputChange} className="col-span-3" placeholder="Ex: A cada 12 horas" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inicio" className="text-right">Início</Label>
              <Input id="inicio" type="date" value={formData.inicio} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="termino" className="text-right">Término</Label>
              <Input id="termino" type="date" value={formData.termino} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">Ativo</Label>
              <Switch id="active" checked={formData.active} onCheckedChange={(checked) => handleSwitchChange('active', checked)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Medicamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewMedicationDialog;