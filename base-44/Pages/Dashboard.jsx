import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { Vacinacao } from "@/entities/Vacinacao";
import { Consulta } from "@/entities/Consulta";
import { Medicamento } from "@/entities/Medicamento";
import { Heart, PawPrint, Syringe, Calendar, AlertTriangle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

import QuickStats from "../components/dashboard/QuickStats";
import RecentActivity from "../components/dashboard/RecentActivity";
import UpcomingReminders from "../components/dashboard/UpcomingReminders";
import PetOverview from "../components/dashboard/PetOverview";

export default function Dashboard() {
  const [pets, setPets] = useState([]);
  const [vacinacoes, setVacinacoes] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [petsData, vacinacoesData, consultasData, medicamentosData] = await Promise.all([
        Pet.list('-created_date'),
        Vacinacao.list('-created_date', 50),
        Consulta.list('-data', 20),
        Medicamento.filter({ ativo: true }, '-created_date', 20)
      ]);

      setPets(petsData);
      setVacinacoes(vacinacoesData);
      setConsultas(consultasData);
      setMedicamentos(medicamentosData);
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    }
    setIsLoading(false);
  };

  const getUpcomingVaccinations = () => {
    const nextWeek = addDays(new Date(), 7);
    return vacinacoes.filter(vac => 
      vac.proxima_dose && 
      isBefore(new Date(vac.proxima_dose), nextWeek) &&
      isAfter(new Date(vac.proxima_dose), new Date())
    );
  };

  const getUpcomingAppointments = () => {
    return consultas.filter(apt => 
      apt.status === 'agendada' &&
      isAfter(new Date(apt.data), new Date())
    ).slice(0, 5);
  };

  const getActiveMedications = () => {
    return medicamentos.filter(med => med.ativo);
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Dashboard PetCare+
          </h1>
          <p className="text-gray-600">Acompanhe a saúde e bem-estar dos seus pets em um só lugar</p>
        </div>

        {/* Stats Cards */}
        <QuickStats 
          pets={pets}
          vacinacoes={vacinacoes}
          consultas={consultas}
          medicamentos={medicamentos}
          isLoading={isLoading}
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Pet Overview */}
            <PetOverview pets={pets} isLoading={isLoading} />

            {/* Recent Activity */}
            <RecentActivity 
              vacinacoes={vacinacoes}
              consultas={consultas}
              medicamentos={medicamentos}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingReminders 
              upcomingVaccinations={getUpcomingVaccinations()}
              upcomingAppointments={getUpcomingAppointments()}
              activeMedications={getActiveMedications()}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to={createPageUrl("Pets?action=add")}>
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow-lg">
                  <PawPrint className="w-4 h-4 mr-2" />
                  Novo Pet
                </Button>
              </Link>
              <Link to={createPageUrl("Vacinacoes?action=add")}>
                <Button variant="outline" className="w-full border-green-300 hover:bg-green-50">
                  <Syringe className="w-4 h-4 mr-2 text-green-600" />
                  Vacina
                </Button>
              </Link>
              <Link to={createPageUrl("Consultas?action=add")}>
                <Button variant="outline" className="w-full border-blue-300 hover:bg-blue-50">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  Consulta
                </Button>
              </Link>
              <Link to={createPageUrl("Peso?action=add")}>
                <Button variant="outline" className="w-full border-purple-300 hover:bg-purple-50">
                  <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                  Peso
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}