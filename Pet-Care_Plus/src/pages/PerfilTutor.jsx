
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Syringe, Calendar, HeartPulse, Bone, Scale, Camera, Plus, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NewVaccineDialog from '@/components/NewVaccineDialog';
import NewConsultationDialog from '@/components/NewConsultationDialog';
import NewMedicationDialog from '@/components/NewMedicationDialog';
import NewFoodRecordDialog from '@/components/NewFoodRecordDialog';
import NewPhotoDialog from '@/components/NewPhotoDialog';
import EditPetDialog from '@/components/EditPetDialog';
import { cn } from "@/lib/utils";
import { differenceInYears, differenceInMonths } from "date-fns";

const getSpeciesInfo = (especie) => {
  const normalized = especie.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const speciesData = {
    cachorro: { icon: "🐕", nome: "Cachorro", color: "bg-amber-100 text-amber-800" },
    gato: { icon: "🐈", nome: "Gato", color: "bg-purple-100 text-purple-800" },
    passaro: { icon: "🦜", nome: "Pássaro", color: "bg-blue-100 text-blue-800" },
    coelho: { icon: "🐇", nome: "Coelho", color: "bg-pink-100 text-pink-800" },
    peixe: { icon: "🐟", nome: "Peixe", color: "bg-cyan-100 text-cyan-800" },
    cavalo: { icon: "🐎", nome: "Cavalo", color: "bg-pink-200 text-pink-800" },
    lhama: { icon: "🦙", nome: "Lhama", color: "bg-blue-200 text-blue-800" },
    cabra: { icon: "🐐", nome: "Cabra", color: "bg-amber-200 text-amber-800" },
    bovino: { icon: "🐄", nome: "Bovino", color: "bg-cyan-200 text-cyan-800" },
    porco: { icon: "🐖", nome: "Porco", color: "bg-pink-200 text-pink-800" },
    reptil: { icon: "🐢", nome: "Réptil", color: "bg-green-100 text-green-800" },
    roedor: { icon: "🐀", nome: "Roedor", color: "bg-purple-200 text-purple-800" },
    outro: { icon: "🐾", nome: "Outro", color: "bg-gray-100 text-gray-800" }
  };
  if (normalized === "passaro" || normalized === "pássaro") return speciesData.passaro;
  return speciesData[normalized] || speciesData.outro;
};

const calculateAge = (birthday) => {
    if (!birthday) return "--";
    const birthDate = new Date(birthday);
    const now = new Date();
    const years = differenceInYears(now, birthDate);
    const months = differenceInMonths(now, birthDate) % 12;
    let ageString = "";
    if (years > 0) {
        ageString += `${years}a`;
    }
    if (months > 0) {
        if (ageString !== "") ageString += " ";
        ageString += `${months}m`;
    }
    if (ageString === "") return "Menos de um mês";
    return ageString;
};
const PerfilTutor = () => {
  const { id } = useParams();
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [pet, setPet] = useState(null);
  const [petData, setPetData] = useState({
    vaccines: [],
    consultations: [],
    medications: [],
    food: [],
    weight: [],
    gallery: [],
  });
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [dialogs, setDialogs] = useState({
    newVaccine: false,
    newConsultation: false,
    newMedication: false,
    newFood: false,
    newPhoto: false,
    editPet: false,
  });
  
  const fetchData = async () => {
    if (!user || !id) return;
    setLoading(true);

    const { data: petDataResult, error: petError } = await supabase
      .from('pets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (petError || !petDataResult) {
      toast({ variant: 'destructive', title: 'Erro ao buscar seu pet.' });
      setLoading(false);
      return;
    }
    setPet(petDataResult);

    if (petDataResult.file_path) {
      const { data: urlData, error: urlError } = await supabase.storage.from('gallery').createSignedUrl(petDataResult.file_path, 3600);
      if (urlError) {
        console.error('Error creating signed URL:', urlError.message);
      } else {
        setImageUrl(urlData.signedUrl);
      }
    }

    const [
      vaccinesRes,
      consultationsRes,
      medicationsRes,
      foodRes,
      weightRes,
      galleryRes,
    ] = await Promise.all([
      supabase.from('vaccines').select('*').eq('pet_id', id).order('date', { ascending: false }),
      supabase.from('consultations').select('*').eq('pet_id', id).order('date', { ascending: false }),
      supabase.from('medications').select('*').eq('pet_id', id).order('created_at', { ascending: false }),
      supabase.from('food_records').select('*').eq('pet_id', id).order('created_at', { ascending: false }),
      supabase.from('weight_records').select('*').eq('pet_id', id).order('date', { ascending: false }),
      supabase.from('gallery').select('*').eq('pet_id', id).order('created_at', { ascending: false }),
    ]);

    const galleryWithUrls = await Promise.all(
        (galleryRes.data || []).map(async (photo) => {
            if(!photo.file_path) return {...photo, signedUrl: null};
            const { data, error } = await supabase.storage.from('gallery').createSignedUrl(photo.file_path, 3600);
            if(error) {
                 console.error('Error creating signed URL for gallery image:', error.message);
                 return {...photo, signedUrl: null};
            }
            return {...photo, signedUrl: data.signedUrl};
        })
    );

    setPetData({
      vaccines: vaccinesRes.data || [],
      consultations: consultationsRes.data || [],
      medications: medicationsRes.data || [],
      food: foodRes.data || [],
      weight: weightRes.data || [],
      gallery: galleryWithUrls || [],
    });

    setLoading(false);
  };


  useEffect(() => {
    fetchData();
  }, [id, supabase, user, toast]);
  
  const openDialog = (dialogName) => {
    setDialogs(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [dialogName]: true }));
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

  if (loading) return <div className="text-center py-10">Carregando perfil do seu pet...</div>;
  if (!pet) return <div className="text-center py-10">Pet não encontrado.</div>;
  const speciesInfo = getSpeciesInfo(pet.species.toLowerCase());
  return (
    <>
      <NewVaccineDialog open={dialogs.newVaccine} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, newVaccine: isOpen}))} onVaccineAdded={fetchData} pets={[pet]} />
      <NewConsultationDialog open={dialogs.newConsultation} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, newConsultation: isOpen}))} onConsultationAdded={fetchData} pets={[pet]} />
      <NewMedicationDialog open={dialogs.newMedication} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, newMedication: isOpen}))} onMedicationAdded={fetchData} pets={[pet]} />
      <NewFoodRecordDialog open={dialogs.newFood} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, newFood: isOpen}))} onRecordAdded={fetchData} pets={[pet]} />
      <NewPhotoDialog open={dialogs.newPhoto} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, newPhoto: isOpen}))} onPhotoAdded={fetchData} petId={pet.id} pets={[pet]} />
      <EditPetDialog open={dialogs.editPet} onOpenChange={(isOpen) => setDialogs(prev => ({...prev, editPet: isOpen}))} onPetUpdated={fetchData} pet={pet} />
    
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl p-6 card-shadow"
        >
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            <img
              alt={pet.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-white-200"
              src={imageUrl || 'https://placehold.co/150x150/fecaca/fecaca?text=...'}
            />
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mt-2">{pet.name}</h3>
              <p className="text-gray-600 mb-3">{pet.breed}</p>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                
                <span className="status-badge bg-yellow-100 text-yellow-800"><Calendar className="inline w-4 h-4 mr-1" />{calculateAge(pet.birthday || '')}</span>
                <span className="status-badge bg-blue-100 text-blue-800"><Scale className="inline w-4 h-4 mr-1" />{pet.weight}Kg</span>
                <span className="status-badge bg-purple-100 text-purple-800">
                  {pet.gender === 'Fêmea' ? <HeartPulse className="inline w-4 h-4 mr-1 text-pink-500" /> : pet.gender === 'Macho' ? <Bone className="inline w-4 h-4 mr-1 text-blue-500" /> : null}
                  {pet.gender || 'N/A'}
                </span>
                <span className="status-badge bg-green-100 text-green-800">{pet.castrated ? 'Castrado' : 'Não Castrado'}</span>
                <span className={`status-badge ${speciesInfo.color}`}>{speciesInfo.icon} {speciesInfo.nome}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                <Link to="/meus-pets" className="w-full">
                  <Button variant="outline" className="w-full">Voltar</Button>
                </Link>
                <Button onClick={() => openDialog('editPet')} className="w-full"><Edit className="w-4 h-4 mr-2" /> Editar Pet</Button>
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
              <TabsList className="grid w-max grid-cols-6 bg-pink-100">
                <TabsTrigger value="resumo">Resumo</TabsTrigger>
                <TabsTrigger value="vacinas">Vacinas</TabsTrigger>
                <TabsTrigger value="consultas">Consultas</TabsTrigger>
                <TabsTrigger value="medicamentos">Remédios</TabsTrigger>
                <TabsTrigger value="alimentacao">Alimentação</TabsTrigger>
                <TabsTrigger value="galeria">Galeria</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="resumo" className="mt-6">
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Card><CardHeader><CardTitle className="text-center text-base sm:text-lg">Vacinas</CardTitle></CardHeader><CardContent className="text-center text-2xl sm:text-3xl font-bold text-green-600">{petData.vaccines.length}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-center text-base sm:text-lg">Consultas</CardTitle></CardHeader><CardContent className="text-center text-2xl sm:text-3xl font-bold text-purple-600">{petData.consultations.length}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-center text-base sm:text-lg">Remédios</CardTitle></CardHeader><CardContent className="text-center text-2xl sm:text-3xl font-bold text-red-600">{petData.medications.length}</CardContent></Card>
                  <Card><CardHeader><CardTitle className="text-center text-base sm:text-lg">Fotos</CardTitle></CardHeader><CardContent className="text-center text-2xl sm:text-3xl font-bold text-blue-600">{petData.gallery.length}</CardContent></Card>
               </div>
            </TabsContent>

            <TabsContent value="vacinas" className="mt-6">
              <Card>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>Vacinas</CardTitle>
                          <Button onClick={() => openDialog('newVaccine')} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Nova Vacina</Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                      {petData.vaccines.length > 0 ? (
                          <ul className="space-y-2">
                          {petData.vaccines.map(v => (
                              <li key={v.id} className="p-3 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                  <div className="font-medium"><Syringe className="inline mr-2 text-green-500" />{v.name}</div>
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-700">
                                    <div><span className="font-semibold">Data:</span> {formatDate(v.date)}</div>
                                    <div><span className="font-semibold">Próxima:</span> {v.next_dose ? formatDate(v.next_dose) : 'N/A'}</div>
                                  </div>
                              </li>
                          ))}
                          </ul>
                      ) : <p className="text-center text-gray-500">Nenhuma vacina registrada.</p>}
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="consultas" className="mt-6">
               <Card>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>Consultas</CardTitle>
                          <Button onClick={() => openDialog('newConsultation')} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Nova Consulta</Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                       {petData.consultations.length > 0 ? (
                          <ul className="space-y-2">
                          {petData.consultations.map(c => (
                              <li key={c.id} className="p-3 border rounded-lg">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="font-medium"><Calendar className="inline mr-2 text-purple-500" />{c.type}</div>
                                    <div className="text-sm"><span className="font-semibold">Data:</span> {formatDate(c.date)}</div>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 sm:pl-8">Obs: {c.observations || "Nenhuma"}</p>
                              </li>
                          ))}
                          </ul>
                      ) : <p className="text-center text-gray-500">Nenhuma consulta registrada.</p>}
                  </CardContent>
              </Card>
            </TabsContent>
             <TabsContent value="medicamentos" className="mt-6">
               <Card>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>Medicamentos</CardTitle>
                          <Button onClick={() => openDialog('newMedication')} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Novo Medicamento</Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                       {petData.medications.length > 0 ? (
                          <ul className="space-y-2">
                          {petData.medications.map(m => (
                              <li key={m.id} className="p-3 border rounded-lg">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="font-medium"><HeartPulse className="inline mr-2 text-red-500" />{m.name}</div>
                                    <span className={`status-badge ${m.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{m.active ? 'Ativo' : 'Inativo'}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 sm:pl-8">Dosagem: {m.dosage} - Frequência: {m.frequency}</p>
                              </li>
                          ))}
                          </ul>
                      ) : <p className="text-center text-gray-500">Nenhum medicamento registrado.</p>}
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="alimentacao" className="mt-6">
               <Card>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>Alimentação</CardTitle>
                          <Button onClick={() => openDialog('newFood')} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Novo Registro</Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                       {petData.food.length > 0 ? (
                          <ul className="space-y-2">
                          {petData.food.map(f => (
                             <li key={f.id} className="p-3 border rounded-lg">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div className="font-medium"><Bone className="inline mr-2 text-yellow-600" />{f.brand} ({f.type})</div>
                                    <p className="text-sm"><span className="font-semibold">Quantidade:</span> {f.quantity}</p>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1 sm:pl-8">Horários: {f.schedules}</p>
                              </li>
                          ))}
                          </ul>
                      ) : <p className="text-center text-gray-500">Nenhum registro de alimentação.</p>}
                  </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="galeria" className="mt-6">
               <Card>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <CardTitle>Galeria</CardTitle>
                           <Button onClick={() => openDialog('newPhoto')} className="w-full sm:w-auto"><Plus className="w-4 h-4 mr-2" /> Nova Foto</Button>
                      </div>
                  </CardHeader>
                  <CardContent>
                       {petData.gallery.length > 0 ? (
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {petData.gallery.map(p => (
                              <div key={p.id} className="relative aspect-square">
                                  <img src={p.signedUrl || 'https://placehold.co/300x300/fecaca/fecaca?text=!'} alt={p.description || pet.name} className="w-full h-full object-cover rounded-lg"/>
                              </div>
                          ))}
                          </div>
                      ) : <p className="text-center text-gray-500">Nenhuma foto na galeria.</p>}
                  </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </>
  );
};

export default PerfilTutor;
