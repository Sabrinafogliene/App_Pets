import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, Pill, Stethoscope } from "lucide-react";
import { useVetDashboardData } from "@/hooks/useVetDashboardData";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const VetRecentActivity = () => {
  const { recentActivities, loading } = useVetDashboardData();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'consulta': return Calendar;
      case 'medicamento': return Pill;
      default: return Stethoscope;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'consulta': return 'text-petcare-green';
      case 'medicamento': return 'text-petcare-purple';
      default: return 'text-petcare-blue';
    }
  };

  const getActivityBadgeVariant = (type: string) => {
    switch (type) {
      case 'consulta': return 'secondary' as const;
      case 'medicamento': return 'outline' as const;
      default: return 'default' as const;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-petcare-blue" />
            <span>Atividades Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Carregando atividades...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-petcare-blue" />
            <span>Atividades Recentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Activity className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhuma atividade recente
            </h3>
            <p className="text-sm text-muted-foreground">
              As atividades dos seus pacientes aparecerão aqui.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-petcare-blue" />
          <span>Atividades Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const iconColor = getActivityColor(activity.type);
            const badgeVariant = getActivityBadgeVariant(activity.type);

            return (
              <div 
                key={activity.id}
                className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg"
              >
                <div className={`w-8 h-8 rounded-full bg-background flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-card-foreground">
                      {activity.description}
                    </p>
                    <Badge variant={badgeVariant} className="text-xs capitalize">
                      {activity.type}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">{activity.pet_name}</span>
                      <span className="mx-1">•</span>
                      <span>{activity.tutor_name}</span>
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {format(new Date(activity.date), "dd/MM/yy", { locale: ptBR })}
                    </time>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};