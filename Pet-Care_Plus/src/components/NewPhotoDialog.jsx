import React, { useState, useRef, useEffect } from 'react';
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
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

const NewPhotoDialog = ({ open, onOpenChange, onPhotoAdded, pets, petId: initialPetId, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [petId, setPetId] = useState(initialPetId || '');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPetId(initialPetId || '');
      setDescription('');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [open, initialPetId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !petId || !file) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos e selecione um arquivo.' });
      return;
    }
    setIsLoading(true);

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('gallery')
      .upload(filePath, file);

    if (uploadError) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Erro no upload', description: uploadError.message });
      return;
    }

    const { error: dbError } = await supabase.from('gallery').insert({
      pet_id: petId,
      user_id: user.id,
      file_path: filePath,
      description: description,
    });

    setIsLoading(false);

    if (dbError) {
      toast({ variant: 'destructive', title: 'Erro ao salvar no banco', description: dbError.message });
    } else {
      toast({ title: 'Foto adicionada com sucesso!' });
      if (onPhotoAdded) onPhotoAdded();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Adicionar Nova Foto</DialogTitle>
          <DialogDescription>
            Escolha uma foto e adicione à galeria do seu pet.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!initialPetId && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pet_id" className="text-right">Pet</Label>
                <Select onValueChange={setPetId} value={petId}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Selecione o pet" /></SelectTrigger>
                  <SelectContent>
                    {pets && pets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">Descrição</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Ex: Dia no parque" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">Foto</Label>
              <Input id="photo" type="file" onChange={handleFileChange} ref={fileInputRef} className="col-span-3" accept="image/*" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enviando...' : 'Adicionar Foto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPhotoDialog;