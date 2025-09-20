
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, PawPrint, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewConsultationDialog from '@/components/NewConsultationDialog';
import EditConsultationDialog from '@/components/EditConsultationDialog';

const Consultas = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [selectedPet, setSelectedPet] = useState('todos');
  const [consultations, setConsultations] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentConsultation, setCurrentConsultation] = useState(null);

  const fetchConsultations = async () => {
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

    let query = supabase.from('consultations').select('*, pets(name)').eq('user_id', user.id);
    if (selectedPet !== 'todos') {
      query = query.eq('pet_id', selectedPet);
    }
    
    const { data, error } = await query.order('date', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar consultas.' });
    } else {
      setConsultations(data.map(c => ({
        ...c,
        pet: c.pets.name,
        dateFormatted: new Date(c.date).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }),
        veterinarian: c.location || 'Não informado',
        status: new Date(c.date) > new Date() ? 'Agendada' : 'Concluída',
        statusColor: new Date(c.date) > new Date() ? 'status-agendada' : 'status-concluida',
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConsultations();
  }, [supabase, user, toast, selectedPet]);

  const handleEdit = (consultation) => {
    setCurrentConsultation(consultation);
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <NewConsultationDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
        onConsultationAdded={fetchConsultations}
        pets={myPets}
        className="consultas-theme"
      />
      <EditConsultationDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onConsultationUpdated={fetchConsultations}
        consultation={currentConsultation}
        className="consultas-theme"
      />
      <div className="space-y-6 consultas-theme">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">Histórico de Consultas</h1>
          <p className="text-gray-600">Acompanhe todas as visitas ao veterinário</p>
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
                <SelectValue placeholder="Todos os Pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pets</SelectItem>
                {myPets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsNewDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Consulta
            </Button>
          </div>
        </motion.div>
        
        {loading ? (
          <div className="text-center py-8">Carregando consultas...</div>
        ) : (
          <div className="space-y-4">
            {consultations.map((consultation, index) => (
              <motion.div
                key={consultation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-4 sm:p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex-shrink-0 items-center justify-center hidden sm:flex">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{consultation.veterinarian}</h3>
                        <span className={`status-badge ${consultation.statusColor}`}>
                          {consultation.status}
                        </span>
                      </div>
                      <p className="text-gray-700 font-medium mb-1">{consultation.type}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <PawPrint className="w-4 h-4" />
                          <span>{consultation.pet}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{consultation.dateFormatted}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(consultation)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Consultas;
