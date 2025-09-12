// Conteúdo para: src/hooks/useDashboardData.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { differenceInDays, isFuture, parseISO } from 'date-fns';
import { toast } from "sonner";

export interface DashboardStatsData {
  totalPets: number;
  consultasAgendadas: number;
  medicamentosAtivos: number;
  vacinasVencendo: number;
}
export interface RecentActivityData {
  id: string;
  type: 'consulta' | 'medicamento' | 'vacina' | 'peso';
  description: string;
  pet_name: string;
  date: string;
}
export interface ReminderData {
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

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const [petsRes, consultasRes, medicamentosRes, vacinasRes] = await Promise.all([
        supabase.from('pets').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('consultas').select('id, tipo, data_consulta, pets!inner(nome)').eq('user_id', user.id),
        supabase.from('medicamentos').select('id, nome, data_inicio, pets!inner(nome), status').eq('user_id', user.id),
        supabase.from('vacinas').select('id, nome, data_proxima, data_aplicacao, pets!inner(nome)').eq('user_id', user.id)
      ]);

      if (petsRes.error) throw petsRes.error;
      if (consultasRes.error) throw consultasRes.error;
      if (medicamentosRes.error) throw medicamentosRes.error;
      if (vacinasRes.error) throw vacinasRes.error;

      const allReminders: ReminderData[] = [];
      vacinasRes.data?.forEach(v => {
        if (!v.data_proxima) return;
        const proximaData = parseISO(v.data_proxima);
        const diff = differenceInDays(proximaData, hoje);
        if (diff <= 30) {
          let status: ReminderData['status'] = 'Próximo';
          if (diff < 0) status = 'Atrasado';
          if (diff === 0) status = 'Hoje';
          allReminders.push({ id: `vacina-${v.id}`, titulo: `Vacina: ${v.nome}`, descricao: 'Reforço agendado', pet_nome: v.pets.nome, data_lembrete: v.data_proxima, tipo: 'vacina', status });
        }
      });
      allReminders.sort((a, b) => new Date(a.data_lembrete).getTime() - new Date(b.data_lembrete).getTime());

      const activities: RecentActivityData[] = [];
      consultasRes.data?.forEach(c => activities.push({id: c.id, type: 'consulta', description: `Consulta: ${c.tipo}`, pet_name: c.pets.nome, date: c.data_consulta}));
      medicamentosRes.data?.forEach(m => activities.push({id: m.id, type: 'medicamento', description: `Medicamento: ${m.nome}`, pet_name: m.pets.nome, date: m.data_inicio}));
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const stats: DashboardStatsData = {
        totalPets: petsRes.count || 0,
        consultasAgendadas: consultasRes.data?.filter(c => isFuture(parseISO(c.data_consulta))).length || 0,
        medicamentosAtivos: medicamentosRes.data?.filter(m => m.status === 'ativo').length || 0,
        vacinasVencendo: allReminders.filter(r => r.tipo === 'vacina').length
      };

      return { stats, recentActivities: activities.slice(0, 5), upcomingReminders: allReminders.slice(0, 5) };
    },
    enabled: !!user,
  });

  if (error) {
    toast.error(`Erro ao carregar dashboard: ${error.message}`);
  }

  return {
    stats: data?.stats,
    recentActivities: data?.recentActivities,
    upcomingReminders: data?.upcomingReminders,
    loading: isLoading
  };
}