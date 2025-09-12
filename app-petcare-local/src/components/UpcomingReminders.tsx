import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, Syringe, Stethoscope } from "lucide-react"; // Importamos os novos ícones
import { useDashboardData } from "@/hooks/useDashboardData";
import { format, isToday, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

// NOVO: Componente para o ícone dinâmico
const ReminderIcon = ({ type }: { type: string }) => {
    switch(type) {
        case 'vacina':
            return <Syringe className="w-4 h-4 text-white" />;
        case 'consulta':
            return <Stethoscope className="w-4 h-4 text-white" />;
        default:
            return <Clock className="w-4 h-4 text-white" />;
    }
}

// NOVO: Função para a cor dinâmica
const getReminderColor = (type: string) => {
    switch(type) {
        case 'vacina':
            return 'from-petcare-green to-green-400';
        case 'consulta':
            return 'from-petcare-blue to-blue-400';
        default:
            return 'from-petcare-orange to-orange-400';
    }
}

export const UpcomingReminders = () => {
  const { upcomingReminders, loading } = useDashboardData();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-petcare-orange" />
          <CardTitle className="text-lg">Próximos Lembretes</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Carregando lembretes...</p>
          </div>
        ) : upcomingReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Nenhum lembrete pendente</p>
          </div>
        ) : (
          upcomingReminders.map((reminder) => {
            // Usamos parseISO para melhor compatibilidade de datas
            const reminderDate = parseISO(reminder.data_lembrete);
            const isTodayDate = isToday(reminderDate);
            
            return (
              <div key={reminder.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center space-x-3">
                  {/* ALTERAÇÃO: Usando a cor e o ícone dinâmicos */}
                  <div className={`w-8 h-8 bg-gradient-to-br ${getReminderColor(reminder.tipo)} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <ReminderIcon type={reminder.tipo} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-card-foreground truncate">
                      {reminder.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {reminder.pet_nome} • {reminder.descricao}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={reminder.status === 'Atrasado' ? 'destructive' : isTodayDate ? 'default' : 'secondary'}
                  className="text-xs ml-2"
                >
                  {reminder.status === 'Atrasado' ? 'Atrasado!' : isTodayDate ? 'Hoje' : format(reminderDate, 'dd/MM', { locale: ptBR })}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};