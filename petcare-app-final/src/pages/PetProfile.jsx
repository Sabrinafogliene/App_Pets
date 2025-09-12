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

  // Função para upload de foto
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !petId) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${petId}.${fileExt}`;
      // Recupera o usuário autenticado
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = { owner: user.id.toString() };
      console.log('Metadata enviado:', metadata);
      const { data, error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file, {
        upsert: true,
        metadata,
      });
      if (uploadError) {
        setUploadError(`Erro Supabase: ${uploadError.message || uploadError}`);
        setUploading(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
      const photo_url = urlData.publicUrl;
      // Atualiza o perfil do pet
      const { error: updateError } = await supabase.from('pets').update({ photo_url }).eq('id', petId);
      if (updateError) {
        setUploadError(`Erro Supabase: ${updateError.message || updateError}`);
        setUploading(false);
        return;
      }
      setPet(prev => ({ ...prev, photo_url }));
    } catch (err) {
      setUploadError(`Erro inesperado: ${err.message || err}`);
    }
    setUploading(false);
  };
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
      title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
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
                {/* Foto do pet + upload */}
                <div className="flex flex-col items-center">
                  <div className="w-28 h-28 rounded-full overflow-hidden shadow-lg border-4 border-white bg-gray-100 flex items-center justify-center flex-shrink-0 mb-2">
                    {pet.photo_url ? (
                      <img src={pet.photo_url} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <PawPrint className="w-16 h-16 text-purple-300" />
                    )}
                  </div>
                  <label className="block">
                    <span className="text-xs text-gray-500">Alterar foto</span>
                    <input type="file" accept="image/*" className="mt-1 block w-full text-xs" onChange={handlePhotoUpload} disabled={uploading} />
                  </label>
                  {uploading && <span className="text-xs text-purple-500 mt-1">Enviando...</span>}
                  {uploadError && <span className="text-xs text-red-500 mt-1">{uploadError}</span>}
                </div>
                <div className="flex-1 w-full">
                  <h2 className="text-3xl font-bold text-blue-700 mb-1 text-center sm:text-left">{pet.name}</h2>
                  <p className="text-gray-500 text-lg mb-2 text-center sm:text-left">{pet.breed}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-2">
                    {/* Idade */}
                    <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-semibold">{pet.age}</span>
                    {/* Peso */}
                    <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">{pet.weight}kg</span>
                    {/* Sexo */}
                    {pet.gender && (
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${pet.gender === 'Fêmea' ? 'bg-pink-100 text-pink-600' : 'bg-blue-100 text-blue-600'}`}>{pet.gender}</span>
                    )}
                    {/* Status */}
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Tabs defaultValue="vaccines" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-gray-100 p-1 rounded-lg">
              {tabItems.map(tab => (
                <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-purple-600">
                  <tab.icon className="w-4 h-4 mr-2" />{tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="vaccines" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Syringe className="w-5 h-5 mr-2 text-green-500" />Histórico de Vacinas</span><Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => handleFeatureClick('add-vaccine')}>Adicionar Vacina</Button></CardTitle></CardHeader><CardContent>{vaccines.length === 0 ? (<div className="text-center py-8"><Syringe className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhuma vacina registrada</p></div>) : (<div className="space-y-4">{vaccines.map((vaccine) => (<div key={vaccine.id} className="p-4 bg-gray-50 rounded-lg border"><div className="flex justify-between items-center"><div><h4 className="font-semibold">{vaccine.name}</h4><p className="text-gray-500 text-sm">Aplicada em: {vaccine.date}</p></div><div className="text-right"><p className="text-gray-500 text-sm">Próxima dose:</p><p className="font-semibold">{vaccine.next_date}</p></div></div></div>))}</div>)}</CardContent></Card>
            </TabsContent>
            
            <TabsContent value="consultations" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Calendar className="w-5 h-5 mr-2 text-blue-500" />Histórico de Consultas</span><Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" onClick={() => handleFeatureClick('add-consultation')}>Agendar Consulta</Button></CardTitle></CardHeader><CardContent>{consultations.length === 0 ? (<div className="text-center py-8"><Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhuma consulta registrada</p></div>) : (<div className="space-y-4">{consultations.map((consultation) => (<div key={consultation.id} className="p-4 bg-gray-50 rounded-lg border"><div className="flex justify-between items-center"><div><h4 className="font-semibold">{consultation.type}</h4><p className="text-gray-500 text-sm">Data: {consultation.date}</p><p className="text-gray-500 text-sm">Local: {consultation.location}</p></div><Button size="sm" variant="ghost" onClick={() => handleFeatureClick('view-consultation')}>Ver Detalhes</Button></div></div>))}</div>)}</CardContent></Card>
            </TabsContent>

            <TabsContent value="medications" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Pill className="w-5 h-5 mr-2 text-red-500" />Medicamentos</span><Button size="sm" className="bg-red-500 hover:bg-red-600 text-white" onClick={() => handleFeatureClick('add-medication')}>Adicionar Medicamento</Button></CardTitle></CardHeader><CardContent>{medications.length === 0 ? (<div className="text-center py-8"><Pill className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhum medicamento registrado</p></div>) : (<div className="space-y-4">{medications.map((medication) => (<div key={medication.id} className="p-4 bg-gray-50 rounded-lg border"><div className="flex justify-between items-center"><div><h4 className="font-semibold">{medication.name}</h4><p className="text-gray-500 text-sm">Dosagem: {medication.dosage}</p><p className="text-gray-500 text-sm">Frequência: {medication.frequency}</p></div><div className="text-right"><div className={`px-2 py-1 rounded text-xs font-semibold ${medication.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{medication.active ? 'Ativo' : 'Finalizado'}</div></div></div></div>))}</div>)}</CardContent></Card>
            </TabsContent>

            <TabsContent value="weight" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Weight className="w-5 h-5 mr-2 text-yellow-500" />Controle de Peso</span><Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => handleFeatureClick('add-weight')}>Registrar Peso</Button></CardTitle></CardHeader><CardContent>{weightRecords.length === 0 ? (<div className="text-center py-8"><Weight className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhum registro de peso</p></div>) : (<div className="text-center py-8"><Weight className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Gráfico de evolução do peso em breve!</p></div>)}</CardContent></Card>
            </TabsContent>

            <TabsContent value="food" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Bone className="w-5 h-5 mr-2 text-orange-500" />Alimentação</span><Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleFeatureClick('add-food')}>Adicionar Alimento</Button></CardTitle></CardHeader><CardContent><div className="text-center py-8"><Bone className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhum registro de alimentação.</p></div></CardContent></Card>
            </TabsContent>

            <TabsContent value="gallery" className="mt-6">
              <Card className="shadow-sm"><CardHeader><CardTitle className="flex items-center justify-between"><span className="flex items-center"><Camera className="w-5 h-5 mr-2 text-indigo-500" />Galeria de Fotos</span><Button size="sm" className="bg-indigo-500 hover:bg-indigo-600 text-white" onClick={() => handleFeatureClick('add-photo')}>Adicionar Foto</Button></CardTitle></CardHeader><CardContent><div className="text-center py-8"><Camera className="w-12 h-12 text-gray-300 mx-auto mb-4" /><p className="text-gray-500">Nenhuma foto adicionada.</p></div></CardContent></Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PetProfile;