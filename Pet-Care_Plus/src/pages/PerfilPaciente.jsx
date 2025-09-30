import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Syringe, Calendar, Bone, Scale, Utensils, Pill, Camera, HeartPulse } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ptBR } from 'date-fns/locale';
import { format, differenceInYears, differenceInMonths } from 'date-fns';


const borderMap = {
    resumo: "border-gray-600",
    vacinas: "border-gray-600",
    consultas: "border-gray-600",
    alimentacao: "border-gray-600",
    tratamentos: "border-gray-600",
    peso: "border-gray-600",
    galeria: "border-gray-600",
};

const getSpeciesInfo = (especie) => {
  const normalized = especie.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
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
const PerfilPaciente = () => {
    const { id } = useParams();
    const { user, supabase } = useAuth();
    const { toast } = useToast();
    const [patient, setPatient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [imageUrl, setImageUrl] = useState(null);
    
    useEffect(() => {
      const fetchPatientData = async () => {
        if (!user || !id) {
          setLoading(false);
          return;
        } 
        setLoading(true);
    
        const { data, error } = await supabase
          .from('pets')
          .select(`
            *,
            vaccines (*),
            consultations (*),
            food_records (*),
            medications (*),
            weight_records (*),
            gallery(*)              
          `)
          .eq('id', id)
          .single();
          
        if ( error || !data) {
          toast({ variant: 'destructive', title: 'Erro ao buscar paciente.' });
          setLoading(false);
          return;
        }
        setPatient(data);
    
        if (data.file_path) {
          const { data: urlData, error: urlError } = await supabase.storage.from('gallery').createSignedUrl(data.file_path, 3600);
          if (urlError) {
            console.error('Error creating signed URL for PerfilPaciente:', urlError.message);
          } else if (urlData) {
            setImageUrl(urlData.signedUrl);
          }
        }
    
        setLoading(false);
      };
    
      fetchPatientData();
    }, [id, supabase, user, toast]);
    
    if (loading) return <div className="text-center py-10">Carregando perfil do paciente...</div>;
    if (!patient) return <div className="text-center py-10">Paciente não encontrado.</div>;
    
    const speciesInfo = getSpeciesInfo(patient.species.toLowerCase());
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
              className="w-24 h-24 rounded-full object-cover border-4 border-x-indigo-500 border-double border-opacity-40 border-card"
              src={imageUrl || 'https://placehold.co/150x150/9ca3af/9ca3af?text=...'} />
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-indigo-600">{patient.name}</h1>
              <p className="text-gray-500 mb-3 text-xs">{patient.breed}</p>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
                <span className="status-badge bg-yellow-100 text-yellow-600"><Calendar className="inline w-4 h-4 mr-1"/>{calculateAge(patient.birthday || '')}</span>
                <span className="status-badge bg-blue-100 text-blue-600"><Scale className="inline w-4 h-4 mr-1"/>{patient.weight}Kg</span>
                <span className="status-badge bg-purple-100 text-purple-600">
                  {patient.gender === 'Fêmea' ? <HeartPulse className="inline w-4 h-4 mr-1 text-pink-600" /> : patient.gender === 'Macho' ? <Bone className="inline w-4 h-4 mr-1 text-blue-600" /> : null}
                  {patient.gender || 'N/A'}
                </span>
                <span className="status-badge bg-green-100 text-green-600">{patient.castrated ? 'Castrado' : 'Não Castrado'}</span>
                <span className={`status-badge ${speciesInfo.color}`}>{speciesInfo.icon} {speciesInfo.nome}</span>
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
              <TabsList className="grid w-max grid-cols-7 bg-white-100 rounded-s-m p-1 gap-x-2">
                <TabsTrigger value="resumo" className="text-gray-600 rounded-s-sm data-[state=active]:bg-gray-100 data-[state=active]:text-gray-600 data-[state=active]:shadow card-shadow">Resumo</TabsTrigger>
                <TabsTrigger value="vacinas" className="text-green-600 rounded-s-m data-[state=active]:bg-green-100 data-[state=active]:text-green-600 data-[state=active]:shadow card-shadow">Vacinas</TabsTrigger>
                <TabsTrigger value="consultas" className="text-purple-600 rounded-s-m data-[state=active]:bg-purple-100 data-[state=active]:text-purple-600 data-[state=active]:shadow card-shadow">Consultas</TabsTrigger>
                <TabsTrigger value="alimentacao" className="text-orange-600 rounded-s-m data-[state=active]:bg-orange-100 data-[state=active]:text-orange-600 data-[state=active]:shadow card-shadow">Alimentação</TabsTrigger>
                <TabsTrigger value="tratamentos" className="text-blue-600 rounded-s-m data-[state=active]:bg-blue-100 data-[state=active]:text-blue-600 data-[state=active]:shadow card-shadow">Tratamentos</TabsTrigger>
                <TabsTrigger value="peso" className="text-yellow-600 rounded-s-m data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-600 data-[state=active]:shadow card-shadow">Peso</TabsTrigger>
                <TabsTrigger value="galeria" className="text-teal-600 rounded-s-m data-[state=active]:bg-teal-100 data-[state=active]:text-teal-600 data-[state=active]:shadow card-shadow">Galeria</TabsTrigger>
              </TabsList>
            </div>
    
          <TabsContent value="resumo" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="bg-white rounded-xl p-6 card-shadow text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Syringe className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Vacinas</h3>
                <p className="text-3xl font-bold text-green-500">{patient.vaccines.length}</p>
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
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Consultas</h3>
                <p className="text-3xl font-bold text-purple-600">{patient.consultations.length}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="bg-white rounded-xl p-6 card-shadow text-center"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Alimentação</h3>
                <p className="text-3xl font-bold text-orange-600">{patient.food_records.length}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="bg-white rounded-xl p-6 card-shadow text-center"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Pill className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Tratamentos</h3>
                <p className="text-3xl font-bold text-blue-600">{patient.medications.length}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="bg-white rounded-xl p-6 card-shadow text-center"
              >
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Registros de Peso</h3>
                <p className="text-3xl font-bold text-yellow-500">{patient.weight_records.length}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                className="bg-white rounded-xl p-6 card-shadow text-center"
              >
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500 mb-2">Fotos na Galeria</h3>
                <p className="text-3xl font-bold text-teal-600">{patient.gallery.length}</p>
              </motion.div>
            </div>
          </TabsContent>
          <TabsContent value="vacinas" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-green-600 mb-4">Histórico de Vacinas</h3>
              {patient.vaccines.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de vacina encontrado.</p>
              ) : (
                <ul>
                  {patient.vaccines.map(vaccine => (
                    <li key={vaccine.id} className="text-gray-600">
                      Nome: {vaccine.name} - Data: {format(new Date(vaccine.date).setHours(12), 'dd/MM/yyyy', { locale: ptBR })} - Próxima: {vaccine.next_dose ? format(new Date(vaccine.next_dose).setHours(12), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="consultas" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-purple-600 mb-4">Histórico de Consultas</h3>
              {patient.consultations.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de consulta encontrado.</p>
              ) : (
                <ul>
                  {patient.consultations.map(consultation => (
                    <li key={consultation.id} className="text-gray-600">
                      Tipo: {consultation.type} | Data: {format(new Date(consultation.date).setHours(12), 'dd/MM/yyyy', { locale: ptBR })} - Veterinário: {consultation.vet_name} - Notas: {consultation.notes || 'N/A'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
                  
          <TabsContent value="alimentacao" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-orange-600 mb-4">Histórico de Alimentação</h3>
              {patient.food_records.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de alimentação encontrado.</p>
              ) : (
                <ul>
                  {patient.food_records.map ((record) => (
                    <li key={record.id} className="text-gray-600">
                      Marca: {record.brand} | Tipo: {record.type} | Quantidade: {record.quantity}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="tratamentos" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-blue-600 mb-4">Histórico de Tratamentos / Medicamentos</h3>
              {patient.medications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de tratamento / medicamento encontrado.</p>
              ) : (
                <ul>
                  {patient.medications.map(medication => (
                    <li key={medication.id} className="text-gray-600">
                      Nome: {medication.name} - Dosagem: {medication.dosage} - Frequência: {medication.frequency} - Início: {format(new Date(medication.inicio).setHours(12), 'dd/MM/yyyy', { locale: ptBR })} - Fim: {medication.termino ? format(new Date(medication.termino).setHours(12), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="peso" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-yellow-600 mb-4">Histórico de Peso</h3>
              {patient.weight_records.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de peso encontrado.</p>
              ) : (
                <ul>
                  {patient.weight_records.map(weight => (
                    <li key={weight.id} className="text-gray-600">
                      Peso: {weight.weight} kg - Data: {format(new Date(weight.date).setHours(12), 'dd/MM/yyyy', { locale: ptBR })}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
          <TabsContent value="galeria" className="mt-6">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <h3 className="text-lg font-semibold text-teal-600 mb-4">Galeria de Fotos</h3>
              {patient.gallery.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum registro de foto encontrado.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {patient.gallery.map((photo) => (
                    <img key={photo.id} src={photo.file_path} alt={photo.description || 'Foto do Pet'} className="w-full h-auto object-cover rounded-lg" />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};
    
export default PerfilPaciente;