
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
  const { user, supabase, session } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

useEffect(() => {  
  const fetchPatients = async () => {
    setLoading(true);
    try {
      const {data, error } = await supabase.rpc('get_vet_patients');
      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar pacientes.', description: error.message });
      } else {
        setPatients(data);
      }
    } catch (err) {
      toast ({
        variant: 'destructive',
        title: 'Erro inesperado',
        description: err.message,
      });
    } finally {
      setLoading(false);
    }
 };
 if (supabase && user) {
    fetchPatients();
 }
}, [supabase, user, toast, session]);

  const handleSendInvite = async () => {
    if (!inviteEmail || !session?.access_token){
      toast ({ variant: 'destructive', title: 'Por favor, insira um e-mail válido.' });
      return;
    }
    
    setIsSending(true);

    try {
      const response = await fetch('https://axavdsrihemzsamnwgcf.supabase.co',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`, 
        },
        
        body: JSON.stringify({ email: inviteEmail }), 
      });

      const data = await response.json();
      if (!response.ok) {
        
        throw new Error(data.message || 'Erro Desconhecido!');
      }      
      toast({
        title: data.status === 'invitation_sent' ? 'Convite Enviado!' : 'Acesso Concedido!',
        description: data.message,
        className: 'bg-green-500 text-white'
      });
      
      setInviteEmail('');
        
    } catch (error) {
      const errorMessage = error.message || 'Erro de comunicação com o servidor';
      toast({
        variant: 'destructive',
        title: 'Erro de Servidor',
        description: errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  };
    

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-2">Painel do Veterinário</h1>
        <p className="text-gray-600">Acesse o histórico dos seus pacientes.</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
            <div className="flex items-center space-x-2 mb-6">
              <PawPrint className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-semibold text-gray-600">Meus Pacientes ({patients.length})</h2>
            </div>
            {loading ? <div className='text-center py-8'>Carregando pacientes...</div> : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {patients 
                  .filter(p => p && p.id)
                  .map((pet, index) => (
                    <PetCard 
                      key={pet.id} 
                      pet={pet} 
                      delay={index * 0.1} 
                    />
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
            <h2 className="text-xl font-semibold text-gray-600 mb-4">Ações Rápidas</h2>
            <div className="space-y-3">
              <Link to="/vet/prontuario">
                <Button variant="outline" className="w-full justify-start"><BookOpen className="w-4 h-4 mr-2 text-teal-600"/> Prontuário</Button>
              </Link>
              <Link to="/vet/agenda">
                <Button variant="outline" className="w-full justify-start"><Calendar className="w-4 h-4 mr-2 text-teal-600" /> Agenda</Button>
              </Link>
              <Link to="/vet/configuracoes">
                <Button variant="outline" className="w-full justify-start"><Settings className="w-4 h-4 mr-2 text-teal-600" /> Configurações</Button>
              </Link>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 card-shadow">
            <h2 className="text-xl font-semibold text-gray-600 mb-6">Convidar um Tutor</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Tutor
                </label>
                <Input
                  type="email"
                  placeholder="email.do.tutor@exemplo.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  disabled={isSending}
                />
              </div>
              <Button 
                onClick={handleSendInvite}
                className="w-full bg-teal-600 hover:bg-teal-700 flex items-center justify-center"
                disabled={isSending}
              >
                {isSending ? 'Enviando...' : (<><Send className="w-4 h-4 mr-2" /> Enviar Convite</>)}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};


export default PainelVeterinario;
