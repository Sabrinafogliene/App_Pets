// Copie todo este código e cole no seu arquivo PetProfile.tsx

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, Weight, MapPin, Heart, Camera, Upload, Syringe, Stethoscope, Pill, Utensils, ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

const PetProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: pet, isLoading: isLoadingPet } = useQuery({
    queryKey: ['pet', id],
    queryFn: async () => {
      if (!id) throw new Error('Pet ID is required');
      const { data, error } = await supabase.from('pets').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // --- QUERIES PARA BUSCAR OS DADOS DAS ABAS ---
  const { data: vacinas = [] } = useQuery({
    queryKey: ['vacinas', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('vacinas').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: consultas = [] } = useQuery({
    queryKey: ['consultas', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('consultas').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: medicamentos = [] } = useQuery({
    queryKey: ['medicamentos', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('medicamentos').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: registrosPeso = [] } = useQuery({
    queryKey: ['peso', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('peso').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: alimentacao = [] } = useQuery({
    queryKey: ['alimentacao', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('alimentacao').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const { data: galeria = [] } = useQuery({
    queryKey: ['galeria', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase.from('galeria').select('*').eq('pet_id', id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });


  const uploadPhotoMutation = useMutation({
    mutationFn: async (file: File) => {
        if (!pet || !pet.user_id) throw new Error('Pet ou ID do usuário não encontrado');
      
        const fileExt = file.name.split('.').pop();
        const fileName = `${pet.user_id}/${pet.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

        const { error: updateError } = await supabase.from('pets').update({ foto_url: publicUrl }).eq('id', pet.id);
        if (updateError) throw updateError;
      
        return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet', id] });
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      toast.success('Foto atualizada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao atualizar foto: ${error.message}`);
    }
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhotoMutation.mutate(file);
    }
  };

  if (isLoadingPet) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!pet) {
    return (
      <Layout>
          <Button variant="ghost" onClick={() => navigate('/pets')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Meus Pets
          </Button>
          <div className="text-center py-12">Pet não encontrado.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/pets')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Meus Pets
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                    <div className="w-full h-full bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-full flex items-center justify-center">
                    {pet.foto_url ? (
                        <img 
                            src={pet.foto_url} 
                            alt={pet.nome}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <Heart className="w-8 h-8 text-white" />
                    )}
                    </div>
                    <label htmlFor="photo-upload" className="absolute -bottom-1 -right-1 cursor-pointer bg-white rounded-full p-1 border shadow-sm hover:bg-muted">
                        {uploadPhotoMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                            id="photo-upload"
                            disabled={uploadPhotoMutation.isPending}
                        />
                    </label>
                </div>
                <div>
                  <CardTitle className="text-2xl">{pet.nome}</CardTitle>
                  <p className="text-muted-foreground">{pet.especie} • {pet.raca}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col"><span className="text-muted-foreground">Idade</span><span className="font-medium">{pet.idade || 'N/A'} anos</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground">Peso</span><span className="font-medium">{pet.peso || 'N/A'} kg</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground">Cor</span><span className="font-medium">{pet.cor || 'N/A'}</span></div>
                <div className="flex flex-col"><span className="text-muted-foreground">Nascimento</span><span className="font-medium">{pet.data_nascimento ? format(parseISO(pet.data_nascimento), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}</span></div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="vacinas" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
            <TabsTrigger value="vacinas"><Syringe className="w-4 h-4 mr-2" />Vacinas</TabsTrigger>
            <TabsTrigger value="consultas"><Stethoscope className="w-4 h-4 mr-2" />Consultas</TabsTrigger>
            <TabsTrigger value="medicamentos"><Pill className="w-4 h-4 mr-2" />Medicamentos</TabsTrigger>
            <TabsTrigger value="peso"><Weight className="w-4 h-4 mr-2" />Peso</TabsTrigger>
            <TabsTrigger value="alimentacao"><Utensils className="w-4 h-4 mr-2" />Alimentação</TabsTrigger>
            <TabsTrigger value="galeria"><ImageIcon className="w-4 h-4 mr-2" />Galeria</TabsTrigger>
          </TabsList>

          <TabsContent value="vacinas">
            <Card>
                <CardHeader><CardTitle>Histórico de Vacinas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {vacinas.length > 0 ? vacinas.map(v => (
                        <div key={v.id} className="p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center">
                            <span>{v.nome}</span>
                            <span className="text-muted-foreground">{v.data_aplicacao ? format(new Date(v.data_aplicacao.replace(/-/g, '/')), 'dd/MM/yyyy') : ''}</span>
                        </div>
                    )) : <p className="text-muted-foreground text-center py-4">Nenhuma vacina registrada.</p>}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultas">
             <Card>
                <CardHeader><CardTitle>Histórico de Consultas</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {consultas.length > 0 ? consultas.map(c => (
                        <div key={c.id} className="p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center">
                            <span>{c.tipo}</span>
                            <span className="text-muted-foreground">{c.data_consulta ? format(new Date(c.data_consulta.replace(/-/g, '/')), 'dd/MM/yyyy') : ''}</span>
                        </div>
                    )) : <p className="text-muted-foreground text-center py-4">Nenhuma consulta registrada.</p>}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medicamentos">
            <Card>
                <CardHeader><CardTitle>Histórico de Medicamentos</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {medicamentos.length > 0 ? medicamentos.map(m => (
                        <div key={m.id} className="p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center">
                            <span>{m.nome} ({m.dosagem})</span>
                            <span className="text-muted-foreground">{m.data_inicio ? format(new Date(m.data_inicio.replace(/-/g, '/')), 'dd/MM/yyyy') : ''}</span>
                        </div>
                    )) : <p className="text-muted-foreground text-center py-4">Nenhum medicamento registrado.</p>}
                </CardContent>
            </Card>
          </TabsContent>
          
          {/* --- CONTEÚDO DAS NOVAS ABAS --- */}
          <TabsContent value="peso">
            <Card>
                <CardHeader><CardTitle>Histórico de Peso</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {registrosPeso.length > 0 ? registrosPeso.map(p => (
                        <div key={p.id} className="p-3 bg-muted/50 rounded-lg text-sm flex justify-between items-center">
                            <span className="font-bold">{p.peso} kg</span>
                            <span className="text-muted-foreground">{p.data_pesagem ? format(new Date(p.data_pesagem.replace(/-/g, '/')), 'dd/MM/yyyy') : ''}</span>
                        </div>
                    )) : <p className="text-muted-foreground text-center py-4">Nenhum registro de peso.</p>}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alimentacao">
            <Card>
                <CardHeader><CardTitle>Histórico de Alimentação</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                    {alimentacao.length > 0 ? alimentacao.map(a => (
                        <div key={a.id} className="p-3 bg-muted/50 rounded-lg text-sm">
                            <div className="flex justify-between items-center">
                                <span className="font-bold">{a.tipo_alimento}</span>
                                <span className="text-muted-foreground">{a.data_registro ? format(new Date(a.data_registro.replace(/-/g, '/')), 'dd/MM/yyyy') : ''}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{a.marca} - {a.quantidade}</p>
                        </div>
                    )) : <p className="text-muted-foreground text-center py-4">Nenhum registro de alimentação.</p>}
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="galeria">
            <Card>
                <CardHeader><CardTitle>Galeria de Fotos</CardTitle></CardHeader>
                <CardContent>
                    {galeria.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {galeria.map(f => (
                                <div key={f.id} className="aspect-square">
                                    <img src={f.url_imagem} alt={f.titulo || 'Foto do pet'} className="w-full h-full object-cover rounded-md"/>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-muted-foreground text-center py-4">Nenhuma foto na galeria.</p>}
                </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default PetProfile;