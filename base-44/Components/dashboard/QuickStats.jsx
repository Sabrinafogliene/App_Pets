import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Syringe, Calendar, Pill } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function QuickStats({ pets, vacinacoes, consultas, medicamentos, isLoading }) {
  const stats = [
    {
      title: "Pets Cadastrados",
      value: pets.length,
      icon: PawPrint,
      gradient: "from-pink-500 to-rose-500",
      bg: "bg-pink-100",
      textColor: "text-pink-600"
    },
    {
      title: "Vacinas em Dia",
      value: vacinacoes.filter(v => v.status === 'em_dia').length,
      icon: Syringe,
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Consultas Agendadas",
      value: consultas.filter(a => a.status === 'agendada').length,
      icon: Calendar,
      gradient: "from-blue-500 to-cyan-500",
      bg: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Tratamentos Ativos",
      value: medicamentos.filter(m => m.ativo).length,
      icon: Pill,
      gradient: "from-purple-500 to-violet-500",
      bg: "bg-purple-100",
      textColor: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 absolute -top-2 -right-2`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium text-gray-600">{stat.title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-2" />
            ) : (
              <p className="text-3xl font-bold mt-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {stat.value}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}