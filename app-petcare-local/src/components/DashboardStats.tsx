import { Card, CardContent } from "@/components/ui/card";
import { Heart, PawPrint, Syringe, Calendar, Pill } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

const StatCard = ({ title, value, icon: Icon, color, bgColor, onClick }: StatCardProps) => (
  <Card 
    className={`overflow-hidden transition-all duration-200 hover:shadow-md relative ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
    onClick={onClick}
  >
    <CardContent className="p-6 relative">
      {/* Bolinha colorida de fundo */}
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

export const DashboardStats = () => {
  const { stats, loading } = useDashboardData();
  const navigate = useNavigate();

  const statCards = [
    {
      title: "Pets Cadastrados",
      value: loading ? "..." : stats.totalPets,
      icon: PawPrint,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-pink to-pink-400",
      onClick: () => navigate('/pets')
    },
    {
      title: "Vacinas Vencendo", 
      value: loading ? "..." : stats.vacinasVencendo,
      icon: Syringe,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-green to-green-400",
      onClick: () => navigate('/vacinas')
    },
    {
      title: "Consultas Agendadas",
      value: loading ? "..." : stats.consultasAgendadas, 
      icon: Calendar,
      color: "text-white",
      bgColor: "bg-gradient-to-br from-petcare-blue to-blue-400",
      onClick: () => navigate('/consultas')
    },
    {
      title: "Medicamentos Ativos",
      value: loading ? "..." : stats.medicamentosAtivos,
      icon: Pill,
      color: "text-white", 
      bgColor: "bg-gradient-to-br from-petcare-purple to-purple-400",
      onClick: () => navigate('/medicamentos')
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};