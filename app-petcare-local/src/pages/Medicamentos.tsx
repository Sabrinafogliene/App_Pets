import { useState } from "react";
import Layout from "@/components/Layout";
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
import { Plus, Pill, Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Medicamentos = () => {
  const [selectedPet, setSelectedPet] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

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

  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*, pets!inner(id, nome, foto_url)') // Garante que a foto_url seja buscada
        .eq('user_id', user?.id)
        .order('data_inicio', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addMedicamentoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('medicamentos').insert({
        ...data,
        user_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      setIsAddDialogOpen(false);
      toast.success('Medicamento adicionado com sucesso!');
    },
    onError: (error: any) => {
        toast.error(`Erro ao adicionar medicamento: ${error.message}`);
    }
  });

  const updateMedicamentoMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      // BÔNUS: Corrigido para remover o .eq('user_id') extra
      const { error } = await supabase
        .from('medicamentos')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicamentos'] });
      setEditingMedicamento(null);
      toast.success('Medicamento atualizado com sucesso!');
    },
    onError: (error: any) => {
        toast.error(`Erro ao atualizar medicamento: ${error.message}`);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredMedicamentos = medicamentos.filter(m =>
    selectedPet === "todos" || m.pets?.id === selectedPet
  );

  const MedicamentoCard = ({ medicamento }: { medicamento: any }) => (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-petcare-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Pill className="w-5 h-5 text-petcare-orange" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground truncate">{medicamento.nome}</h3>
              <div className="flex items-center space-x-2 mt-1">
                
                {/* --- INÍCIO DA CORREÇÃO --- */}
                {medicamento.pets?.foto_url ? (
                    <img src={medicamento.pets.foto_url} alt={medicamento.pets.nome} className="w-5 h-5 rounded-full object-cover border"/>
                ) : (
                    <div className="w-5 h-5 bg-petcare-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-petcare-blue">
                            {medicamento.pets?.nome?.charAt(0).toUpperCase() || 'P'}
                        </span>
                    </div>
                )}
                {/* --- FIM DA CORREÇÃO --- */}

                <span className="text-sm text-muted-foreground truncate">{medicamento.pets?.nome}</span>
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(medicamento.status)} border ml-2`}>
            {medicamento.status === 'ativo' ? 'Ativo' : 'Finalizado'}
          </Badge>
        </div>

        <div className="space-y-3 pt-3 border-t">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-card-foreground">Dosagem:</span> {medicamento.dosagem}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-card-foreground">Frequência:</span> {medicamento.frequencia}
            </p>
          </div>
          
          <div className="flex items-center justify-between space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              {/* Correção de fuso horário na exibição */}
              <span>Início: {format(new Date(medicamento.data_inicio.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
            </div>
            {medicamento.data_fim && (
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                {/* Correção de fuso horário na exibição */}
                <span>Fim: {format(new Date(medicamento.data_fim.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setEditingMedicamento(medicamento)}
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
            <h1 className="text-3xl font-bold text-foreground">Medicamentos e Tratamentos</h1>
            <p className="text-muted-foreground mt-1">Gerencie os medicamentos em uso</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-petcare-orange to-orange-400 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4 mr-2" />
                Novo Medicamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Medicamento</DialogTitle>
              </DialogHeader>
              <MedicamentoForm pets={pets} onSubmit={addMedicamentoMutation.mutate} />
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
          {filteredMedicamentos.map((medicamento) => (
            <MedicamentoCard key={medicamento.id} medicamento={medicamento} />
          ))}
        </div>

        {filteredMedicamentos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhum medicamento cadastrado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione o primeiro medicamento para começar o controle!
              </p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Medicamento
              </Button>
            </CardContent>
          </Card>
        )}

        {editingMedicamento && (
          <Dialog open={!!editingMedicamento} onOpenChange={() => setEditingMedicamento(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Medicamento</DialogTitle>
              </DialogHeader>
              <MedicamentoForm
                pets={pets}
                initialData={editingMedicamento}
                onSubmit={(data) => {
                    const { pets, ...cleanData } = editingMedicamento;
                    updateMedicamentoMutation.mutate({ id: editingMedicamento.id, ...cleanData, ...data });
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

const MedicamentoForm = ({ pets, initialData, onSubmit }: { pets: any[], initialData?: any, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    pet_id: initialData?.pet_id || '',
    dosagem: initialData?.dosagem || '',
    frequencia: initialData?.frequencia || '',
    data_inicio: initialData?.data_inicio?.split('T')[0] || '',
    data_fim: initialData?.data_fim?.split('T')[0] || '',
    tipo: initialData?.tipo || '',
    veterinario: initialData?.veterinario || '',
    observacoes: initialData?.observacoes || '',
    status: initialData?.status || 'ativo'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="nome">Nome do Medicamento</Label>
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
          <Label htmlFor="dosagem">Dosagem</Label>
          <Input
            id="dosagem"
            value={formData.dosagem}
            onChange={(e) => setFormData(prev => ({ ...prev, dosagem: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="frequencia">Frequência</Label>
          <Input
            id="frequencia"
            value={formData.frequencia}
            onChange={(e) => setFormData(prev => ({ ...prev, frequencia: e.target.value }))}
            placeholder="Ex: De 8 em 8 horas"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="data_inicio">Data de Início</Label>
          <Input
            id="data_inicio"
            type="date"
            value={formData.data_inicio}
            onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="data_fim">Data de Fim (opcional)</Label>
          <Input
            id="data_fim"
            type="date"
            value={formData.data_fim}
            onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          value={formData.observacoes}
          onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
        />
      </div>
      
      <Button type="submit" className="w-full">
        {initialData ? 'Atualizar' : 'Adicionar'} Medicamento
      </Button>
    </form>
  );
};

export default Medicamentos;