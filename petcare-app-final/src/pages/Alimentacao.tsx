import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader,DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plus, Utensils, Clock, Edit } from "lucide-react";
import { toast } from "sonner";

const Alimentacao = () => {
  const [selectedPet, setSelectedPet] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAlimentacao, setEditingAlimentacao] = useState<any>(null);
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

  const { data: alimentacoes = [] } = useQuery({
    queryKey: ['alimentacao', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alimentacao')
        .select('*, pets!inner(id, nome, foto_url)') // Include id in the select
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addAlimentacaoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('alimentacao').insert({
        ...data,
        user_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alimentacao'] });
      setIsAddDialogOpen(false);
      toast.success('Registro de alimentação adicionado com sucesso!');
    },
    onError: (error: any) => {
        toast.error(`Erro ao adicionar registro: ${error.message}`);
    }
  });

  const updateAlimentacaoMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      // BÔNUS: Corrigido para remover o .eq('user_id') extra
      const { error } = await supabase
        .from('alimentacao')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alimentacao'] });
      setEditingAlimentacao(null);
      toast.success('Registro de alimentação atualizado com sucesso!');
    },
    onError: (error: any) => {
        toast.error(`Erro ao atualizar registro: ${error.message}`);
    }
  });

  const filteredAlimentacoes = alimentacoes.filter(a =>
    selectedPet === "todos" || a.pets?.id === selectedPet
  );

  const AlimentacaoCard = ({ registro }: { registro: any }) => (
    <Card className="group hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-petcare-yellow/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Utensils className="w-5 h-5 text-petcare-yellow" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-card-foreground truncate">{registro.tipo_alimento}</h3>
              <div className="flex items-center space-x-2 mt-1">
                {/* --- INÍCIO DA CORREÇÃO --- */}
                {registro.pets?.foto_url ? (
                    <img src={registro.pets.foto_url} alt={registro.pets.nome} className="w-5 h-5 rounded-full object-cover border"/>
                ) : (
                    <div className="w-5 h-5 bg-petcare-blue/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-petcare-blue">
                            {registro.pets?.nome?.charAt(0).toUpperCase() || 'P'}
                        </span>
                    </div>
                )}
                {/* --- FIM DA CORREÇÃO --- */}
                <span className="text-sm text-muted-foreground truncate">{registro.pets?.nome}</span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setEditingAlimentacao(registro)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 pt-3 border-t">
          {registro.marca && (
            <p className="text-sm">
              <span className="font-semibold text-card-foreground">Marca:</span> {registro.marca}
            </p>
          )}
          {registro.quantidade && (
            <p className="text-sm">
              <span className="font-semibold text-card-foreground">Quantidade:</span> {registro.quantidade}
            </p>
          )}
          {registro.horarios && registro.horarios.length > 0 && (
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-card-foreground">Horários:</span>
              <span className="text-muted-foreground">{registro.horarios.join(', ')}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Alimentação</h1>
            <p className="text-muted-foreground mt-1">Gerencie a dieta dos seus pets</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-petcare-yellow to-yellow-400 hover:opacity-90 transition-opacity text-white">
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Registro de Alimentação</DialogTitle>
              </DialogHeader>
              <AlimentacaoForm pets={pets} onSubmit={addAlimentacaoMutation.mutate} />
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
          {filteredAlimentacoes.map((registro) => (
            <AlimentacaoCard key={registro.id} registro={registro} />
          ))}
        </div>

        {filteredAlimentacoes.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Utensils className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhum registro de alimentação
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione o primeiro registro para começar o controle!
              </p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Registro
              </Button>
            </CardContent>
          </Card>
        )}

        {editingAlimentacao && (
          <Dialog open={!!editingAlimentacao} onOpenChange={() => setEditingAlimentacao(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Registro de Alimentação</DialogTitle>
              </DialogHeader>
              <AlimentacaoForm
                pets={pets}
                initialData={editingAlimentacao}
                onSubmit={(data) => {
                    const { pets, ...cleanData } = editingAlimentacao;
                    updateAlimentacaoMutation.mutate({ id: editingAlimentacao.id, ...cleanData, ...data });
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

const AlimentacaoForm = ({ pets, initialData, onSubmit }: { pets: any[], initialData?: any, onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    pet_id: initialData?.pet_id || '',
    tipo_alimento: initialData?.tipo_alimento || '',
    marca: initialData?.marca || '',
    quantidade: initialData?.quantidade || '',
    horarios: initialData?.horarios?.join(', ') || '',
    observacoes: initialData?.observacoes || '',
    data_registro: initialData?.data_registro?.split('T')[0] || new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpa e formata os dados antes de enviar
    const cleanData = {
      ...formData,
      horarios: formData.horarios.split(',').map(h => h.trim()).filter(Boolean)
    };
    
    onSubmit(cleanData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <Label htmlFor="tipo_alimento">Tipo de Alimento</Label>
        <Input
          id="tipo_alimento"
          value={formData.tipo_alimento}
          onChange={(e) => setFormData(prev => ({ ...prev, tipo_alimento: e.target.value }))}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="marca">Marca (opcional)</Label>
          <Input
            id="marca"
            value={formData.marca}
            onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
          />
        </div>
        
        <div>
          <Label htmlFor="quantidade">Quantidade (opcional)</Label>
          <Input
            id="quantidade"
            value={formData.quantidade}
            onChange={(e) => setFormData(prev => ({ ...prev, quantidade: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="horarios">Horários (separados por vírgula)</Label>
        <Input
          id="horarios"
          value={formData.horarios}
          onChange={(e) => setFormData(prev => ({ ...prev, horarios: e.target.value }))}
          placeholder="08:00, 18:00"
        />
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
        {initialData ? 'Atualizar' : 'Adicionar'} Registro
      </Button>
    </form>
  );
};

export default Alimentacao;