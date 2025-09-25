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
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
const NewPetDialog = ({ open, onOpenChange, onPetAdded, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState ({
    name: '',
    species: '',
    breed: '',
    birthday: '', 
    gender: '',
    castrated: false, 
    registro: false, 
    registration_number: '',
  });

  const[hasRegistro, setHasRegistro] = useState(false);
  
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckboxChange = (id, checked) => {
    if (id === 'castrated') {
      setFormData((prev) => ({ ...prev, castrated: checked }));
    } else if (id === 'registro') {
      setFormData((prev) => ({ ...prev, registro: checked }));
      setHasRegistro(checked);
      if (!checked) {
        setFormData((prev) => ({ ...prev, registration_number: '' }));
      }
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast({ variant: 'destructive', title: 'Você precisa estar logado.' });
      return;
    }
    setIsLoading(true);

    // Padronizar espécie para minúsculo e sem acento
    const normalizeSpecies = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const petDataToSave = {
      ...formData,
      species: normalizeSpecies(formData.species),
      weight: parseFloat(formData.weight) || null,
      user_id: user.id,
      registration_number: formData.registro ? formData.registration_number : null,
    };

    const { error } = await supabase.from('pets').insert([
      {
        ...formData,
        user_id: user.id,
        registration_number: formData.registro ? formData.registration_number : null,
      },
    ]);

    setIsLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao cadastrar pet',
        description: error.message,
      });
    } else {
      toast({
        title: 'Pet cadastrado com sucesso!',
      });
      onPetAdded();
      onOpenChange(false);
      setFormData({
        name: '',
        species: '',
        breed: '',
        birthday: '',
        weight: '',
        gender: '',
        castrated: false,
        registro: false,
        registration_number: ''
      });
      setHasRegistro(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Cadastrar Novo Pet</DialogTitle>
          <DialogDescription>
            Preencha as informações abaixo para adicionar um novo companheiro.
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

            <div className="flex items-center space-x-2">
              <Checkbox
                id="castrated"
                checked={formData.castrated}
                onChange={(e) => handleCheckboxChange('castrated', e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <Label
                htmlFor="castrated" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Castrado
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="registro"
                checked={hasRegistro}
                onCheckedChange={(checked) => handleCheckboxChange('registro', checked)}
              />
              <Label
                htmlFor="registro" 
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                  Registro
              </Label>
            </div>
            {hasRegistro && (
              <div className="space-y-2">
                <Label htmlFor="registration_number" className="text-right">Nº Registro</Label>
                <Input
                  id="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder="Ex: microchip, anilha, etiqueta..."
                />
              </div>
            )}
          
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Pet'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewPetDialog;