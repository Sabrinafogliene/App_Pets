import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { differenceInDays, isFuture } from 'date-fns';
import { toast } from 'sonner';

interface DashboardStats {
  totalPets: number;
  consultasAgendadas: number;
  medicamentosAtivos: number;
  vacinasVencendo: number;
}

interface RecentActivity {
  id: string;
  type: 'consulta' | 'medicamento' | 'vacina' | 'peso';
  description: string;
  pet_name: string;
  date: string;
}

interface Reminder {
  id: string;
  titulo: string;
  descricao: string;
  pet_nome: string;
  data_lembrete: string;
  tipo: 'vacina' | 'consulta' | 'outro';
  status: 'Atrasado' | 'Hoje' | 'Próximo';
}

export function useDashboardData() {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<DashboardStats>({ totalPets: 0, consultasAgendadas: 0, medicamentosAtivos: 0, vacinasVencendo: 0 });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingReminders, setUpcomingReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        // --- LÓGICA DE LEMBRETES INTELIGENTES ---
        const allReminders: Reminder[] = [];

        const { data: vacinas } = await supabase.from('vacinas').select('id, nome, data_proxima, pets!inner(nome)').eq('user_id', user.id).not('data_proxima', 'is', null);
        if (vacinas) {
          vacinas.forEach(vacina => {
            const proximaData = new Date(vacina.data_proxima.replace(/-/g, '/'));
            const diff = differenceInDays(proximaData, hoje);
            if (diff < 0 || diff <= 30) {
              let status: Reminder['status'] = 'Próximo';
              if (diff < 0) status = 'Atrasado';
              if (diff === 0) status = 'Hoje';
              allReminders.push({ id: `vacina-${vacina.id}`, titulo: `Vacina: ${vacina.nome}`, descricao: `Reforço da vacina`, pet_nome: vacina.pets.nome, data_lembrete: vacina.data_proxima, tipo: 'vacina', status: status });
            }
          });
        }

        const { data: consultas } = await supabase.from('consultas').select('id, tipo, data_consulta, pets!inner(nome)').eq('user_id', user.id).eq('status', 'agendada');
        if (consultas) {
            consultas.forEach(consulta => {
                const dataConsulta = new Date(consulta.data_consulta.replace(/-/g, '/'));
                const diff = differenceInDays(dataConsulta, hoje);
                if (diff >= 0 && diff <= 7) {
                    let status: Reminder['status'] = 'Próximo';
                    if (diff === 0) status = 'Hoje';
                    allReminders.push({ id: `consulta-${consulta.id}`, titulo: `Consulta: ${consulta.tipo}`, descricao: `Consulta agendada`, pet_nome: consulta.pets.nome, data_lembrete: consulta.data_consulta, tipo: 'consulta', status: status });
                }
            });
        }
        
        allReminders.sort((a, b) => new Date(a.data_lembrete).getTime() - new Date(b.data_lembrete).getTime());
        setUpcomingReminders(allReminders.slice(0, 5));

        // --- LÓGICA DE ATIVIDADES RECENTES (RESTAURADA) ---
        const activities: RecentActivity[] = [];
        const { data: recentConsultas } = await supabase.from('consultas').select('id, tipo, data_consulta, pets!inner(nome)').eq('user_id', user.id).order('data_consulta', { ascending: false }).limit(5);
        recentConsultas?.forEach(c => activities.push({ id: c.id, type: 'consulta', description: `Consulta: ${c.tipo}`, pet_name: c.pets.nome, date: c.data_consulta }));

        const { data: recentMedicamentos } = await supabase.from('medicamentos').select('id, nome, data_inicio, pets!inner(nome)').eq('user_id', user.id).order('data_inicio', { ascending: false }).limit(5);
        recentMedicamentos?.forEach(m => activities.push({ id: m.id, type: 'medicamento', description: `Medicamento: ${m.nome}`, pet_name: m.pets.nome, date: m.data_inicio }));
        
        activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentActivities(activities.slice(0, 5));

        // --- LÓGICA DE STATS ---
        const { count: totalPets } = await supabase.from('pets').select('id', { count: 'exact' }).eq('user_id', user.id);
        const { data: medicamentosAtivos } = await supabase.from('medicamentos').select('id').eq('user_id', user.id).eq('status', 'ativo');
        
        setStats({
            totalPets: totalPets || 0,
            consultasAgendadas: consultas?.filter(c => isFuture(new Date(c.data_consulta.replace(/-/g, '/')))).length || 0,
            medicamentosAtivos: medicamentosAtivos?.length || 0,
            vacinasVencendo: allReminders.filter(r => r.tipo === 'vacina').length
        });

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(`Erro ao carregar dados do dashboard: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  return { stats, recentActivities, upcomingReminders, loading };
}