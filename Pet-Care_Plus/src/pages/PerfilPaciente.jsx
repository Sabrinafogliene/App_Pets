import React, { useState, useEffect } from 'react';
    import { useParams } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Syringe, Calendar, PawPrint } from 'lucide-react';
    import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
    import { useAuth } from '@/contexts/SupabaseAuthContext';
    import { useToast } from '@/components/ui/use-toast';
    
    const PerfilPaciente = () => {
      const { id } = useParams();
      const { user, supabase } = useAuth();
      const { toast } = useToast();
      const [patient, setPatient] = useState(null);
      const [counts, setCounts] = useState({ vaccines: 0, consultations: 0 });
      const [loading, setLoading] = useState(true);
      const [imageUrl, setImageUrl] = useState(null);
    
      useEffect(() => {
        const fetchPatientData = async () => {
          if (!user || !id) return;
          setLoading(true);
    
          const { data: petData, error: petError } = await supabase
            .from('pets')
            .select('*')
            .eq('id', id)
            .single();
          
          if (petError || !petData) {
            toast({ variant: 'destructive', title: 'Erro ao buscar paciente.' });
            setLoading(false);
            return;
          }
          setPatient(petData);
    
          if (petData.file_path) {
            const { data: urlData, error: urlError } = await supabase.storage.from('gallery').createSignedUrl(petData.file_path, 3600);
            if (urlError) {
              console.error('Error creating signed URL for PerfilPaciente:', urlError.message, 'path:', petData.file_path);
            } else if (urlData) {
              setImageUrl(urlData.signedUrl);
            }
          }
    
          const { count: vaccineCount } = await supabase.from('vaccines').select('*', { count: 'exact', head: true }).eq('pet_id', id);
          const { count: consultationCount } = await supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('pet_id', id);
          setCounts({ vaccines: vaccineCount || 0, consultations: consultationCount || 0 });
          
          setLoading(false);
        };
    
        fetchPatientData();
      }, [id, supabase, user, toast]);
    
      if (loading) return <div className="text-center py-10">Carregando perfil do paciente...</div>;
      if (!patient) return <div className="text-center py-10">Paciente não encontrado.</div>;
      
      return (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-xl p-6 card-shadow"
          >
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <img 
                alt={patient.name}
                className="w-20 h-20 rounded-full object-cover"
               src={imageUrl || 'https://placehold.co/150x150/9ca3af/9ca3af?text=...'} />
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">{patient.name}</h1>
                <p className="text-gray-600 mb-3">{patient.breed}</p>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                  <span className="status-badge bg-yellow-100 text-yellow-800">{patient.age}</span>
                  <span className="status-badge bg-blue-100 text-blue-800">{patient.weight}</span>
                  <span className="status-badge bg-pink-100 text-pink-800">{patient.gender || 'N/A'}</span>
                  <span className="status-badge bg-green-100 text-green-800">{patient.castrated ? 'Castrado' : 'Não Castrado'}</span>
                </div>
              </div>
            </div>
          </motion.div>
    
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Tabs defaultValue="resumo" className="w-full">
              <div className="overflow-x-auto pb-2">
                <TabsList className="grid w-max grid-cols-3 bg-yellow-100">
                  <TabsTrigger value="resumo" className="data-[state=active]:bg-yellow-400">Resumo</TabsTrigger>
                  <TabsTrigger value="vacinas" className="data-[state=active]:bg-yellow-400">Vacinas</TabsTrigger>
                  <TabsTrigger value="consultas" className="data-[state=active]:bg-yellow-400">Consultas</TabsTrigger>
                </TabsList>
              </div>
    
              <TabsContent value="resumo" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="bg-white rounded-xl p-6 card-shadow text-center"
                  >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Syringe className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Vacinas</h3>
                    <p className="text-3xl font-bold text-green-600">{counts.vaccines}</p>
                  </motion.div>
    
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="bg-white rounded-xl p-6 card-shadow text-center"
                  >
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Consultas</h3>
                    <p className="text-3xl font-bold text-purple-600">{counts.consultations}</p>
                  </motion.div>
                </div>
              </TabsContent>
    
              <TabsContent value="vacinas" className="mt-6">
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <p className="text-gray-600 text-center py-8">Dados de vacinas serão exibidos aqui</p>
                </div>
              </TabsContent>
    
              <TabsContent value="consultas" className="mt-6">
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <p className="text-gray-600 text-center py-8">Histórico de consultas será exibido aqui</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      );
    };
    
  export default PerfilPaciente;