import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pill, PawPrint, Edit, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewMedicationDialog from '@/components/NewMedicationDialog';
import EditMedicationDialog from '@/components/EditMedicationDialog';

const Medicamentos = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [selectedPet, setSelectedPet] = useState('');
  const [medications, setMedications] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMedication, setCurrentMedication] = useState(null);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

  const fetchMedications = async () => {
    if (!user) return;
    setLoading(true);

    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name')
      .eq('user_id', user.id);

    if (petsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pets.' });
      setMyPets([]);
    } else {
      setMyPets(petsData || []);
       if ((petsData || []).length > 0 && !selectedPet) {
        setSelectedPet(petsData[0].id);
      }
    }
    
    if (!selectedPet && (petsData || []).length === 0) {
      setMedications([]);
      setLoading(false);
      return;
    }

    const currentPetId = selectedPet || (petsData && petsData[0]?.id);
    if (!currentPetId) {
        setMedications([]);
        setLoading(false);
        return;
    }

    let query = supabase.from('medications').select('*, pets(name)').eq('pet_id', currentPetId);
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar medicamentos.' });
      setMedications([]);
    } else {
      setMedications(data.map(m => ({
        ...m,
        pet: m.pets?.name,
        status: m.active ? 'Ativo' : 'Finalizado',
        statusColor: m.active ? 'status-ativo' : 'status-finalizado',
        startDate: formatDate(m.inicio),
        endDate: formatDate(m.termino),
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if(user) fetchMedications();
  }, [supabase, user, toast, selectedPet]);


  const handleEdit = (medication) => {
    setCurrentMedication(medication);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <NewMedicationDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onMedicationAdded={fetchMedications}
        pets={myPets}
        className="medicamentos-theme"
      />
      <EditMedicationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onMedicationUpdated={fetchMedications}
        medication={currentMedication}
        className="medicamentos-theme"
      />
      <div className="space-y-6 medicamentos-theme">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Medicamentos e Tratamentos</h1>
          <p className="text-gray-600">Gerencie os medicamentos em uso</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div></div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Selecione um Pet" />
              </SelectTrigger>
              <SelectContent>
                {myPets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsNewDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Medicamento
            </Button>
          </div>
        </motion.div>
        
        {loading ? (
          <div className="text-center py-8">Carregando medicamentos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medications.map((medication, index) => (
              <motion.div
                key={medication.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Pill className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                      <span className={`status-badge ${medication.statusColor}`}>
                        {medication.status}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(medication)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <PawPrint className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{medication.pet}</span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm"><span className="font-medium">Dosagem:</span> {medication.dosage}</p>
                    <p className="text-sm"><span className="font-medium">Frequência:</span> {medication.frequency}</p>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Início: {medication.startDate}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Fim: {medication.endDate}</span>
                    </div>
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

export default Medicamentos;