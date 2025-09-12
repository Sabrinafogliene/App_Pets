// Copie todo este código e cole no seu arquivo Consultas.tsx

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plus, Calendar, Stethoscope, Edit, User } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Consultas = () => {
  const [searchParams] = useSearchParams();
  const [selectedPet, setSelectedPet] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(searchParams.get('action') === 'add');
  const [editingConsulta, setEditingConsulta] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setIsAddDialogOpen(true);
    }
  }, [searchParams]);

  const { data: pets = [] } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user?.id)
        .order('nome');
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  
  const { data: veterinarios = [] } = useQuery({
    queryKey: ['veterinarios'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_authorized_veterinarians_safe');
      if (error) throw error;
      return data;
    },
  });

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultas')
        .select('*, pets!inner(nome, foto_url), veterinarios(nome)') // Garantindo que foto_url é buscada
        .eq('user_id', user?.id)
        .order('data_consulta', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addConsultaMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('consultas').insert({
        ...data,
        user_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setIsAddDialogOpen(false);
      toast.success('Consulta adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar consulta: ${error.message}`);
    }
  });

  const updateConsultaMutation = useMutation({
    mutationFn: async (dadosParaAtualizar: any) => {
      const { id, ...data } = dadosParaAtualizar;
      const { error } = await supabase
        .from('consultas')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] });
      setEditingConsulta(null);
      toast.success('Consulta atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar consulta: ${error.message}`);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredConsultas = consultas.filter(c =>
    selectedPet === "todos" || c.pet_id === selectedPet
  );

const ConsultaCard = ({ consulta }: { consulta: any }) => (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            
            <div className="w-10 h-10 bg-petcare-purple/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-petcare-purple" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground truncate">{consulta.tipo || 'Consulta'}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {consulta.pets?.foto_url ? (
                    <img src={consulta.pets.foto_url} alt={consulta.pets.nome} className="w-5 h-5 rounded-full object-cover border"/>
                ) : (
                    <div className="w-5 h-5 bg-petcare-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-petcare-blue">
                            {consulta.pets?.nome?.charAt(0).toUpperCase() || 'P'}
                        </span>
                    </div>
                )}
                <span className="text-sm text-muted-foreground truncate">{consulta.pets?.nome}</span>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(consulta.status)} border ml-2`}>
            {consulta.status === 'agendada' ? 'Agendada' : 'Concluída'}
          </Badge>
        </div>

        <div className="space-y-3">
            <p className="text-sm text-muted-foreground line-clamp-2">{consulta.descricao}</p>
            {consulta.veterinarios?.nome && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{consulta.veterinarios.nome}</span>
                </div>
            )}
            <div className="flex items-center space-x-2 text-sm text-muted-foreground pt-2 border-t">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(consulta.data_consulta.replace(/-/g, '/')), 'dd/MM/yyyy')} {consulta.hora_consulta && `às ${consulta.hora_consulta.substring(0, 5)}`}</span>
            </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setEditingConsulta(consulta)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
        </div>
      </CardContent>
    </Card>
);

    return (
        <Layout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Histórico de Consultas</h1>
                        <p className="text-muted-foreground mt-1">Acompanhe todas as visitas ao veterinário</p>
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-petcare-purple to-purple-400 hover:opacity-90 transition-opacity">
                                <Plus className="w-4 h-4 mr-2" />
                                Nova Consulta
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Adicionar Nova Consulta</DialogTitle>
                            </DialogHeader>
                            <ConsultaForm pets={pets} veterinarios={veterinarios} onSubmit={addConsultaMutation.mutate} />
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center space-x-4">
                            <Select value={selectedPet} onValueChange={setSelectedPet}>
                                <SelectTrigger className="w-64">
                                    <SelectValue placeholder="Filtrar por pet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os Pets</SelectItem>
                                    {pets.map((pet) => (
                                        <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredConsultas.map((consulta) => (
                        <ConsultaCard key={consulta.id} consulta={consulta} />
                    ))}
                </div>

                {filteredConsultas.length === 0 && (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                                Nenhuma consulta cadastrada
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Adicione a primeira consulta para começar o histórico!
                            </p>
                            <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Adicionar Consulta
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {editingConsulta && (
                    <Dialog open={!!editingConsulta} onOpenChange={() => setEditingConsulta(null)}>
                        <DialogContent className="max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Editar Consulta</DialogTitle>
                            </DialogHeader>
                            <ConsultaForm
                                pets={pets}
                                veterinarios={veterinarios}
                                initialData={editingConsulta}
                                onSubmit={(data) => {
                                    const { pets, veterinarios, ...cleanData } = editingConsulta;
                                    updateConsultaMutation.mutate({ ...cleanData, ...data });
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </Layout>
    );
};

const ConsultaForm = ({ pets, veterinarios, initialData, onSubmit }: { pets: any[], veterinarios: any[], initialData?: any, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    ...initialData,
    pet_id: initialData?.pet_id || '',
    tipo: initialData?.tipo || '',
    data_consulta: initialData?.data_consulta?.split('T')[0] || '',
    hora_consulta: initialData?.hora_consulta || '',
    descricao: initialData?.descricao || '',
    status: initialData?.status || 'agendada',
    veterinario_id: initialData?.veterinario_id || '',
    valor: initialData?.valor || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dadosProcessados = { ...formData };

    if (dadosProcessados.valor === '' || dadosProcessados.valor === null) {
      dadosProcessados.valor = null;
    } else {
      dadosProcessados.valor = parseFloat(dadosProcessados.valor);
    }
    
    if (dadosProcessados.veterinario_id === '') {
      dadosProcessados.veterinario_id = null;
    }
    
    const { created_at, user_id, pets, veterinarios, ...dadosParaEnviar } = dadosProcessados;
    
    onSubmit(dadosParaEnviar);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
            <Label htmlFor="pet_id">Pet</Label>
            <Select value={formData.pet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, pet_id: value }))} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar pet" />
              </SelectTrigger>
              <SelectContent>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>
        <div>
          <Label htmlFor="veterinario_id">Veterinário (opcional)</Label>
          <Select value={formData.veterinario_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, veterinario_id: value === 'none' ? null : value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Selecionar veterinário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Nenhum</SelectItem>
              {veterinarios.map((vet) => (
                <SelectItem key={vet.id} value={vet.id}>{vet.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="tipo">Tipo de Consulta</Label>
        <Input
          id="tipo"
          value={formData.tipo}
          onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_consulta">Data</Label>
          <Input
            id="data_consulta"
            type="date"
            value={formData.data_consulta}
            onChange={(e) => setFormData(prev => ({ ...prev, data_consulta: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="hora_consulta">Horário</Label>
          <Input
            id="hora_consulta"
            type="time"
            value={formData.hora_consulta}
            onChange={(e) => setFormData(prev => ({ ...prev, hora_consulta: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Atualizar' : 'Adicionar'} Consulta
      </Button>
    </form>
  );
};

export default Consultas;