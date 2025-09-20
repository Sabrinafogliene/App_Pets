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
import { cn } from "@/lib/utils";

const EditConsultationDialog = ({ open, onOpenChange, onConsultationUpdated, consultation, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [vets, setVets] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    date: '',
    location: '',
    observations: '',
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

  useEffect(() => {
    if (consultation) {
      setFormData({
        type: consultation.type || '',
        date: consultation.date ? new Date(consultation.date).toISOString().split('T')[0] : '',
        location: consultation.location || '',
        observations: consultation.observations || '',
        vet_id: consultation.vet_id || '',
      });
    }
  }, [consultation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consultation) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('consultations')
      .update({
        ...formData,
        vet_id: formData.vet_id || null,
      })
      .eq('id', consultation.id);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar consulta',
        description: error.message,
      });
    } else {
      toast({
        title: 'Consulta atualizada com sucesso!',
      });
      onConsultationUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Consulta</DialogTitle>
          <DialogDescription>
            Atualize as informações da consulta.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">Tipo</Label>
              <Input id="type" value={formData.type} onChange={handleInputChange} className="col-span-3" placeholder="Ex: Rotina, Emergência" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Data</Label>
              <Input id="date" type="date" value={formData.date} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">Local</Label>
              <Input id="location" value={formData.location} onChange={handleInputChange} className="col-span-3" placeholder="Nome da clínica" required />
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
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observations" className="text-right">Observações</Label>
              <Input id="observations" value={formData.observations} onChange={handleInputChange} className="col-span-3" />
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

export default EditConsultationDialog;