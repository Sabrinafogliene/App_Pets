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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from "@/lib/utils";

const NewFoodRecordDialog = ({ open, onOpenChange, onRecordAdded, pets, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: '',
    type: '',
    brand: '',
    quantity: '',
    schedules: '',
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !formData.pet_id) {
      toast({ variant: 'destructive', title: 'Selecione um pet.' });
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.from('food_records').insert([
      {
        ...formData,
        user_id: user.id,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar alimentação',
        description: error.message,
      });
    } else {
      toast({
        title: 'Registro de alimentação salvo com sucesso!',
      });
      onRecordAdded();
      onOpenChange(false);
      setFormData({ pet_id: '', type: '', brand: '', quantity: '', schedules: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Novo Registro de Alimentação</DialogTitle>
          <DialogDescription>
            Adicione um novo registro de alimentação para seu pet.
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
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Input id="type" value={formData.type} onChange={handleInputChange} className="col-span-3" placeholder="Ex: Ração, Comida úmida" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="brand" className="text-right">Marca</Label>
              <Input id="brand" value={formData.brand} onChange={handleInputChange} className="col-span-3" placeholder="Ex: Golden, Royal Canin" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantidade</Label>
              <Input id="quantity" value={formData.quantity} onChange={handleInputChange} className="col-span-3" placeholder="Ex: 100g, 1 xícara" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schedules" className="text-right">Horários</Label>
              <Input id="schedules" value={formData.schedules} onChange={handleInputChange} className="col-span-3" placeholder="Ex: 08:00, 20:00" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Registro'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewFoodRecordDialog;