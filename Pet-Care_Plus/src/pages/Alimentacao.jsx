
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Utensils, Edit, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewFoodRecordDialog from '@/components/NewFoodRecordDialog';
import EditFoodRecordDialog from '@/components/EditFoodRecordDialog';

const Alimentacao = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [selectedPet, setSelectedPet] = useState('');
  const [myPets, setMyPets] = useState([]);
  const [feedingRecords, setFeedingRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);

  const fetchFoodRecords = async () => {
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
      setFeedingRecords([]);
      setLoading(false);
      return;
    }

    const currentPetId = selectedPet || (petsData && petsData[0]?.id);
    if (!currentPetId) {
      setFeedingRecords([]);
      setLoading(false);
      return;
    }

    let query = supabase.from('food_records').select('*, pets(name)').eq('pet_id', currentPetId);
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar registros de alimentação.' });
      setFeedingRecords([]);
    } else {
      setFeedingRecords(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if(user) fetchFoodRecords();
  }, [supabase, user, toast, selectedPet]);

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setIsEditRecordOpen(true);
  };

  return (
    <>
      <NewFoodRecordDialog
        open={isNewRecordOpen}
        onOpenChange={setIsNewRecordOpen}
        onRecordAdded={fetchFoodRecords}
				pets={myPets}
				className="alimentacao-theme"
      />
      <EditFoodRecordDialog
        open={isEditRecordOpen}
        onOpenChange={setIsEditRecordOpen}
        onRecordUpdated={fetchFoodRecords}
        record={currentRecord}
        className="alimentacao-theme"
      />
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-orange-600 mb-2">Controle de Alimentação</h1>
          <p className="text-gray-600">Gerencie a dieta dos seus pets</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 alimentacao-theme"
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
            <Button onClick={() => setIsNewRecordOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Novo Registro
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">Carregando registros...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedingRecords.map((record, index) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Utensils className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{record.pets?.name}</h3>
                      <p className="text-sm text-gray-600">{record.type}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(record)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm"><span className="font-medium">Marca:</span> {record.brand}</p>
                    <p className="text-sm"><span className="font-medium">Quantidade:</span> {record.quantity}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span><span className="font-medium">Horários:</span> {record.schedules}</span>
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

export default Alimentacao;
