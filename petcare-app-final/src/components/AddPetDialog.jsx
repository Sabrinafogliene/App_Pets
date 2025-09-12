import React, { useState } from 'react';
import { PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';

const AddPetDialog = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    weight: '',
    history: ''
  });

  const { addPet } = useData();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.species || !formData.breed || !formData.age || !formData.weight) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const { error } = await addPet(formData);
    
    if (error) {
      toast({
        title: "Erro ao adicionar pet",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Pet adicionado com sucesso!",
        description: `${formData.name} foi cadastrado no PetCare+`,
      });

      setFormData({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        history: ''
      });

      onOpenChange(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PawPrint className="w-5 h-5 mr-2 text-purple-500" />
            Adicionar Novo Pet
          </DialogTitle>
          <DialogDescription>
            Preencha as informações do seu pet para começar a cuidar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pet-name">Nome *</Label>
            <Input
              id="pet-name"
              placeholder="Nome do pet"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet-species">Espécie *</Label>
              <Input
                id="pet-species"
                placeholder="Ex: Cão, Gato"
                value={formData.species}
                onChange={(e) => handleInputChange('species', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-breed">Raça *</Label>
              <Input
                id="pet-breed"
                placeholder="Ex: Labrador"
                value={formData.breed}
                onChange={(e) => handleInputChange('breed', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pet-age">Idade *</Label>
              <Input
                id="pet-age"
                placeholder="Ex: 2 anos"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pet-weight">Peso (kg) *</Label>
              <Input
                id="pet-weight"
                type="number"
                step="0.1"
                placeholder="Ex: 15.5"
                value={formData.weight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pet-history">Histórico (opcional)</Label>
            <Input
              id="pet-history"
              placeholder="Informações adicionais sobre o pet"
              value={formData.history}
              onChange={(e) => handleInputChange('history', e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Adicionar Pet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPetDialog;