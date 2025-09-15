import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Syringe, Calendar, Pill } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RecentActivity({ vacinacoes, consultas, medicamentos, isLoading }) {
  const getRecentActivities = () => {
    const activities = [];

    // Recent vaccinations
    vacinacoes.slice(0, 3).forEach(vac => {
      activities.push({
        type: 'vacinacao',
        icon: Syringe,
        title: `Vacina: ${vac.nome_vacina}`,
        subtitle: `Pet ID: ${vac.pet_id}`,
        date: new Date(vac.data_aplicacao),
        color: 'text-green-600',
        bg: 'bg-green-100'
      });
    });

    // Recent appointments
    consultas.slice(0, 3).forEach(apt => {
      activities.push({
        type: 'consulta',
        icon: Calendar,
        title: `Consulta com ${apt.veterinario}`,
        subtitle: apt.motivo || 'Consulta de rotina',
        date: new Date(apt.data),
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      });
    });

    // Recent medications
    medicamentos.slice(0, 2).forEach(med => {
      activities.push({
        type: 'medicamento',
        icon: Pill,
        title: `Medicamento: ${med.nome}`,
        subtitle: `${med.dosagem} - ${med.frequencia}`,
        date: new Date(med.data_inicio),
        color: 'text-purple-600',
        bg: 'bg-purple-100'
      });
    });

    // Sort by date (most recent first)
    return activities.sort((a, b) => b.date - a.date).slice(0, 6);
  };

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma atividade recente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`p-2 rounded-full ${activity.bg}`}>
                  <activity.icon className={`w-5 h-5 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-sm text-gray-600">{activity.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {format(activity.date, "dd/MM", { locale: ptBR })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}