import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  ArrowLeft, 
  PawPrint, 
  Settings,
  Calendar,
  Syringe,
  Pill,
  Weight
} from "lucide-react";

interface Paciente {
  id: string;
  nome: string;
  raca: string;
  idade: string;
  peso: string;
  sexo: string;
  status: string;
  tutor: string;
}

interface Vacina {
  id: string;
  nome: string;
  data: string;
  status: string;
}

interface Consulta {
  id: string;
  data: string;
  motivo: string;
  observacoes: string;
}

const PacienteDetalhes = () => {
  const { id } = useParams();
  
  // Dados fictícios
  const paciente: Paciente | undefined = id === '1' ? {
    id: '1',
    nome: 'Luna',
    raca: 'Fox Paulistinha',
    idade: '8a 3m',
    peso: '8kg',
    sexo: 'Fêmea',
    status: 'Castrado',
    tutor: 'João Silva'
  } : id === '2' ? {
    id: '2',
    nome: 'Amora',
    raca: 'SRD',
    idade: '7a 4m',
    peso: '14kg',
    sexo: 'Fêmea',
    status: 'Castrado',
    tutor: 'Maria Santos'
  } : undefined;

  const vacinas: Vacina[] = [
    { id: '1', nome: 'V10', data: '15/01/2024', status: 'Aplicada' },
    { id: '2', nome: 'Antirrábica', data: '20/03/2024', status: 'Aplicada' }
  ];

  const consultas: Consulta[] = [
    { 
      id: '1', 
      data: '10/02/2024', 
      motivo: 'Consulta de rotina',
      observacoes: 'Animal apresenta bom estado geral. Peso adequado para a idade.'
    }
  ];

  const medicamentos = [
    { id: '1', nome: 'Dipirona', dosagem: '0.5ml', frequencia: '8/8h', periodo: '3 dias' }
  ];

  const registrosPeso = [
    { id: '1', peso: '8.0', data: '10/02/2024' },
    { id: '2', peso: '7.8', data: '15/01/2024' },
    { id: '3', peso: '7.9', data: '20/12/2023' },
    { id: '4', peso: '8.1', data: '25/11/2023' }
  ];

  const VetLayout = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Veterinário */}
      <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-sidebar-foreground">PetCare+</h1>
              <p className="text-xs text-petcare-blue font-medium">Portal do Veterinário</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <Link
              to="/painel-veterinario"
              className="group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
            >
              <PawPrint className="w-5 h-5 text-petcare-blue" />
              <span className="ml-3">Pacientes</span>
              <div className="ml-auto w-2 h-2 bg-primary rounded-full"></div>
            </Link>
          </div>
        </nav>

        {/* Account Section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="space-y-2">
            <Link
              to="/configuracoes-vet"
              className="group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <Settings className="w-5 h-5 text-muted-foreground" />
              <span className="ml-3">Configurações</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );

  if (!paciente) {
    return (
      <VetLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-muted-foreground">Paciente não encontrado</h1>
          <Link to="/painel-veterinario">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Pacientes
            </Button>
          </Link>
        </div>
      </VetLayout>
    );
  }

  return (
    <VetLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/painel-veterinario">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Pacientes
          </Button>
        </Link>

        {/* Patient Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-petcare-blue to-blue-400 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                {paciente.nome.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-petcare-blue mb-2">{paciente.nome}</h1>
                <p className="text-lg text-muted-foreground mb-3">{paciente.raca}</p>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-petcare-yellow text-white">{paciente.idade}</Badge>
                  <Badge variant="outline">{paciente.peso}</Badge>
                  <Badge className="bg-pink-100 text-pink-800 border-pink-200">{paciente.sexo}</Badge>
                  <Badge className="bg-green-100 text-green-800 border-green-200">{paciente.status}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-petcare-yellow text-black">
            <TabsTrigger value="resumo" className="data-[state=active]:bg-white data-[state=active]:text-black">
              Resumo
            </TabsTrigger>
            <TabsTrigger value="vacinas" className="data-[state=active]:bg-petcare-yellow data-[state=active]:text-black">
              Vacinas
            </TabsTrigger>
            <TabsTrigger value="consultas" className="data-[state=active]:bg-petcare-yellow data-[state=active]:text-black">
              Consultas
            </TabsTrigger>
            <TabsTrigger value="medicamentos" className="data-[state=active]:bg-petcare-yellow data-[state=active]:text-black">
              Medicamentos
            </TabsTrigger>
            <TabsTrigger value="peso" className="data-[state=active]:bg-petcare-yellow data-[state=active]:text-black">
              Peso
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Syringe className="w-8 h-8 mx-auto mb-2 text-petcare-green" />
                  <div className="text-2xl font-bold text-petcare-green">1</div>
                  <div className="text-sm text-muted-foreground">Vacinas</div>
                </CardContent>
              </Card>
              
              <Card className="text-center">
                <CardContent className="p-6">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-petcare-purple" />
                  <div className="text-2xl font-bold text-petcare-purple">1</div>
                  <div className="text-sm text-muted-foreground">Consultas</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Pill className="w-8 h-8 mx-auto mb-2 text-petcare-orange" />
                  <div className="text-2xl font-bold text-petcare-orange">0</div>
                  <div className="text-sm text-muted-foreground">Medicamentos</div>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="p-6">
                  <Weight className="w-8 h-8 mx-auto mb-2 text-petcare-blue" />
                  <div className="text-2xl font-bold text-petcare-blue">4</div>
                  <div className="text-sm text-muted-foreground">Registros de Peso</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vacinas" className="space-y-4">
            {vacinas.map((vacina) => (
              <Card key={vacina.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{vacina.nome}</h3>
                      <p className="text-sm text-muted-foreground">Aplicada em: {vacina.data}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">{vacina.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="consultas" className="space-y-4">
            {consultas.map((consulta) => (
              <Card key={consulta.id}>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{consulta.motivo}</h3>
                      <Badge variant="outline">{consulta.data}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{consulta.observacoes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="medicamentos" className="space-y-4">
            {medicamentos.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Pill className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhum medicamento cadastrado</p>
                </CardContent>
              </Card>
            ) : (
              medicamentos.map((medicamento) => (
                <Card key={medicamento.id}>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{medicamento.nome}</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Dosagem:</span>
                        <p className="font-medium">{medicamento.dosagem}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Frequência:</span>
                        <p className="font-medium">{medicamento.frequencia}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Período:</span>
                        <p className="font-medium">{medicamento.periodo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="peso" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {registrosPeso.map((registro) => (
                <Card key={registro.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold text-petcare-blue">{registro.peso}kg</div>
                        <p className="text-sm text-muted-foreground">{registro.data}</p>
                      </div>
                      <Weight className="w-8 h-8 text-petcare-blue/30" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VetLayout>
  );
};

export default PacienteDetalhes;