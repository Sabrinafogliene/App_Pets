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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { v4 as uuidv4 } from 'uuid';
import { cn } from "@/lib/utils";

const EditPetDialog = ({ open, onOpenChange, onPetUpdated, pet, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    birthday: '',
    weight: '',
    gender: '',
    castrated: false,
    registro: false,
    registration_number: '',
  });

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name || '',
        species: pet.species || '',
        breed: pet.breed || '',
        birthday: pet.birthday || '',
        weight: pet.weight || '',
        gender: pet.gender || '',
        castrated: pet.castrated || false,
        registro: pet.registro || false,
        registration_number: pet.registration_number || '',
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [pet]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pet || !user) return;
    setIsLoading(true);

    let filePathForDb = pet.file_path;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const newFilePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(newFilePath, file);

      if (uploadError) {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Erro no upload da foto', description: uploadError.message });
        return;
      }
      
      filePathForDb = newFilePath;
    }

    // Padronizar espécie para minúsculo e sem acento
    const normalizeSpecies = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const petDataToUpdate = {
      ...formData,
      species: normalizeSpecies(formData.species),
      weight: parseFloat(formData.weight) || null,
      file_path: filePathForDb,
      registration_number: formData.registro ? formData.registration_number : null,
    };

    const { error: updateError } = await supabase
      .from('pets')
      .update(petDataToUpdate)
      .eq('id', pet.id);

    setIsLoading(false);

    if (updateError) {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar pet',
        description: updateError.message,
      });
    } else {
      toast({
        title: 'Pet atualizado com sucesso!',
      });
      onPetUpdated();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px] pets-theme", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Pet</DialogTitle>
          <DialogDescription>
            Atualize as informações do seu companheiro.
          </DialogDescription>
        </DialogHeader> 
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input id="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="species" className="text-right">Espécie</Label>
              <Select onValueChange={(value) => handleSelectChange('species', value)} value={formData.species}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cachorro">Cachorro 🐕</SelectItem>
                  <SelectItem value="Gato">Gato 🐈</SelectItem>
                  <SelectItem value="Pássaro">Pássaro 🦜</SelectItem>
                  <SelectItem value="Coelho">Coelho 🐇</SelectItem>
                  <SelectItem value="Peixe">Peixe 🐟</SelectItem>
                  <SelectItem value="Cavalo">Cavalo 🐎</SelectItem>
                  <SelectItem value="Lhama">Lhama 🦙</SelectItem>
                  <SelectItem value="Cabra">Cabra 🐐</SelectItem>
                  <SelectItem value="Bovino">Bovino 🐄</SelectItem>
                  <SelectItem value="Porco">Porco 🐖</SelectItem> 
                  <SelectItem value="Reptil">Réptil 🐢</SelectItem>
                  <SelectItem value="Roedor">Roedor 🐀</SelectItem>                               
                  <SelectItem value="Outro">Outro 🐾</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="breed" className="text-right">Raça</Label>
              <Input id="breed" value={formData.breed} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthday" className="text-right">Nascimento</Label>
              <Input id="birthday" type="date" value={formData.birthday} onChange={handleInputChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="weight" className="text-right">Peso (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={formData.weight} onChange={handleInputChange} className="col-span-3" placeholder="Ex: 10.5" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Gênero</Label>
              <Select onValueChange={(value) => handleSelectChange('gender', value)} value={formData.gender}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o gênero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Macho">Macho ♂️</SelectItem>
                  <SelectItem value="Fêmea">Fêmea ♀️</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="photo" className="text-right">Foto de Perfil</Label>
              <Input id="photo" type="file" onChange={handleFileChange} ref={fileInputRef} className="col-span-3" accept="image/*" />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="castrated" className="text-right">Castrado</Label>
              <input
                type="checkbox"
                id="castrated"
                checked={formData.castrated}
                onChange={handleInputChange}
                className="col-span-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="registro" className="text-right">Registro</Label>
              <input
                type="checkbox"
                id="registro"
                checked={formData.registro}
                onChange={handleInputChange}
                className="col-span-3 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
            </div>

            {formData.registro && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="registration_number" className="text-right">Nº Registro</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  className="col-span-3"
                  placeholder="Ex: microchip, anilha, etiqueta..."
                />
              </div>
            )}

          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPetDialog;