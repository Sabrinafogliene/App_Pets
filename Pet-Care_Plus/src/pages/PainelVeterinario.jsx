
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, PawPrint, BookOpen, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import PetCard from '@/components/PetCard';

const PainelVeterinario = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase.rpc('get_vet_patients');
 
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar pacientes.', description: error.message });
      } else {
        setPatients(data || []);
      }
      setLoading(false);
    };

    useEffect(() => {
      fetchPatients();
  }, [supabase, user, toast]);

  const handleSendInvite = () => {
    toast({
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Painel do Veterinário</h1>
        <p className="text-gray-600">Acesse o histórico dos seus pacientes.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center space-x-2">
            <PawPrint className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Meus Pacientes ({patients.length})</h2>
            {loading ? <div className='text-center py-8'>Carregando pacientes...</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {patients.map((patient, index) => (
                  <PetCard key={patient.id} patient={patient} index={index} />
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link to="/vet/prontuario">
                <Button variant="outline" className="w-full justify-start"><BookOpen className="w-4 h-4 mr-2" /> Prontuário</Button>
              </Link>
              <Link to="/vet/agenda">
                <Button variant="outline" className="w-full justify-start"><Calendar className="w-4 h-4 mr-2" /> Agenda</Button>
              </Link>
              <Link to="/vet/configuracoes">
                <Button variant="outline" className="w-full justify-start"><Settings className="w-4 h-4 mr-2" /> Configurações</Button>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Convidar um Tutor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Tutor
                </label>
                <Input
                  type="email"
                  placeholder="email.do.tutor@exemplo.com"
                />
              </div>
              <Button 
                onClick={handleSendInvite}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PainelVeterinario;
