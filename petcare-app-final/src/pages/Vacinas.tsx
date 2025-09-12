// Copie todo este código e cole no seu arquivo Vacinas.tsx

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plus, Syringe, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Vacinas = () => {
  const [searchParams] = useSearchParams();
  const [selectedPet, setSelectedPet] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(searchParams.get('action') === 'add');
  const [editingVacina, setEditingVacina] = useState<any>(null);
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

  const { data: vacinas = [] } = useQuery({
    queryKey: ['vacinas', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vacinas')
        .select('*, pets!inner(nome, foto_url)') // Garantindo que a foto_url do pet é buscada
        .eq('user_id', user?.id)
        .order('data_aplicacao', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addVacinaMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('vacinas').insert({
        ...data,
        user_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacinas'] });
      setIsAddDialogOpen(false);
      toast.success('Vacina adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar vacina: ${error.message}`);
    }
  });

  const updateVacinaMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      // BÔNUS: Corrigido para remover o .eq('user_id') extra
      const { error } = await supabase
        .from('vacinas')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vacinas'] });
      setEditingVacina(null);
      toast.success('Vacina atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar vacina: ${error.message}`);
    }
  });

  const getVacinaStatus = (dataProxima?: string) => {
    if (!dataProxima) return 'Em Dia';
    // Adiciona replace para corrigir problema de fuso horário
    const proxima = new Date(dataProxima.replace(/-/g, '/'));
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
    
    if (proxima < hoje) return 'Atrasada';

    const diffTime = proxima.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) return 'Venc. Próximo';
    return 'Em Dia';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Em Dia':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Venc. Próximo':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Atrasada':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredVacinas = vacinas.filter(v =>
    selectedPet === "todos" || v.pet_id === selectedPet
  );

  const stats = {
    emDia: vacinas.filter(v => getVacinaStatus(v.data_proxima) === 'Em Dia').length,
    vencProximo: vacinas.filter(v => getVacinaStatus(v.data_proxima) === 'Venc. Próximo').length,
    atrasadas: vacinas.filter(v => getVacinaStatus(v.data_proxima) === 'Atrasada').length
  };

  const VacinaCard = ({ vacina }: { vacina: any }) => {
    const status = getVacinaStatus(vacina.data_proxima);
    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-petcare-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Syringe className="w-5 h-5 text-petcare-green" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{vacina.nome}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                        {vacina.pets?.foto_url ? (
                            <img src={vacina.pets.foto_url} alt={vacina.pets.nome} className="w-5 h-5 rounded-full object-cover border"/>
                        ) : (
                            <div className="w-5 h-5 bg-petcare-blue/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-petcare-blue">
                                    {vacina.pets?.nome?.charAt(0).toUpperCase() || 'P'}
                                </span>
                            </div>
                        )}
                        <span className="text-sm text-muted-foreground truncate">{vacina.pets?.nome}</span>
                    </div>
                </div>
            </div>
            <Badge className={`${getStatusColor(status)} border ml-2`}>
              {status}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between space-x-4 text-sm text-muted-foreground pt-3 border-t">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>Aplicada em: {format(new Date(vacina.data_aplicacao.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
            </div>
            {vacina.data_proxima && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Próxima: {format(new Date(vacina.data_proxima.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setEditingVacina(vacina)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
};

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Vacinas</h1>
            <p className="text-muted-foreground mt-1">Mantenha as vacinas dos seus pets sempre em dia</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-petcare-green to-green-400 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4 mr-2" />
                Nova Vacina
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Vacina</DialogTitle>
              </DialogHeader>
              <VacinaForm pets={pets} onSubmit={addVacinaMutation.mutate} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.emDia}</div>
              <div className="text-sm font-medium text-green-700">Em Dia</div>
            </CardContent>
          </Card>
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.vencProximo}</div>
              <div className="text-sm font-medium text-yellow-700">Venc. Próximo</div>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-1">{stats.atrasadas}</div>
              <div className="text-sm font-medium text-red-700">Atrasadas</div>
            </CardContent>
          </Card>
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
          {filteredVacinas.map((vacina) => (
            <VacinaCard key={vacina.id} vacina={vacina} />
          ))}
        </div>

        {filteredVacinas.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Syringe className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma vacina cadastrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione a primeira vacina para começar o controle!
              </p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Vacina
              </Button>
            </CardContent>
          </Card>
        )}

        {editingVacina && (
          <Dialog open={!!editingVacina} onOpenChange={() => setEditingVacina(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Vacina</DialogTitle>
              </DialogHeader>
              <VacinaForm
                pets={pets}
                initialData={editingVacina}
                onSubmit={(data) => {
                    const { pets, ...cleanData } = editingVacina; // Limpa o objeto original
                    updateVacinaMutation.mutate({ id: editingVacina.id, ...cleanData, ...data });
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

const VacinaForm = ({ pets, initialData, onSubmit }: { pets: any[], initialData?: any, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    pet_id: initialData?.pet_id || '',
    // Correção de fuso horário no formulário
    data_aplicacao: initialData?.data_aplicacao?.split('T')[0] || '',
    data_proxima: initialData?.data_proxima?.split('T')[0] || '',
    veterinario: initialData?.veterinario || '',
    laboratorio: initialData?.laboratorio || '',
    lote: initialData?.lote || '',
    local_aplicacao: initialData?.local_aplicacao || '',
    observacoes: initialData?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome da Vacina</Label>
        <Input
          id="nome"
          value={formData.nome}
          onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
          required
        />
      </div>
      
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
      
      <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="data_aplicacao">Data de Aplicação</Label>
            <Input
              id="data_aplicacao"
              type="date"
              value={formData.data_aplicacao}
              onChange={(e) => setFormData(prev => ({ ...prev, data_aplicacao: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="data_proxima">Próxima Dose (opcional)</Label>
            <Input
              id="data_proxima"
              type="date"
              value={formData.data_proxima}
              onChange={(e) => setFormData(prev => ({ ...prev, data_proxima: e.target.value }))}
            />
          </div>
      </div>
      
      <div>
        <Label htmlFor="veterinario">Veterinário (opcional)</Label>
        <Input
          id="veterinario"
          value={formData.veterinario}
          onChange={(e) => setFormData(prev => ({ ...prev, veterinario: e.target.value }))}
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Atualizar' : 'Adicionar'} Vacina
      </Button>
    </form>
  );
};

export default Vacinas;