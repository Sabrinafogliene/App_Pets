import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  PawPrint, 
  Syringe, 
  Calendar, 
  Pill, 
  Weight, 
  Camera, 
  Share2,
  Edit,
  Bone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const PetProfile = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const { petId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [pet, setPet] = useState(null);
  const [vaccines, setVaccines] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [medications, setMedications] = useState([]);
  const [weightRecords, setWeightRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para upload de foto
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !petId) return;

    setUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}.${fileExt}`;
      const { data: { user } } = await supabase.auth.getUser();

      // Envia o arquivo para o Storage com os metadados
      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file, {
          upsert: true,
          metadata: { owner: user.id },
        });

      if (uploadError) {
        throw uploadError;
      }

      // **CORREÇÃO APLICADA AQUI**
      // Usa createSignedUrl para obter uma URL segura e temporária para o arquivo privado.
      // A URL é válida por 1 ano (31536000 segundos).
      const { data: urlData, error: urlError } = await supabase.storage
        .from('pet-photos')
        .createSignedUrl(fileName, 31536000); 

      if (urlError) {
        throw urlError;
      }

      const photo_url = urlData.signedUrl;

      // Atualiza a URL da foto na tabela 'pets'
      const { error: updateError } = await supabase
        .from('pets')
        .update({ photo_url })
        .eq('id', petId);

      if (updateError) {
        throw updateError;
      }

      setPet(prev => ({ ...prev, photo_url }));
      toast({ title: "Sucesso!", description: "A foto do pet foi atualizada." });

    } catch (err) {
      console.error("Erro no upload:", err);
      setUploadError(`Erro: ${err.message || 'Ocorreu um problema no upload.'}`);
      toast({ variant: "destructive", title: "Falha no Upload", description: err.message });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    const fetchPetData = async () => {
      if (!user || !petId) return;
      setLoading(true);

      const { data: petData, error: petError } = await supabase
        .from('pets')
        .select('*')
        .eq('id', petId)
        .single();

      if (petError || !petData) {
        toast({ variant: "destructive", title: "Erro", description: "Pet não encontrado ou você não tem permissão para vê-lo." });
        navigate('/tutor/dashboard');
        return;
      }
      setPet(petData);

      // Busca os dados relacionados
      const { data: vaccinesData } = await supabase.from('vaccines').select('*').eq('pet_id', petId);
      setVaccines(vaccinesData || []);

      const { data: consultationsData } = await supabase.from('consultations').select('*').eq('pet_id', petId);
      setConsultations(consultationsData || []);

      const { data: medicationsData } = await supabase.from('medications').select('*').eq('pet_id', petId);
      setMedications(medicationsData || []);

      const { data: weightData } = await supabase.from('weight_records').select('*').eq('pet_id', petId);
      setWeightRecords(weightData || []);

      setLoading(false);
    };

    fetchPetData();
  }, [petId, user, navigate, toast]);

  const handleFeatureClick = (feature) => {
    toast({
      title: "🚧 Em breve!",
      description: "Esta funcionalidade ainda está em desenvolvimento."
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!pet) {
    // Tela para caso o pet não seja encontrado após o carregamento
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Pet não encontrado</h2>
                <Button onClick={() => navigate('/tutor/dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white">
                    Voltar ao Dashboard
                </Button>
            </div>
        </div>
    );
  }

  const tabItems = [
    { value: 'vaccines', label: 'Vacinas', icon: Syringe },
    { value: 'consultations', label: 'Consultas', icon: Calendar },
    { value: 'medications', label: 'Medicamentos', icon: Pill },
    { value: 'weight', label: 'Peso', icon: Weight },
    { value: 'food', label: 'Alimentação', icon: Bone },
    { value: 'gallery', label: 'Galeria', icon: Camera },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/tutor/dashboard')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Perfil de {pet.name}</h1>
              <p className="text-gray-500">{pet.species} • {pet.breed}</p>
            </div>
          </div>
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <Button variant="outline" className="hover:bg-gray-100" onClick={() => handleFeatureClick('edit')}>
              <Edit className="w-4 h-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" className="hover:bg-gray-100" onClick={() => handleFeatureClick('share')}>
              <Share2 className="w-4 h-4 mr-2" /> Compartilhar
            </Button>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center flex-shrink-0 mb-2">
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <PawPrint className="w-16 h-16 text-purple-300" />
                    )}
                  </div>
                  <label className="cursor-pointer text-center">
                    <span className="text-xs text-purple-600 hover:underline">Alterar foto</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                  {uploading && <span className="text-xs text-purple-500 mt-1">Enviando...</span>}
                  {uploadError && <span className="text-xs text-red-500 mt-1">{uploadError}</span>}
                </div>
                <div className="flex-1 w-full">
                  <h2 className="text-3xl font-bold text-blue-700 mb-1 text-center sm:text-left">{pet.name}</h2>
                  <p className="text-gray-500 text-lg mb-2 text-center sm:text-left">{pet.breed}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-2">
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">{pet.age}</span>
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">{pet.weight}kg</span>
                    {pet.gender && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pet.gender === 'Fêmea' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{pet.gender}</span>
                    )}
                    {pet.castrated && (
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">Castrado</span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm text-center sm:text-left">{pet.species}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Abas de Informações */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="vaccines" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-gray-100 p-1 rounded-lg">
              {tabItems.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600">
                  <tab.icon className="w-4 h-4 mr-2" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Conteúdo das Abas */}
            {/* O conteúdo das abas foi omitido para focar na correção, mas permanece o mesmo do seu código original */}

          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PetProfile;
