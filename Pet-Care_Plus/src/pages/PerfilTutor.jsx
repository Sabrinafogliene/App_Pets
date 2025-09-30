import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Syringe, Calendar, Bone, Scale, Utensils, Pill, Camera, HeartPulse, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format, differenceInYears, differenceInMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Importe seus componentes de diálogo
import NewVaccineDialog from '@/components/NewVaccineDialog';
import NewConsultationDialog from '@/components/NewConsultationDialog';
import NewMedicationDialog from '@/components/NewMedicationDialog';
import NewFoodRecordDialog from '@/components/NewFoodRecordDialog';
import NewWeightRecordDialog from '@/components/NewWeightRecordDialog';
import NewPhotoDialog from '@/components/NewPhotoDialog';
import EditPetDialog from '@/components/EditPetDialog';

// Funções auxiliares
const getSpeciesInfo = (especie) => {
  const normalized = (especie || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const speciesData = {
    cachorro: { icon: "🐕", nome: "Cachorro", color: "bg-amber-100 text-amber-800" },
    gato: { icon: "🐈", nome: "Gato", color: "bg-purple-100 text-purple-800" },
    passaro: { icon: "🦜", nome: "Pássaro", color: "bg-blue-100 text-blue-800" },
    coelho: { icon: "🐇", nome: "Coelho", color: "bg-pink-100 text-pink-800" },
    peixe: { icon: "🐟", nome: "Peixe", color: "bg-cyan-100 text-cyan-800" },
    cavalo: { icon: "🐎", nome: "Cavalo", color: "bg-teal-100 text-pink-600" },
    lhama: { icon: "🦙", nome: "Lhama", color: "bg-sky-100 text-blue-600" },
    cabra: { icon: "🐐", nome: "Cabra", color: "bg-indigo-100 text-amber-600" },
    bovino: { icon: "🐄", nome: "Bovino", color: "bg-cyan-100 text-cyan-700" },
    porco: { icon: "🐖", nome: "Porco", color: "bg-rose-100 text-pink-600" },
    réptil: { icon: "🐢", nome: "Réptil", color: "bg-emerald-100 text-green-800" },
    roedor: { icon: "🐀", nome: "Roedor", color: "bg-purple-100 text-purple-600" },
    outro: { icon: "🐾", nome: "Outro", color: "bg-gray-100 text-gray-800" }
  };
  if (normalized === "passaro" || normalized === "pássaro") return speciesData.passaro;
  return speciesData[normalized] || speciesData.outro;
};

const calculateAge = (birthday) => {
    if (!birthday) return "Idade não informada";
    const birthDate = new Date(birthday);
    const now = new Date();
    const years = differenceInYears(now, birthDate);
    const months = differenceInMonths(now, birthDate) % 12;
    let ageString = "";
    if (years > 0) { ageString += `${years}a`; }
    if (months > 0) {
        if (ageString !== "") ageString += " ";
        ageString += `${months}m`;
    }
    if (ageString === "") return "N/A";
    return ageString;
};

const PerfilTutor = () => {
    const { id } = useParams();
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    const [dialogs, setDialogs] = useState({
        newVaccine: false, newConsultation: false, newMedication: false,
        newFood: false, newWeight: false, newPhoto: false, editPet: false,
    });

    const fetchData = useCallback(async () => {
        if (!id) return;
        setLoading(true);

        const { data, error } = await supabase.from('pets').select(`*, vaccines(*), consultations(*), food_records(*), medications(*), weight_records(*), gallery(*)`).eq('id', id).single();

        if (error || !data) {
            toast({ variant: 'destructive', title: 'Erro ao buscar dados do pet.' });
            setLoading(false);
            return;
        }

        data.vaccines.sort((a, b) => new Date(b.date) - new Date(a.date));
        data.consultations.sort((a, b) => new Date(b.date) - new Date(a.date));
        data.medications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        data.food_records.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        data.weight_records.sort((a, b) => new Date(b.date) - new Date(a.date));
        data.gallery.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        setPet(data);
        
        if (user && data.user_id === user.id) setIsOwner(true);

        if (data.file_path) {
            const { data: urlData } = await supabase.storage.from('gallery').createSignedUrl(data.file_path, 3600);
            if (urlData) setImageUrl(urlData.signedUrl);
        }
        
        const galleryWithUrls = await Promise.all(
            (data.gallery || []).map(async (photo) => {
                if (!photo.file_path) return { ...photo, signedUrl: null };
                const { data: urlData } = await supabase.storage.from('gallery').createSignedUrl(photo.file_path, 3600);
                return { ...photo, signedUrl: urlData ? urlData.signedUrl : null };
            })
        );
        setPet(currentPet => ({...currentPet, gallery: galleryWithUrls}));

        setLoading(false);
    }, [id, supabase, user, toast]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openDialog = (dialogName) => {
        setDialogs(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [dialogName]: true }));
    };

    if (loading) return <div className="text-center py-10">Carregando perfil do pet...</div>;
    if (!pet) return <div className="text-center py-10">Pet não encontrado.</div>;

    const speciesInfo = getSpeciesInfo(pet.species);

    const tabClasses = {
        resumo: "text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-600",
        vacinas: "text-green-600 data-[state=active]:bg-green-100 data-[state=active]:text-green-600",
        consultas: "text-purple-600 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600",
        alimentacao: "text-orange-600 data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600",
        tratamentos: "text-blue-600 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600",
        peso: "text-yellow-600 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-600",
        galeria: "text-teal-600 data-[state=active]:bg-teal-100 data-[state=active]:text-teal-600",
    };
    
    const baseTabClass = "rounded-s-m data-[state=active]:shadow card-shadow";

    return (
        <>
            {isOwner && (
                <>
                    <EditPetDialog open={dialogs.editPet} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, editPet: isOpen }))} onPetUpdated={fetchData} pet={pet} />
                    <NewVaccineDialog open={dialogs.newVaccine} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newVaccine: isOpen }))} onVaccineAdded={fetchData} pets={[pet]} />
                    <NewConsultationDialog open={dialogs.newConsultation} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newConsultation: isOpen }))} onConsultationAdded={fetchData} pets={[pet]} />
                    <NewMedicationDialog open={dialogs.newMedication} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newMedication: isOpen }))} onMedicationAdded={fetchData} pets={[pet]} />
                    <NewFoodRecordDialog open={dialogs.newFood} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newFood: isOpen }))} onRecordAdded={fetchData} pets={[pet]} />
                    <NewWeightRecordDialog open={dialogs.newWeight} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newWeight: isOpen }))} onRecordAdded={fetchData} pets={[pet]} />
                    <NewPhotoDialog open={dialogs.newPhoto} onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newPhoto: isOpen }))} onPhotoAdded={fetchData} petId={pet.id} pets={[pet]} />
                </>
            )}

            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-xl p-6 card-shadow">
                    <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img alt={pet.name} className="w-24 h-24 rounded-full object-cover border-4 border-x-teal-500 border-double border-opacity-40 border-card" src={imageUrl || 'https://placehold.co/150x150/9ca3af/9ca3af?text=...'} />
                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-xl font-bold text-teal-600">{pet.name}</h1>
                            <p className="text-gray-500 mb-3 text-xs">{pet.breed}</p>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                                <span className="status-badge bg-yellow-100 text-yellow-600"><Calendar className="inline w-4 h-4 mr-1" />{calculateAge(pet.birthday )}</span>
                                <span className="status-badge bg-blue-100 text-blue-600"><Scale className="inline w-4 h-4 mr-1" />{pet.weight}Kg</span>
                                <span className="status-badge bg-purple-100 text-purple-600">
                                    {pet.gender === 'Fêmea' ? <HeartPulse className="inline w-4 h-4 mr-1 text-pink-600" /> : pet.gender === 'Macho' ? <Bone className="inline w-4 h-4 mr-1 text-blue-600" /> : null}
                                    {pet.gender || 'N/A'}
                                </span>
                                <span className="status-badge bg-green-100 text-green-600">{pet.castrated ? 'Castrado' : 'Não Castrado'}</span>
                                <span className={`status-badge ${speciesInfo.color}`}>{speciesInfo.icon} {speciesInfo.nome}</span>
                            </div>
                        </div>
                        {isOwner && (
                            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                                <Link to="/meus-pets" className="w-full">
                                    <Button variant="outline" className="w-full text-pink-500">Voltar</Button>
                                </Link>
                                <Button onClick={() => openDialog('editPet')} className="w-full pets-theme"><Edit className="w-4 h-4 mr-2" /> Editar Pet</Button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                    <Tabs defaultValue="resumo" className="w-full">
                        <div className="overflow-x-auto pb-2">
                            <TabsList className="grid w-max grid-cols-7 bg-white-100 rounded-s-m p-1 gap-x-2">
                                <TabsTrigger value="resumo" className={`${baseTabClass} ${tabClasses.resumo}`}>Resumo</TabsTrigger>
                                <TabsTrigger value="vacinas" className={`${baseTabClass} ${tabClasses.vacinas}`}>Vacinas</TabsTrigger>
                                <TabsTrigger value="consultas" className={`${baseTabClass} ${tabClasses.consultas}`}>Consultas</TabsTrigger>
                                <TabsTrigger value="alimentacao" className={`${baseTabClass} ${tabClasses.alimentacao}`}>Alimentação</TabsTrigger>
                                <TabsTrigger value="tratamentos" className={`${baseTabClass} ${tabClasses.tratamentos}`}>Tratamentos</TabsTrigger>
                                <TabsTrigger value="peso" className={`${baseTabClass} ${tabClasses.peso}`}>Peso</TabsTrigger>
                                <TabsTrigger value="galeria" className={`${baseTabClass} ${tabClasses.galeria}`}>Galeria</TabsTrigger>
                            </TabsList>
                        </div>
                        
                        {/* INÍCIO DO CONTEÚDO RESTAURADO */}
                        <TabsContent value="resumo" className="mt-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {[
                                    { title: 'Vacinas', count: pet.vaccines.length, icon: Syringe, color: 'green' },
                                    { title: 'Consultas', count: pet.consultations.length, icon: Calendar, color: 'purple' },
                                    { title: 'Alimentação', count: pet.food_records.length, icon: Utensils, color: 'orange' },
                                    { title: 'Tratamentos', count: pet.medications.length, icon: Pill, color: 'blue' },
                                    { title: 'Registros de Peso', count: pet.weight_records.length, icon: Scale, color: 'yellow' },
                                    { title: 'Fotos na Galeria', count: pet.gallery.length, icon: Camera, color: 'teal' },
                                ].map((item, index) => (
                                    <motion.div key={item.title} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }} className="bg-white rounded-xl p-6 card-shadow text-center">
                                        <div className={`w-16 h-16 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-4`}><item.icon className={`w-8 h-8 text-${item.color}-500`} /></div>
                                        <h3 className="text-lg font-semibold text-gray-500 mb-2">{item.title}</h3>
                                        <p className={`text-3xl font-bold text-${item.color}-500`}>{item.count}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="vacinas" className="mt-6 vacinas-theme">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-green-600">Histórico de Vacinas</h3>
                                    {isOwner && <Button onClick={() => openDialog('newVaccine')}>Adicionar Vacina</Button>}
                                </div>
                                {pet.vaccines.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum registro de vacina encontrado.</p> : (
                                    <ul>{pet.vaccines.map(vaccine => (<li key={vaccine.id} className="text-gray-600 border-b py-2">Nome: {vaccine.name} - Data: {format(new Date(vaccine.date), 'dd/MM/yyyy', { locale: ptBR })} - Próxima: {vaccine.next_dose ? format(new Date(vaccine.next_dose), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</li>))}</ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="consultas" className="mt-6">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-purple-600">Histórico de Consultas</h3>
                                    {isOwner && <Button onClick={() => openDialog('newConsultation')}>Adicionar Consulta</Button>}
                                </div>
                                {pet.consultations.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum registro de consulta encontrado.</p> : (
                                    <ul>{pet.consultations.map(consultation => (<li key={consultation.id} className="text-gray-600 border-b py-2">Tipo: {consultation.type} | Data: {format(new Date(consultation.date), 'dd/MM/yyyy', { locale: ptBR })} - Veterinário: {consultation.vet_name} - Notas: {consultation.notes || 'N/A'}</li>))}</ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="alimentacao" className="mt-6">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-orange-600">Histórico de Alimentação</h3>
                                    {isOwner && <Button onClick={() => openDialog('newFood')}>Adicionar Registro</Button>}
                                </div>
                                {pet.food_records.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum registro de alimentação encontrado.</p> : (
                                    <ul>{pet.food_records.map(record => (<li key={record.id} className="text-gray-600 border-b py-2">Marca: {record.brand} | Tipo: {record.type} | Quantidade: {record.quantity}</li>))}</ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="tratamentos" className="mt-6">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-blue-600">Histórico de Tratamentos</h3>
                                    {isOwner && <Button onClick={() => openDialog('newMedication')}>Adicionar Tratamento</Button>}
                                </div>
                                {pet.medications.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum registro de tratamento encontrado.</p> : (
                                    <ul>{pet.medications.map(medication => (<li key={medication.id} className="text-gray-600 border-b py-2">Nome: {medication.name} - Dosagem: {medication.dosage} - Frequência: {medication.frequency} - Início: {format(new Date(medication.inicio), 'dd/MM/yyyy', { locale: ptBR })} - Fim: {medication.termino ? format(new Date(medication.termino), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</li>))}</ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="peso" className="mt-6">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-yellow-600">Histórico de Peso</h3>
                                    {isOwner && <Button onClick={() => openDialog('newWeight')}>Adicionar Peso</Button>}
                                </div>
                                {pet.weight_records.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhum registro de peso encontrado.</p> : (
                                    <ul>{pet.weight_records.map(weight => (<li key={weight.id} className="text-gray-600 border-b py-2">Peso: {weight.weight} kg - Data: {format(new Date(weight.date), 'dd/MM/yyyy', { locale: ptBR })}</li>))}</ul>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="galeria" className="mt-6">
                            <div className="bg-white rounded-xl p-6 card-shadow">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-teal-600">Galeria de Fotos</h3>
                                    {isOwner && <Button onClick={() => openDialog('newPhoto')}>Adicionar Foto</Button>}
                                </div>
                                {pet.gallery.length === 0 ? <p className="text-gray-500 text-center py-8">Nenhuma foto na galeria.</p> : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{pet.gallery.map((photo) => (<img key={photo.id} src={photo.signedUrl} alt={photo.description || 'Foto do Pet'} className="w-full h-auto object-cover rounded-lg" />))}</div>
                                )}
                            </div>
                        </TabsContent>
                        {/* FIM DO CONTEÚDO RESTAURADO */}
                    </Tabs>
                </motion.div>
            </div>
        </>
    );
};

export default PerfilTutor;
