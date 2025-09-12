import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, Pill, Stethoscope, Scale } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const activityIcons = {
  consulta: { icon: Stethoscope, color: 'text-petcare-blue', bg: 'bg-blue-50' },
  medicamento: { icon: Pill, color: 'text-petcare-purple', bg: 'bg-purple-50' },
  vacina: { icon: Syringe, color: 'text-petcare-green', bg: 'bg-green-50' },
  peso: { icon: Scale, color: 'text-petcare-orange', bg: 'bg-orange-50' }
};

export const RecentActivity = () => {
  const { recentActivities, loading } = useDashboardData();

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-petcare-orange" />
          <CardTitle className="text-lg">Atividades Recentes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Carregando atividades...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhuma atividade recente</p>
          </div>
        ) : (
          recentActivities.map((activity) => {
            const iconConfig = activityIcons[activity.type as keyof typeof activityIcons];
            const IconComponent = iconConfig.icon;
            
            return (
              <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <div className={`w-10 h-10 rounded-lg ${iconConfig.bg} flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${iconConfig.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-card-foreground leading-tight">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      {activity.pet_name}
                    </Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  {format(new Date(activity.date), 'dd/MM', { locale: ptBR })}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};