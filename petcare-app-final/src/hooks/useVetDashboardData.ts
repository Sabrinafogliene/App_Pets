import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { differenceInDays, isFuture, isToday, format } from 'date-fns';
import { toast } from 'sonner';

interface VetDashboardStats {
  totalPacientes: number;
  consultasAgendadas: number;
  vacinasVencendo: number;
  consultasHoje: number;
}

interface AuthorizedPet {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade: number | null;
  sexo: string | null;
  foto_url: string | null;
  tutor_nome: string;
  tutor_email: string;
  authorized_data: string[];
}

interface VetConsulta {
  id: string;
  tipo: string;
  data_consulta: string;
  hora_consulta: string | null;
  status: string;
  pet_nome: string;
  tutor_nome: string;
  descricao: string | null;
}

interface VetVacina {
  id: string;
  nome: string;
  data_proxima: string;
  pet_nome: string;
  tutor_nome: string;
  diasRestantes: number;
}

interface RecentActivity {
  id: string;
  type: 'consulta' | 'vacina' | 'medicamento';
  description: string;
  pet_name: string;
  tutor_name: string;
  date: string;
}

export function useVetDashboardData() {
  const { user, profile } = useAuthContext();
  const [stats, setStats] = useState<VetDashboardStats>({ 
    totalPacientes: 0, 
    consultasAgendadas: 0, 
    vacinasVencendo: 0,
    consultasHoje: 0 
  });
  const [authorizedPets, setAuthorizedPets] = useState<AuthorizedPet[]>([]);
  const [upcomingConsultas, setUpcomingConsultas] = useState<VetConsulta[]>([]);
  const [expiringVacinas, setExpiringVacinas] = useState<VetVacina[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile || profile.role !== 'veterinario') return;

    const fetchVetDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Buscar pets autorizados
        const { data: petsData, error: petsError } = await supabase
          .from('pet_authorizations')
          .select(`
            pet_id,
            authorized_data,
            pets!inner(
              id, nome, especie, raca, idade, sexo, foto_url, user_id
            )
          `)
          .eq('veterinario_profile_id', profile.id)
          .eq('status', 'active');

        if (petsError) throw petsError;

        // Buscar dados dos tutores separadamente
        const tutorIds = [...new Set(petsData?.map(p => p.pets.user_id) || [])];
        const { data: tutorsData } = await supabase
          .from('profiles')
          .select('user_id, nome, email')
          .in('user_id', tutorIds);

        const tutorsMap = new Map(tutorsData?.map(t => [t.user_id, t]) || []);

        const pets: AuthorizedPet[] = petsData?.map(auth => {
          const tutor = tutorsMap.get(auth.pets.user_id);
          return {
            id: auth.pets.id,
            nome: auth.pets.nome,
            especie: auth.pets.especie,
            raca: auth.pets.raca,
            idade: auth.pets.idade,
            sexo: auth.pets.sexo,
            foto_url: auth.pets.foto_url,
            tutor_nome: tutor?.nome || 'Nome não informado',
            tutor_email: tutor?.email || '',
            authorized_data: auth.authorized_data
          };
        }) || [];

        setAuthorizedPets(pets);

        // 2. Buscar consultas agendadas
        const petIds = pets.map(p => p.id);
        if (petIds.length > 0) {
          const { data: consultasData, error: consultasError } = await supabase
            .from('consultas')
            .select(`
              id, tipo, data_consulta, hora_consulta, status, descricao, user_id,
              pets!inner(nome)
            `)
            .in('pet_id', petIds)
            .eq('status', 'agendada')
            .gte('data_consulta', new Date().toISOString().split('T')[0])
            .order('data_consulta', { ascending: true });

          if (consultasError) throw consultasError;

          const consultas: VetConsulta[] = consultasData?.map(c => {
            const tutor = tutorsMap.get(c.user_id);
            return {
              id: c.id,
              tipo: c.tipo,
              data_consulta: c.data_consulta,
              hora_consulta: c.hora_consulta,
              status: c.status,
              pet_nome: c.pets.nome,
              tutor_nome: tutor?.nome || 'Nome não informado',
              descricao: c.descricao
            };
          }) || [];

          setUpcomingConsultas(consultas);

          // 3. Buscar vacinas vencendo (próximos 30 dias)
          const { data: vacinasData, error: vacinasError } = await supabase
            .from('vacinas')
            .select(`
              id, nome, data_proxima, user_id,
              pets!inner(nome)
            `)
            .in('pet_id', petIds)
            .not('data_proxima', 'is', null)
            .gte('data_proxima', new Date().toISOString().split('T')[0]);

          if (vacinasError) throw vacinasError;

          const hoje = new Date();
          const vacinas: VetVacina[] = vacinasData
            ?.map(v => {
              const dataProxima = new Date(v.data_proxima);
              const diasRestantes = differenceInDays(dataProxima, hoje);
              const tutor = tutorsMap.get(v.user_id);
              return {
                id: v.id,
                nome: v.nome,
                data_proxima: v.data_proxima,
                pet_nome: v.pets.nome,
                tutor_nome: tutor?.nome || 'Nome não informado',
                diasRestantes
              };
            })
            .filter(v => v.diasRestantes <= 30)
            .sort((a, b) => a.diasRestantes - b.diasRestantes) || [];

          setExpiringVacinas(vacinas);

          // 4. Buscar atividades recentes
          const activities: RecentActivity[] = [];
          
          // Consultas recentes
          const { data: recentConsultas } = await supabase
            .from('consultas')
            .select(`
              id, tipo, data_consulta, user_id,
              pets!inner(nome)
            `)
            .in('pet_id', petIds)
            .order('data_consulta', { ascending: false })
            .limit(10);

          recentConsultas?.forEach(c => {
            const tutor = tutorsMap.get(c.user_id);
            activities.push({
              id: c.id,
              type: 'consulta',
              description: `Consulta: ${c.tipo}`,
              pet_name: c.pets.nome,
              tutor_name: tutor?.nome || 'Nome não informado',
              date: c.data_consulta
            });
          });

          // Medicamentos recentes
          const { data: recentMedicamentos } = await supabase
            .from('medicamentos')
            .select(`
              id, nome, data_inicio, user_id,
              pets!inner(nome)
            `)
            .in('pet_id', petIds)
            .order('data_inicio', { ascending: false })
            .limit(10);

          recentMedicamentos?.forEach(m => {
            const tutor = tutorsMap.get(m.user_id);
            activities.push({
              id: m.id,
              type: 'medicamento',
              description: `Medicamento: ${m.nome}`,
              pet_name: m.pets.nome,
              tutor_name: tutor?.nome || 'Nome não informado',
              date: m.data_inicio
            });
          });

          activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setRecentActivities(activities.slice(0, 5));

          // 5. Calcular estatísticas
          const consultasHoje = consultas.filter(c => isToday(new Date(c.data_consulta))).length;
          const consultasAgendadas = consultas.filter(c => isFuture(new Date(c.data_consulta)) || isToday(new Date(c.data_consulta))).length;

          setStats({
            totalPacientes: pets.length,
            consultasAgendadas,
            vacinasVencendo: vacinas.length,
            consultasHoje
          });
        } else {
          // Veterinário não tem pets autorizados ainda
          setStats({
            totalPacientes: 0,
            consultasAgendadas: 0,
            vacinasVencendo: 0,
            consultasHoje: 0
          });
        }

      } catch (error: any) {
        console.error('Error fetching vet dashboard data:', error);
        toast.error(`Erro ao carregar dados do painel: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVetDashboardData();
  }, [user, profile]);

  return { 
    stats, 
    authorizedPets, 
    upcomingConsultas, 
    expiringVacinas, 
    recentActivities, 
    loading 
  };
}