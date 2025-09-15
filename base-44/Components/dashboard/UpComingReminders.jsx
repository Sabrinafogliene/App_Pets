import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Syringe, Calendar, Pill, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function UpcomingReminders({ upcomingVaccinations, upcomingAppointments, activeMedications, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Próximos Lembretes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getAllReminders = () => {
    const reminders = [];

    // Upcoming vaccinations
    upcomingVaccinations.forEach(vac => {
      const daysUntil = differenceInDays(new Date(vac.proxima_dose), new Date());
      reminders.push({
        type: 'vacinacao',
        icon: Syringe,
        title: vac.nome_vacina,
        subtitle: `Pet ID: ${vac.pet_id}`,
        date: new Date(vac.proxima_dose),
        daysUntil,
        urgent: daysUntil <= 3,
        color: 'text-green-600',
        bg: 'bg-green-100'
      });
    });

    // Upcoming appointments
    upcomingAppointments.forEach(apt => {
      const daysUntil = differenceInDays(new Date(apt.data), new Date());
      reminders.push({
        type: 'consulta',
        icon: Calendar,
        title: `Consulta com ${apt.veterinario}`,
        subtitle: apt.motivo || 'Consulta de rotina',
        date: new Date(apt.data),
        daysUntil,
        urgent: daysUntil <= 1,
        color: 'text-blue-600',
        bg: 'bg-blue-100'
      });
    });

    // Active medications (showing as daily reminders)
    activeMedications.slice(0, 3).forEach(med => {
      reminders.push({
        type: 'medicamento',
        icon: Pill,
        title: med.nome,
        subtitle: `${med.dosagem} - ${med.frequencia}`,
        date: new Date(),
        daysUntil: 0,
        urgent: false,
        color: 'text-purple-600',
        bg: 'bg-purple-100'
      });
    });

    return reminders.sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const reminders = getAllReminders();
  const hasUrgentReminders = reminders.some(r => r.urgent);

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-500" />
            Próximos Lembretes
            {hasUrgentReminders && (
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgente
              </Badge>
            )}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <div className="text-center py-6">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum lembrete próximo</p>
            <p className="text-sm text-gray-400 mt-2">Tudo sob controle! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                  reminder.urgent 
                    ? 'bg-red-50 border border-red-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-full ${reminder.bg} ${reminder.urgent ? 'animate-pulse' : ''}`}>
                  <reminder.icon className={`w-4 h-4 ${reminder.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{reminder.title}</p>
                  <p className="text-sm text-gray-600 truncate">{reminder.subtitle}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {reminder.daysUntil === 0 ? (
                      <Badge variant="outline" className="text-xs">Hoje</Badge>
                    ) : reminder.daysUntil === 1 ? (
                      <Badge variant="outline" className="text-xs">Amanhã</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        {reminder.daysUntil} dias
                      </Badge>
                    )}
                    {reminder.urgent && (
                      <Badge variant="destructive" className="text-xs">
                        Urgente
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {reminders.length > 0 && (
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  Ver Todos os Lembretes
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}