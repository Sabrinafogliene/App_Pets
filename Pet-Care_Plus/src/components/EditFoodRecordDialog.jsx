
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
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from "@/lib/utils";

const EditFoodRecordDialog = ({ open, onOpenChange, onRecordUpdated, record, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    brand: '',
    quantity: '',
    schedules: '',
  });

  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type || '',
        brand: record.brand || '',
        quantity: record.quantity || '',
        schedules: record.schedules || '',
      });
    }
  }, [record]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!record) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('food_records')
      .update(formData)
      .eq('id', record.id);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar registro',
        description: error.message,
      });
    } else {
      toast({
        title: 'Registro de alimentação atualizado!',
      });
      onRecordUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Registro de Alimentação</DialogTitle>
          <DialogDescription>
            Atualize as informações de alimentação do seu pet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFoodRecordDialog;
