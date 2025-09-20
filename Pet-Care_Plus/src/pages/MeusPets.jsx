import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import PetCard from '@/components/PetCard';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewPetDialog from '@/components/NewPetDialog';
import EditPetDialog from '@/components/EditPetDialog';

const MeusPets = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewPetDialogOpen, setIsNewPetDialogOpen] = useState(false);
  const [isEditPetDialogOpen, setIsEditPetDialogOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchPets = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('pets')
      .select('*, species, breed, file_path, birthday, castrated, registro')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar pets",
        description: error.message,
      });
    } else {
      setPets(data || []);
    }
    setLoading(false);
  };

  const handleEditPet = (pet) => {
    setSelectedPet(pet);
    setIsEditPetDialogOpen(true);
  };

  useEffect(() => {
    fetchPets();
  }, [supabase, user, toast]);

  const filteredPets = pets.filter(pet =>
    pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pets-theme">
      <NewPetDialog 
        open={isNewPetDialogOpen} 
        onOpenChange={setIsNewPetDialogOpen}
        onPetAdded={fetchPets}
        className="pets-theme"
      />

      <EditPetDialog
        open={isEditPetDialogOpen}
        onOpenChange={setIsEditPetDialogOpen}
        onPetUpdated={fetchPets}
        pet={selectedPet}
        key={selectedPet?.id || 'edit-pet-dialog'}
        className="pets-theme"
      />

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Meus Pets</h1>
          <p className="text-gray-600">Gerencie todos os seus companheiros</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl p-4 sm:p-6 card-shadow"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <PawPrint className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Pets Cadastrados ({pets.length})</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar pets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-auto"
                />
              </div>
              <Button onClick={() => setIsNewPetDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Pet
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Carregando seus pets...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPets.map((pet, index) => (
                <PetCard 
                  key={pet.id} 
                  pet={pet}
                  delay={index * 0.1}
                  onEditClick={handleEditPet}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default MeusPets;