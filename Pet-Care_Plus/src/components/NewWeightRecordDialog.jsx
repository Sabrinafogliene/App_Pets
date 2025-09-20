import React, { useState, useEffect } from 'react';
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
import { cn } from '@/lib/utils'; 


const NewWeightRecordDialog = ({ open, onOpenChange, onRecordAdded, pets, petId, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: petId || '',
    weight: '',
    date: new Date().toISOString().split('T')[0],
  });

  React.useEffect(() => {
    if (open) {
      setFormData({
        pet_id: petId || '',
        weight: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [open, petId]);

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

    const { error } = await supabase.from('weight_records').insert([
      {
        ...formData,
        user_id: user.id,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao registrar peso',
        description: error.message,
      });
    } else {
      toast({
        title: 'Registro de peso salvo com sucesso!',
      });
      if (onRecordAdded) onRecordAdded();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Novo Registro de Peso</DialogTitle>
          <DialogDescription>
            Adicione um novo registro de peso para seu pet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!petId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pet_id" className="text-right">Pet</Label>
                <Select onValueChange={(value) => handleSelectChange('pet_id', value)} value={formData.pet_id}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o pet" /></SelectTrigger>
                  <SelectContent>
                    {pets && pets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} className="col-span-3" placeholder="Ex: 10.5" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" required />
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

export default NewWeightRecordDialog;