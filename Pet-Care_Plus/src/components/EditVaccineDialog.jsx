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
import { format} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

const EditVaccineDialog = ({ open, onOpenChange, onVaccineUpdated, vaccine, vets, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    pet_id: '',
    name: '',
    date: '',
    next_dose: '',
    vet_id: '',
  });

  useEffect(() => {
    if (vaccine) {
      setFormData({
        pet_id: vaccine.pet_id || '',
        name: vaccine.name || '',
        date: vaccine.date || '',
        next_dose: vaccine.next_dose || '',
        vet_id: vaccine.vet_id || '',
      });
    }
  }, [vaccine]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vaccine || !formData.pet_id || !formData.name || !formData.date || !formData.vet_id) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos obrigatórios.' });
      return;
    }
    setIsLoading(true);

    const { error: updateError } = await supabase
      .from('vaccines')
      .update({
        ...formData,
        user_id: vaccine.user_id,
      })
      .eq('id', vaccine.id);

    setIsLoading(false);

    if (updateError) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar vacina',
        description: updateError.message,
      });
    } else {
      toast({
        title: 'Vacina atualizada com sucesso!',
      });
      onVaccineUpdated();
      onOpenChange(false);
    }
  };

  if (!vaccine) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Vacina</DialogTitle>
          <DialogDescription>
            Atualize as informações da vacina para {vaccine.pet}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pet_id" className="text-right">Pet</Label>
              <Input id="pet_id" value={vaccine.pet} className="col-span-3 !rounded-lg !shadow-sm" disabled />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome da Vacina</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3 !rounded-lg !shadow-sm" placeholder="Ex: V10, Raiva" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data de Aplicação</Label>
              <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3 !rounded-lg !shadow-sm" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="next_dose" className="text-right">Próxima Dose</Label>
              <Input id="next_dose" type="date" value={formData.next_dose} onChange={handleInputChange} className="col-span-3 !rounded-lg !shadow-sm" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vet_id" className="text-right">Veterinário</Label>
              <Select onValueChange={(value) => handleSelectChange('vet_id', value)} value={formData.vet_id}>
                <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o veterinário" /></SelectTrigger>
                <SelectContent>
                  {vets.map(vet => <SelectItem key={vet.id} value={vet.id}>{vet.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
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

export default EditVaccineDialog;