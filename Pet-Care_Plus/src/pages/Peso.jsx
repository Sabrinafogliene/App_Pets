
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Scale, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

const Peso = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [myPets, setMyPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightData, setWeightData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const fetchPetsAndInitialData = async () => {
    if (!user) return;
    setIsFetching(true);
    const { data: petsData, error: petsError } = await supabase.from('pets').select('id, name').eq('user_id', user.id);
    if (petsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pets' });
      setMyPets([]);
      setIsFetching(false);
      return;
    }
    
    setMyPets(petsData || []);
    const petToLoad = selectedPet || (petsData && petsData.length > 0 ? petsData[0].id : '');
    setSelectedPet(petToLoad);
    
    if (petToLoad) {
      await fetchWeightData(petToLoad);
    } else {
      setWeightData([]);
    }
    setIsFetching(false);
  };
  
  const fetchWeightData = async (petId) => {
    if (!user || !petId) {
      setWeightData([]);
      return;
    };
    const { data, error } = await supabase
      .from('weight_records')
      .select('weight, date')
      .eq('pet_id', petId)
      .order('date', { ascending: true });
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar dados de peso' });
      setWeightData([]);
    } else {
      setWeightData(data.map(d => ({
        date: new Date(d.date).toLocaleDateString('pt-BR'),
        peso: d.weight
      })));
    }
  };

  useEffect(() => {
    fetchPetsAndInitialData();
  }, [user, supabase]);

  useEffect(() => {
    if(selectedPet) {
      fetchWeightData(selectedPet);
    }
  }, [selectedPet]);

  const handleSaveWeight = async () => {
    if (!weight || !date || !selectedPet) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos' });
      return;
    }
    setIsLoading(true);
    const { error } = await supabase.from('weight_records').insert({
      pet_id: selectedPet,
      user_id: user.id,
      weight: parseFloat(weight),
      date: date,
    });
    setIsLoading(false);

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar peso', description: error.message });
    } else {
      toast({ title: 'Peso salvo com sucesso!' });
      setWeight('');
      fetchWeightData(selectedPet);
    }
  };

  return (
    <div className="space-y-6 peso-theme">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Controle de Peso</h1>
        <p className="text-gray-600">Acompanhe a evolução do peso do seu pet</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-6 card-shadow"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Gráfico de Evolução
              </h2>
            </div>
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Selecione um pet" />
              </SelectTrigger>
              <SelectContent>
                {myPets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          {isFetching ? <div className="text-center py-8">Carregando dados...</div> :
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{fontSize: 12}} />
                  <YAxis domain={['dataMin - 1', 'dataMax + 1']} tick={{fontSize: 12}} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="peso" 
                    stroke="#FFB300" 
                    strokeWidth={2}
                    dot={{ fill: '#FFB300', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          }
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl p-6 card-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Novo Registro
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <Input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="0.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <Button 
              onClick={handleSaveWeight}
              className="w-full flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? 'Salvando...' : <><Scale className="w-4 h-4 mr-2" /> Salvar Peso</>}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Peso;
