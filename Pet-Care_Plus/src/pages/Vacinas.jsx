
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Syringe, PawPrint, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewVaccineDialog from '@/components/NewVaccineDialog';
import EditVaccineDialog from '@/components/EditVaccineDialog';

const Vacinas = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [selectedPet, setSelectedPet] = useState('todos');
  const [vaccines, setVaccines] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentVaccine, setCurrentVaccine] = useState(null);

  
  const fetchVaccines = async () => {
    if (!user) return;
    setLoading(true);

    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name')
      .eq('user_id', user.id);

    if (petsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pets.' });
    } else {
      setMyPets(petsData || []);
    }

    let query = supabase.from('vaccines').select('*, pets(name)').eq('user_id', user.id);
    if (selectedPet !== 'todos') {
      query = query.eq('pet_id', selectedPet);
    }
    
    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar vacinas.' });
    } else {
      setVaccines(data.map(v => ({
        ...v,
        pet: v.pets?.name || 'Pet não encontrado',
        name: v.name,
        appliedDate: new Date(v.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        nextDate: v.next_dose ? new Date(v.next_dose).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A',
        status: v.next_dose && new Date(v.next_dose) < new Date() ? 'Atrasada' : 'Em Dia',
        statusColor: v.next_dose && new Date(v.next_dose) < new Date() ? 'status-atrasada' : 'status-em-dia',
        icon: PawPrint,
      })) || []);
    }
    setLoading(false);
  };

  const fetchVets = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('user_type', 'vet');
    if (error) {
      console.error('Erro ao buscar veterinários:', error.message);
    } else {
      setVets(data || []);
    }
  };

  const handleEdit = (vaccine) => {
    setCurrentVaccine(vaccine);
    setIsEditDialogOpen(true);
  };

  useEffect(() => {
    fetchVaccines();
    fetchVets();
  }, [supabase, user, selectedPet]);

  const stats = {
    'Em Dia': vaccines.filter(v => v.status === 'Em Dia').length,
    'Venc. Próximo': vaccines.filter(v => v.status === 'Venc. Próximo').length,
    'Atrasadas': vaccines.filter(v => v.status === 'Atrasada').length,
  };

  return (
    <>
      <NewVaccineDialog 
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onVaccineAdded={fetchVaccines}
        pets={myPets}
        className="vacinas-theme"
        vets={vets}
      />
      <EditVaccineDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onVaccineUpdated={fetchVaccines}
        vaccine={currentVaccine}
        className="vacinas-theme"
        vets={vets}
      />
      <div className="space-y-6 vacinas-theme">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-green-600 mb-2">Controle de Vacinas</h1>
          <p className="text-gray-600">Mantenha as vacinas dos seus pets sempre em dia</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full md:w-auto">
              <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-green-100 text-green-800 text-center">
                <div className="text-xl sm:text-2xl font-bold">{stats['Em Dia']}</div>
                <div className="text-xs sm:text-sm font-medium">Em Dia</div>
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-yellow-100 text-yellow-800 text-center">
                <div className="text-xl sm:text-2xl font-bold">{stats['Venc. Próximo']}</div>
                <div className="text-xs sm:text-sm font-medium">Venc. Próximo</div>
              </div>
              <div className="px-3 py-2 sm:px-4 sm:py-3 rounded-lg bg-red-100 text-red-800 text-center">
                <div className="text-xl sm:text-2xl font-bold">{stats['Atrasadas']}</div>
                <div className="text-xs sm:text-sm font-medium">Atrasadas</div>
              </div>
            
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pets</SelectItem>
                {myPets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsNewDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Vacina
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">Carregando vacinas...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaccines.map((vaccine, index) => (
              <motion.div
                key={vaccine.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Syringe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vaccine.name}</h3>
                      <span className={`status-badge ${vaccine.statusColor}`}>
                        {vaccine.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(vaccine)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <vaccine.icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{vaccine.pet}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>📅 Aplicada em: {vaccine.appliedDate}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-red-600">
                    <span>📅 Próxima dose: {vaccine.nextDate}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Vacinas;
