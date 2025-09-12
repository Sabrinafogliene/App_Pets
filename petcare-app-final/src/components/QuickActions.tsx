import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Syringe, Calendar, Weight } from "lucide-react";
import { Link } from "react-router-dom";

interface ActionButtonProps {
  title: string;
  href: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}

const ActionButton = ({ title, href, icon: Icon, color, bgColor }: ActionButtonProps) => {
  const isPrimary = title === "Novo Pet";
  
  if (isPrimary) {
    return (
      <Link to={href} className="block">
        <Button 
          className="w-full h-16 bg-gradient-to-r from-petcare-pink to-pink-400 hover:from-petcare-pink/90 hover:to-pink-400/90 text-white border-0 hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3"
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{title}</span>
        </Button>
      </Link>
    );
  }
  
  return (
    <Link to={href} className="block">
      <Button 
        variant="outline" 
        className={`w-full h-16 bg-white border border-border hover:${bgColor} hover:border-current hover:shadow-md transition-all duration-200 flex items-center justify-center space-x-3 group`}
      >
        <Icon className={`w-5 h-5 ${color}`} />
        <span className={`font-medium text-muted-foreground group-hover:${color.replace('text-', 'text-')}`}>{title}</span>
      </Button>
    </Link>
  );
};

export const QuickActions = () => {
  const actions = [
    {
      title: "Novo Pet",
      href: "/pets?action=add",
      icon: Plus,
      color: "text-petcare-pink",
      bgColor: "hover:bg-pink-50"
    },
    {
      title: "Vacina", 
      href: "/vacinas?action=add",
      icon: Syringe,
      color: "text-petcare-green",
      bgColor: "hover:bg-green-50"
    },
    {
      title: "Consulta",
      href: "/consultas?action=add", 
      icon: Calendar,
      color: "text-petcare-blue",
      bgColor: "hover:bg-blue-50"
    },
    {
      title: "Peso",
      href: "/peso?action=add",
      icon: Weight,
      color: "text-petcare-purple", 
      bgColor: "hover:bg-purple-50"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-md flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <ActionButton key={index} {...action} />
        ))}
      </CardContent>
    </Card>
  );
};