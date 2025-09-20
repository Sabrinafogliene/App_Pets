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


const NewVaccineDialog = ({ open, onOpenChange, onVaccineAdded, pets, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [vets, setVets] = useState([]);
  const [formData, setFormData] = useState({
    pet_id: '',
    name: '',
    date: '',
    next_dose: '',
    vet_id: '',
  });

  useEffect(() => {
    const fetchVets = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('user_type', 'vet');
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar veterinários.' });
      } else {
        setVets(data);
      }
    };
    if (open) {
      fetchVets();
    }
  }, [open, supabase, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Você precisa estar logado.' });
      return;
    }
    setIsLoading(true);

    const { error } = await supabase.from('vaccines').insert([
      {
        ...formData,
        user_id: user.id,
        next_dose: formData.next_dose || null,
        vet_id: formData.vet_id || null,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar vacina',
        description: error.message,
      });
    } else {
      toast({
        title: 'Vacina cadastrada com sucesso!',
      });
      onVaccineAdded();
      onOpenChange(false);
      setFormData({ pet_id: '', name: '', date: '', next_dose: '', vet_id: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Nova Vacina</DialogTitle>
          <DialogDescription>
            Registre uma nova vacina aplicada.
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
              <Label htmlFor="name" className="text-right">Nome da Vacina</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" placeholder="Ex: V10, Raiva" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data de Aplicação</Label>
              <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="next_dose" className="text-right">Próxima Dose</Label>
              <Input id="next_dose" type="date" value={formData.next_dose} onChange={handleInputChange} className="col-span-3" />
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
              {isLoading ? 'Salvando...' : 'Salvar Vacina'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVaccineDialog;