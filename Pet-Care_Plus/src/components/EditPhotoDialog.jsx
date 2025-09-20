import React, { useState, useEffect, useRef } from 'react';
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

const EditPhotoDialog = ({ open, onOpenChange, onPhotoUpdated, photo, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (photo) {
      setDescription(photo.description || '');
    }
  }, [photo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photo) {
      toast({ variant: 'destructive', title: 'Nenhuma foto selecionada.' });
      return;
    }
    setIsLoading(true);

    const { error } = await supabase
      .from('gallery')
      .update({ description: description })
      .eq('id', photo.id);

    setIsLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar a foto', description: error.message });
    } else {
      toast({ title: 'Foto atualizada com sucesso!' });
      if (onPhotoUpdated) onPhotoUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Foto</DialogTitle>
          <DialogDescription>
            Atualize a descrição da sua foto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Ex: Dia no parque" />
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

export default EditPhotoDialog;