import { Card, CardContent } from "@/components/ui/card";
import { PawPrint, Calendar, Syringe, CalendarCheck } from "lucide-react";
import { useVetDashboardData } from "@/hooks/useVetDashboardData";

interface VetStatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const VetStatCard = ({ title, value, icon: Icon, color, bgColor }: VetStatCardProps) => (
  <Card className="overflow-hidden transition-all duration-200 hover:shadow-md relative">
    <CardContent className="p-6 relative">
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${bgColor} opacity-20`}></div>
      <div className="relative z-10">
        <div className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center mb-4`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-card-foreground">{value}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const VetDashboardStats = () => {
  const { stats, loading } = useVetDashboardData();

  const statCards = [
    {
      title: "Pacientes Autorizados",
      value: loading ? "..." : stats.totalPacientes,
      icon: PawPrint,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-blue to-blue-400",
    },
    {
      title: "Consultas Hoje", 
      value: loading ? "..." : stats.consultasHoje,
      icon: CalendarCheck,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-green to-green-400",
    },
    {
      title: "Consultas Agendadas",
      value: loading ? "..." : stats.consultasAgendadas, 
      icon: Calendar,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-purple to-purple-400",
    },
    {
      title: "Vacinas Vencendo",
      value: loading ? "..." : stats.vacinasVencendo,
      icon: Syringe,
      color: "text-white", 
      bgColor: "bg-gradient-to-br from-petcare-pink to-pink-400",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <VetStatCard key={index} {...stat} />
      ))}
    </div>
  );
};