import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Settings, 
  PawPrint, 
  Mail,
  Send,
  Stethoscope,
  User,
  Calendar,
  Activity
} from "lucide-react";
import { VetDashboardStats } from "@/components/VetDashboardStats";
import { VetPacientesList } from "@/components/VetPacientesList";
import { VetUpcomingSchedule } from "@/components/VetUpcomingSchedule";
import { VetRecentActivity } from "@/components/VetRecentActivity";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const PainelVeterinario = () => {
  const { profile } = useAuthContext();
  const [emailConvite, setEmailConvite] = useState("");

  const handleSendInvite = async () => {
    if (!emailConvite.trim()) {
      toast.error("Por favor, digite um email válido");
      return;
    }

    try {
      // TODO: Implementar envio de convite para tutor
      toast.success("Convite enviado com sucesso!");
      setEmailConvite("");
    } catch (error) {
      toast.error("Erro ao enviar convite");
    }
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Painel do Veterinário</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gerencie seus pacientes e acompanhe suas atividades clínicas.
          </p>
        </div>

        {/* Stats Cards */}
        <VetDashboardStats />

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Pacientes - 2 columns em desktop */}
          <div className="xl:col-span-2 order-2 xl:order-1">
            <VetPacientesList />
          </div>

          {/* Sidebar - 1 column em desktop */}
          <div className="order-1 xl:order-2">
            {/* Convidar Tutor */}
            <Card>
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Mail className="w-5 h-5 text-petcare-purple flex-shrink-0" />
                  <h3 className="text-lg lg:text-xl font-bold text-foreground">Convidar Tutor</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email do Tutor
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email.do.tutor@exemplo.com"
                      value={emailConvite}
                      onChange={(e) => setEmailConvite(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-petcare-purple to-purple-400 hover:opacity-90 transition-opacity touch-manipulation"
                    onClick={handleSendInvite}
                  >
                    <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                    Enviar Convite
                  </Button>
                </div>
                
                <div className="mt-6 p-3 lg:p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    O tutor receberá um convite por email para compartilhar o histórico 
                    do seu pet com você.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Schedule and Activity */}
        <div className="space-y-4 lg:space-y-6">
          <VetUpcomingSchedule />
          <VetRecentActivity />
        </div>
      </div>
    </Layout>
  );
};

export default PainelVeterinario;