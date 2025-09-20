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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from "@/lib/utils";

const EditMedicationDialog = ({ open, onOpenChange, onMedicationUpdated, medication, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    active: true,
    inicio: '',
    termino: '',
  });

  useEffect(() => {
    if (medication) {
      setFormData({
        name: medication.name || '',
        dosage: medication.dosage || '',
        frequency: medication.frequency || '',
        active: medication.active,
        inicio: medication.inicio ? new Date(medication.inicio).toISOString().split('T')[0] : '',
        termino: medication.termino ? new Date(medication.termino).toISOString().split('T')[0] : '',
      });
    }
  }, [medication]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id, checked) => {
    setFormData((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!medication) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('medications')
      .update({
        ...formData,
        inicio: formData.inicio || null,
        termino: formData.termino || null,
      })
      .eq('id', medication.id);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar medicamento',
        description: error.message,
      });
    } else {
      toast({
        title: 'Medicamento atualizado com sucesso!',
      });
      onMedicationUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Medicamento</DialogTitle>
          <DialogDescription>
            Atualize as informações do medicamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditMedicationDialog;