// Copie todo este código e cole no seu arquivo Peso.tsx, substituindo o conteúdo antigo.

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plus, Weight, TrendingUp, Calendar, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { toast } from "sonner";

// NOVO: Componente de formulário separado para reutilização
const PesoForm = ({ pets, user, onFormSubmit }: { pets: any[], user: any, onFormSubmit: () => void }) => {
    const [selectedPetId, setSelectedPetId] = useState("");
    const [novoPeso, setNovoPeso] = useState("");
    const [novaData, setNovaData] = useState(new Date().toISOString().split('T')[0]);
    const queryClient = useQueryClient();

    const addPesoMutation = useMutation({
        mutationFn: async () => {
            if (!selectedPetId || !novoPeso) throw new Error('Pet e peso são obrigatórios');
            
            const { error } = await supabase.from('peso').insert({
                pet_id: selectedPetId,
                peso: parseFloat(novoPeso),
                data_pesagem: novaData,
                user_id: user?.id
            });
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['peso', selectedPetId] });
            setNovoPeso('');
            toast.success('Peso registrado com sucesso!');
            onFormSubmit(); // Fecha o Dialog
        },
        onError: (error: any) => {
            toast.error(`Erro ao registrar peso: ${error.message}`);
        }
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); addPesoMutation.mutate(); }} className="space-y-4">
             <div>
                <Label htmlFor="pet_id">Pet</Label>
                <Select value={selectedPetId} onValueChange={setSelectedPetId} required>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione um pet" />
                    </SelectTrigger>
                    <SelectContent>
                        {pets.map((pet) => (
                            <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={novoPeso}
                    onChange={(e) => setNovoPeso(e.target.value)}
                    required
                />
            </div>
            <div>
                <Label htmlFor="data_pesagem">Data</Label>
                <Input
                    id="data_pesagem"
                    type="date"
                    value={novaData}
                    onChange={(e) => setNovaData(e.target.value)}
                    required
                />
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-petcare-purple to-purple-400 hover:opacity-90 transition-opacity"
                disabled={addPesoMutation.isPending}
            >
                {addPesoMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Weight className="w-4 h-4 mr-2" />}
                {addPesoMutation.isPending ? 'Salvando...' : 'Salvar Peso'}
            </Button>
        </form>
    );
};


const Peso = () => {
  const [searchParams] = useSearchParams();
  const [selectedPet, setSelectedPet] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(searchParams.get('action') === 'add');
  const { user } = useAuthContext();

  useEffect(() => {
    // Se o parâmetro está na URL, abre o dialog.
    // Se o usuário fechar o dialog, o estado muda, mas o parâmetro continua lá.
    // Para reabrir, ele teria que recarregar a página. Isso é um comportamento aceitável.
    setIsAddDialogOpen(searchParams.get('action') === 'add');
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

  const { data: registrosPeso = [], isLoading: isLoadingPeso } = useQuery({
    queryKey: ['peso', selectedPet],
    queryFn: async () => {
      if (!selectedPet) return [];
      const { data, error } = await supabase
        .from('peso')
        .select('*')
        .eq('pet_id', selectedPet)
        .order('data_pesagem', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id && !!selectedPet,
  });
  
  const dadosGrafico = registrosPeso.map(r => ({
    data: format(new Date(r.data_pesagem), 'dd/MM'),
    peso: Number(r.peso)
  }));
  
  const selectedPetData = pets.find(p => p.id === selectedPet);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Controle de Peso</h1>
            <p className="text-muted-foreground mt-1">Acompanhe a evolução do peso do seu pet</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-petcare-purple to-purple-400 hover:opacity-90 transition-opacity">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Registro
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Registro de Peso</DialogTitle>
                </DialogHeader>
                <PesoForm pets={pets} user={user} onFormSubmit={() => setIsAddDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="w-64">
                <Label>Selecione um Pet</Label>
                <Select value={selectedPet} onValueChange={setSelectedPet}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                        {pets.map((pet) => (
                            <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </CardContent>
        </Card>

        {selectedPet ? (
            <>
                <Card>
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-petcare-blue" />
                            <CardTitle>Gráfico de Evolução para {selectedPetData?.nome}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingPeso ? <div className="h-80 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div> :
                         dadosGrafico.length > 1 ? (
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={dadosGrafico}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="data" />
                                        <YAxis domain={['dataMin - 1', 'dataMax + 1']} label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip formatter={(value: any) => [`${value}kg`, 'Peso']} />
                                        <Line type="monotone" dataKey="peso" stroke="hsl(var(--petcare-blue))" strokeWidth={3} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                Adicione mais registros de peso para gerar o gráfico.
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Registros Recentes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {registrosPeso.length > 0 ? registrosPeso.slice().reverse().map((registro) => (
                          <div key={registro.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-petcare-blue/10 rounded-lg flex items-center justify-center">
                                <Weight className="w-4 h-4 text-petcare-blue" />
                              </div>
                              <p className="font-medium text-sm">{registro.peso}kg</p>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{format(new Date(registro.data_pesagem.replace(/-/g, '/')), 'dd/MM/yyyy')}</span>
                            </div>
                          </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">Nenhum registro de peso encontrado para este pet.</p>
                            </div>
                        )}
                      </div>
                    </CardContent>
                </Card>
            </>
        ) : (
            <Card>
                <CardContent className="p-12 text-center">
                    <Weight className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        Selecione um pet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Escolha um pet para visualizar o histórico e o gráfico de peso.
                    </p>
                </CardContent>
            </Card>
        )}
      </div>
    </Layout>
  );
};

export default Peso;