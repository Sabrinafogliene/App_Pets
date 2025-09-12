import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Syringe, Clock, User } from "lucide-react";
import { useVetDashboardData } from "@/hooks/useVetDashboardData";
import { format, isToday, isTomorrow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const VetUpcomingSchedule = () => {
  const { upcomingConsultas, expiringVacinas, loading } = useVetDashboardData();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, "dd/MM", { locale: ptBR });
  };

  const getVacinaStatus = (diasRestantes: number) => {
    if (diasRestantes < 0) return { label: "Atrasada", variant: "destructive" as const };
    if (diasRestantes === 0) return { label: "Hoje", variant: "secondary" as const };
    if (diasRestantes <= 7) return { label: `${diasRestantes}d`, variant: "secondary" as const };
    return { label: `${diasRestantes}d`, variant: "outline" as const };
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-petcare-green" />
              <span>Próximas Consultas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Carregando consultas...
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Syringe className="w-5 h-5 text-petcare-pink" />
              <span>Vacinas Vencendo</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              Carregando vacinas...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Próximas Consultas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-petcare-green" />
            <span>Próximas Consultas</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingConsultas.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma consulta agendada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingConsultas.slice(0, 5).map((consulta) => (
                <div 
                  key={consulta.id}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-sm">{consulta.pet_nome}</h4>
                      <Badge variant="outline" className="text-xs">
                        {consulta.tipo}
                      </Badge>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground space-x-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{consulta.tutor_nome}</span>
                      </div>
                      {consulta.hora_consulta && (
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{consulta.hora_consulta}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={isToday(new Date(consulta.data_consulta)) ? "default" : "secondary"}>
                      {formatDate(consulta.data_consulta)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vacinas Vencendo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Syringe className="w-5 h-5 text-petcare-pink" />
            <span>Vacinas Vencendo</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiringVacinas.length === 0 ? (
            <div className="text-center py-8">
              <Syringe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma vacina vencendo</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expiringVacinas.slice(0, 5).map((vacina) => {
                const status = getVacinaStatus(vacina.diasRestantes);
                return (
                  <div 
                    key={vacina.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{vacina.pet_nome}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{vacina.nome}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        <span>{vacina.tutor_nome}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={status.variant} className="mb-1">
                        {status.label}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(vacina.data_proxima), "dd/MM/yyyy")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};