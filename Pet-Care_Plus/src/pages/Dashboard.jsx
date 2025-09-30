import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PawPrint, Syringe, Calendar, HeartPulse, Weight, CalendarDays, Scale, Utensils, Bell, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import StatCard from '@/components/StatCard';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate, Link } from 'react-router-dom';
import NewPetDialog from '@/components/NewPetDialog';
import NewFoodRecordDialog from '@/components/NewFoodRecordDialog';
import NewVaccineDialog from '@/components/NewVaccineDialog';
import NewConsultationDialog from '@/components/NewConsultationDialog';
import NewWeightRecordDialog from '@/components/NewWeightRecordDialog';
import { cn } from "@/lib/utils";
import { differenceInYears, differenceInMonths, differenceInDays, subMonths, isBefore, isAfter, startOfToday } from "date-fns";
import { Skeleton } from '@/components/ui/skeleton';

const getSpeciesInfo = (especie) => {
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
    return speciesData[especie] || speciesData.outro;
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

const PetListItem = ({ pet }) => {
    const { supabase, user } = useAuth();
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();
    const speciesInfo = getSpeciesInfo(pet.species.toLowerCase());

    useEffect(() => {
        const getSignedUrl = async () => {
            if (!pet || !pet.file_path) return;
            const { data, error } = await supabase.storage.from('gallery').createSignedUrl(pet.file_path, 3600);
            if (error) {
                console.error('Error creating signed URL for Dashboard PetListItem:', error.message, 'path:', pet.file_path);
            } else if (data) {
                setImageUrl(data.signedUrl);
            }
        };
        getSignedUrl();
    }, [pet, supabase]);

    if (!pet) {
        return null;
    }

    const profileLink = user?.user_metadata?.user_type === 'vet' ? `/vet/paciente/${pet.id}` : `/app/meu-pet/${pet.id}`;
    const handleNavigate = () => {
        navigate(profileLink);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            onClick={handleNavigate}
            className="flex items-center space-x-4 p-4 rounded-lg bg-white card-shadow cursor-pointer hover:bg-gray-50 transitions-colors"
        >
            <div className="relative">
                <img alt={pet.name} className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg" src={imageUrl || 'https://placehold.co/100x100/fecaca/fecaca?text=...'} />
                {pet.species && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-white bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-xs">{speciesInfo.icon}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{pet.name}</p>
                <p className="text-xs text-gray-500">{pet.breed}</p>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex items-center space-x-1 mb-3">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">
                        {calculateAge(pet.birthday || '')}
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <Scale className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-500">
                        {pet.weight ? `${pet.weight}Kg` : '--'}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const Dashboard = () => {
    const { toast } = useToast();
    const { user, supabase } = useAuth();
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState({ pets: 0, vaccines: 0, consultations: 0, treatments: 0 });
    const [myPets, setMyPets] = useState([]);
    const [consultations, setConsultations] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [medications, setMedications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dialogs, setDialogs] = useState({
        newPet: false,
        newFood: false,
        newVaccine: false,
        newConsultation: false,
        newWeight: false,
    });

    const fetchDashboardData = async () => {
        setIsLoading(true);
        if (!user || !user.id) {
            setIsLoading(false);
            return;
        }

        // **MELHORIA**: Buscar dados de um período maior para filtrar no cliente.
        // Isso garante que não perderemos lembretes futuros ou atividades recentes
        // por causa de um `limit()` muito restrito na query inicial.
        const sixMonthsAgo = subMonths(new Date(), 6).toISOString();

        const [
            { count: petsCount, error: petsError },
            { count: vaccinesCount, error: vaccinesCountError },
            { count: consultsCount, error: consultsCountError },
            { count: treatmentsCount, error: treatmentsCountError },
            { data: petsData, error: petsDataError },
            { data: consultsData, error: consultsDataError },
            { data: vaccinesData, error: vaccinesDataError },
            { data: medsData, error: medsDataError }
        ] = await Promise.all([
            supabase.from('pets').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('vaccines').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('consultations').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
            supabase.from('medications').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('active', true),
            supabase.from('pets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
            supabase.from('consultations').select('*, pets(name)').eq('user_id', user.id).gte('date', sixMonthsAgo),
            supabase.from('vaccines').select('*, pets(name)').eq('user_id', user.id).gte('date', sixMonthsAgo),
            supabase.from('medications').select('*, pets(name)').eq('user_id', user.id).gte('inicio', sixMonthsAgo)
        ]);

        if (petsError) console.error("Error fetching pets count:", petsError);
        if (vaccinesCountError) console.error("Error fetching vaccines count:", vaccinesCountError);
        if (consultsCountError) console.error("Error fetching consults count:", consultsCountError);
        if (treatmentsCountError) console.error("Error fetching treatments count:", treatmentsCountError);
        if (petsDataError) console.error("Error fetching pets data:", petsDataError);
        if (consultsDataError) console.error("Error fetching consultations:", consultsDataError);
        if (vaccinesDataError) console.error("Error fetching vaccines:", vaccinesDataError);
        if (medsDataError) console.error("Error fetching medications:", medsDataError);

        setStatsData({
            pets: petsCount || 0,
            vaccines: vaccinesCount || 0,
            consultations: consultsCount || 0,
            treatments: treatmentsCount || 0
        });
        setMyPets(petsData || []);
        setConsultations(consultsData || []);
        setVaccines(vaccinesData || []);
        setMedications(medsData || []);

        setIsLoading(false);
    };

    useEffect(() => {
        if (supabase && user) {
            fetchDashboardData();
        }
    }, [supabase, user]);

    // **LÓGICA CORRIGIDA**: Filtra apenas eventos que já ocorreram.
    const getRecentActivities = () => {
        const allActivities = [];
        const today = startOfToday();

        consultations
            .filter(c => isBefore(new Date(c.date), today))
            .forEach(c => allActivities.push({
                type: 'consulta',
                icon: Calendar,
                title: `Consulta - ${c.pets?.name || 'Pet'}`,
                subtitle: c.motivo || 'Sem descrição',
                date: new Date(c.date),
                color: 'text-blue-600',
                bg: 'bg-blue-100'
            }));

        vaccines
            .filter(v => isBefore(new Date(v.date), today))
            .forEach(v => allActivities.push({
                type: 'vacina',
                icon: Syringe,
                title: `Vacina - ${v.name}`,
                subtitle: `Pet: ${v.pets?.name || 'Pet'}`,
                date: new Date(v.date),
                color: 'text-green-600',
                bg: 'bg-green-100'
            }));

        medications
            .filter(m => isBefore(new Date(m.inicio), today))
            .forEach(m => allActivities.push({
                type: 'medicamento',
                icon: HeartPulse,
                title: `Medicamento - ${m.name}`,
                subtitle: `Pet: ${m.pets?.name || 'Pet'}`,
                date: new Date(m.inicio),
                color: 'text-purple-600',
                bg: 'bg-purple-100'
            }));

        return allActivities.sort((a, b) => b.date - a.date).slice(0, 6);
    };

    // **LÓGICA CORRIGIDA**: Filtra vacinas vencidas ou futuras e consultas futuras.
    const getUpcomingReminders = () => {
        const allReminders = [];
        const today = startOfToday();

        // Lembretes de vacinas (próxima dose futura ou vencida)
        vaccines
            .filter(v => v.proxima_dose && isAfter(new Date(v.proxima_dose), subMonths(today, 3))) // Vencidas até 3 meses atrás ou futuras
            .forEach(v => {
                const reminderDate = new Date(v.proxima_dose);
                const daysUntil = differenceInDays(reminderDate, today);
                allReminders.push({
                    type: 'vacina',
                    icon: Syringe,
                    title: `Vacina: ${v.name}`,
                    description: `Pet: ${v.pets?.name || 'Pet'}`,
                    date: reminderDate,
                    daysUntil,
                    color: daysUntil < 0 ? 'text-red-600' : 'text-green-600',
                    bg: daysUntil < 0 ? 'bg-red-100' : 'bg-green-100',
                });
            });

        // Lembretes de consultas (apenas futuras)
        consultations
            .filter(c => c.date && isAfter(new Date(c.date), today))
            .forEach(c => {
                const reminderDate = new Date(c.date);
                const daysUntil = differenceInDays(reminderDate, today);
                allReminders.push({
                    type: 'consulta',
                    icon: Calendar,
                    title: `Consulta - ${c.pets?.name || 'Pet'}`,
                    description: c.motivo || 'Consulta de rotina',
                    date: reminderDate,
                    daysUntil,
                    color: 'text-blue-600',
                    bg: 'bg-blue-100',
                });
            });

        // Ordena por data mais próxima (vencidas primeiro, depois as futuras mais próximas)
        return allReminders.sort((a, b) => a.date - b.date).slice(0, 4);
    };

    const openDialog = (dialogName) => {
        setDialogs(prev => ({ ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}), [dialogName]: true }));
    };

    const handleAction = (action) => {
        switch (action) {
            case 'new-pet': openDialog('newPet'); break;
            case 'new-food': openDialog('newFood'); break;
            case 'new-vaccine': openDialog('newVaccine'); break;
            case 'new-consultation': openDialog('newConsultation'); break;
            case 'new-weight': openDialog('newWeight'); break;
            default:
                toast({ title: "🚧 Funcionalidade em desenvolvimento!" });
        }
    };

    const stats = [
        { icon: PawPrint, title: 'Pets Cadastrados', value: statsData.pets, color: 'text-white', bgColor: 'bg-gradient-to-br from-pink-400 to-pink-600', delay: 0.1, path: '/app/meus-pets' },
        { icon: Syringe, title: 'Vacinas Registradas', value: statsData.vaccines, color: 'text-white', bgColor: 'bg-gradient-to-br from-green-400 to-green-600', delay: 0.2, path: '/app/vacinas' },
        { icon: Calendar, title: 'Consultas Agendadas', value: statsData.consultations, color: 'text-white', bgColor: 'bg-gradient-to-br from-purple-400 to-purple-600', delay: 0.3, path: '/app/consultas' },
        { icon: HeartPulse, title: 'Tratamentos Ativos', value: statsData.treatments, color: 'text-white', bgColor: 'bg-gradient-to-br from-blue-400 to-blue-600', delay: 0.4, path: '/app/medicamentos' },
    ];

    const themeMap = {
        'Alimentação': 'border-orange-500 text-orange-500 hover:bg-orange-100 hover:text-orange-500 card-shadow',
        'Vacina': 'border-green-500 text-green-500 hover:bg-green-100 hover:text-green-500 card-shadow',
        'Consulta': 'border-purple-500 text-purple-500 hover:bg-purple-100 hover:text-purple-500 card-shadow',
        'Peso': 'border-yellow-500 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-500 card-shadow',
    };

    const quickActions = [
        { icon: Utensils, label: "Alimentação", action: 'new-food' },
        { icon: Syringe, label: "Vacina", action: "new-vaccine" },
        { icon: HeartPulse, label: "Consulta", action: "new-consultation" },
        { icon: Weight, label: "Peso", action: "new-weight" },
    ];

    const upcomingReminders = getUpcomingReminders();
    const recentActivities = getRecentActivities();

    // **MELHORIA**: Adicionado tratamento visual para lembretes vencidos.
    const renderReminderTime = (reminder) => {
        if (reminder.daysUntil < 0) {
            return <p className="text-xs font-medium mt-1 text-red-600">{`Vencido há ${Math.abs(reminder.daysUntil)} dia(s)`}</p>;
        }
        if (reminder.daysUntil === 0) {
            return <p className="text-xs font-medium mt-1 text-orange-600">Hoje</p>;
        }
        if (reminder.daysUntil === 1) {
            return <p className="text-xs font-medium mt-1 text-yellow-600">Amanhã</p>;
        }
        return <p className="text-xs font-medium mt-1 text-gray-500">{`Em ${reminder.daysUntil} dias`}</p>;
    };

    return (
        <>
            <NewPetDialog
                open={dialogs.newPet}
                onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newPet: isOpen }))}
                onPetAdded={fetchDashboardData}
                className="pets-theme"
            />
            <NewFoodRecordDialog
                open={dialogs.newFood}
                onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newFood: isOpen }))}
                onFoodAdded={fetchDashboardData}
                pets={myPets}
                className="alimentacao-theme"
            />
            <NewVaccineDialog
                open={dialogs.newVaccine}
                onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newVaccine: isOpen }))}
                onVaccineAdded={fetchDashboardData}
                pets={myPets}
                className="vacinas-theme"
            />
            <NewConsultationDialog
                open={dialogs.newConsultation}
                onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newConsultation: isOpen }))}
                onConsultationAdded={fetchDashboardData}
                pets={myPets}
                className="consultas-theme"
            />
            <NewWeightRecordDialog
                open={dialogs.newWeight}
                onOpenChange={(isOpen) => setDialogs(prev => ({ ...prev, newWeight: isOpen }))}
                onRecordAdded={fetchDashboardData}
                pets={myPets}
                className="peso-theme"
            />

            <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-2xl md:text-3xl font-bold text-pink-600 mb-2">Dashboard My Pet On</h1>
                    <p className="text-gray-600">Acompanhe a saúde e bem-estar dos seus pets em um só lugar</p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {stats.map((stat, index) => <StatCard key={index} {...stat} onClick={() => navigate(stat.path)} />)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center space-x-2">
                                    <PawPrint className="w-5 h-5 text-pink-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Meus Pets ({statsData.pets})</h2>
                                </div>
                                <Button onClick={() => handleAction('new-pet')} className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto">+ Novo Pet</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {myPets.map((pet) => (
                                    <PetListItem key={pet.id} pet={pet} />
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ Ações Rápidas</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {quickActions.map((action, index) => (
                                    <Button key={index} variant="outline" className={cn("flex-col h-24 text-xs sm:text-sm", themeMap[action.label])} onClick={() => handleAction(action.action)}>
                                        <action.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-2" />
                                        <span>{action.label}</span>
                                    </Button>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="space-y-6">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
                            <div className="flex items-center space-x-2 mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">🔔 Próximos Lembretes</h2>
                            </div>
                            {isLoading ? (
                                <div className="space-y-3">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex items-center space-x-3 p-3 rounded-lg card-shadow">
                                            <Skeleton className="w-8 h-8 rounded-full" />
                                            <div className="space-y-1 flex-1">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingReminders.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Nenhum lembrete próximo</p>
                                        </div>
                                    ) : (
                                        upcomingReminders.map((reminder, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg card-shadow">
                                                <div className={`w-8 h-8 rounded-full ${reminder.bg} flex items-center justify-center flex-shrink-0`}>
                                                    <reminder.icon className={`w-4 h-4 ${reminder.color}`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm text-gray-900 truncate">{reminder.title}</p>
                                                    <p className="text-xs text-gray-500 truncate">{reminder.description}</p>
                                                    {renderReminderTime(reminder)}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>

                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-white rounded-xl p-4 sm:p-6 card-shadow">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">📖 Atividades Recentes</h2>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="flex items-center space-x-4 p-3 rounded-lg">
                                            <Skeleton className="h-10 w-10 rounded-full" />
                                            <div className="space-y-2 flex-1">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-24" />
                                            </div>
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentActivities.length === 0 ? (
                                        <div className="text-center py-8">
                                            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-500">Nenhuma atividade recente</p>
                                        </div>
                                    ) : (
                                        recentActivities.map((activity, index) => (
                                            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors card-shadow">
                                                <div className={`p-2 rounded-full ${activity.bg}`}>
                                                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{activity.title}</h4>
                                                    <p className="text-sm text-gray-600">{activity.subtitle}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">{activity.date.toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Dashboard;