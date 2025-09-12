// VERSÃO DEFINITIVA - Galeria.tsx (com Upload + Correção da Barra de Rolagem)
// Copie todo este código e cole no seu arquivo Galeria.tsx

import { useState, ChangeEvent } from "react";
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
import { Plus, Camera, Calendar, Image as ImageIcon, Edit, Upload, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const Galeria = () => {
  const [selectedPet, setSelectedPet] = useState("todos");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFoto, setEditingFoto] = useState<any>(null);
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

  const { data: fotos = [] } = useQuery({
    queryKey: ['galeria', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('galeria')
        .select('*, pets(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addFotoMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase.from('galeria').insert({
        ...data,
        user_id: user?.id
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galeria'] });
      setIsAddDialogOpen(false);
      toast.success('Foto adicionada com sucesso!');
    },
    onError: (error: any) => {
      toast.error(`Erro ao adicionar foto: ${error.message}`);
    }
  });

  const updateFotoMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const { error } = await supabase
        .from('galeria')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['galeria'] });
      setEditingFoto(null);
      toast.success('Foto atualizada com sucesso!');
    },
    onError: (error: any) => {
        toast.error(`Erro ao atualizar foto: ${error.message}`);
    }
  });

  const filteredFotos = fotos.filter(foto => {
    return selectedPet === "todos" || foto.pet_id === selectedPet;
  });

  const FotoCard = ({ foto }: { foto: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden">
      <div className="aspect-square bg-gradient-to-br from-petcare-green/10 to-petcare-blue/10 flex items-center justify-center relative">
        {foto.url_imagem ? (
          <img
            src={foto.url_imagem}
            alt={foto.titulo || 'Foto do pet'}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
        )}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white/90"
          onClick={() => setEditingFoto(foto)}
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-medium text-card-foreground line-clamp-1">
            {foto.titulo || 'Sem título'}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Pet: {foto.pets?.nome || 'N/A'}</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{format(new Date(foto.data_foto || foto.created_at), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Galeria de Fotos</h1>
            <p className="text-muted-foreground mt-1">Relembre os melhores momentos</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-petcare-green to-green-400 hover:opacity-90 transition-opacity">
                <Plus className="w-4 h-4 mr-2" />
                Nova Foto
              </Button>
            </DialogTrigger>
            {/* CORREÇÃO DA BARRA DE ROLAGEM APLICADA AQUI */}
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Foto</DialogTitle>
              </DialogHeader>
              <FotoForm pets={pets} onSubmit={addFotoMutation.mutate} user={user} />
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Select value={selectedPet} onValueChange={setSelectedPet}>
                <SelectTrigger className="w-48">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFotos.map((foto) => (
            <FotoCard key={foto.id} foto={foto} />
          ))}
        </div>

        {filteredFotos.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Nenhuma foto encontrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Adicione a primeira foto para começar sua galeria!
              </p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Foto
              </Button>
            </CardContent>
          </Card>
        )}

        {editingFoto && (
          <Dialog open={!!editingFoto} onOpenChange={() => setEditingFoto(null)}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Foto</DialogTitle>
              </DialogHeader>
              <FotoForm
                pets={pets}
                initialData={editingFoto}
                onSubmit={(data) => {
                    updateFotoMutation.mutate({ id: editingFoto.id, ...data });
                }}
                user={user}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

// Encontre o componente FotoForm no final do seu arquivo Galeria.tsx e substitua por este.

const FotoForm = ({ pets, initialData, onSubmit, user }: { pets: any[], initialData?: any, onSubmit: (data: any) => void, user: any }) => {
  const [formData, setFormData] = useState({
    titulo: initialData?.titulo || '',
    pet_id: initialData?.pet_id || 'none',
    url_imagem: initialData?.url_imagem || '',
    descricao: initialData?.descricao || '',
    data_foto: initialData?.data_foto?.split('T')[0] || new Date().toISOString().split('T')[0]
  });
  
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.url_imagem || null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, url_imagem: '' }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (initialData) {
      const submitData = {
        ...formData,
        pet_id: formData.pet_id === 'none' ? null : formData.pet_id
      };
      onSubmit(submitData);
      return;
    }

    if (!selectedFile) {
        toast.error("Por favor, selecione uma imagem para enviar.");
        return;
    }

    try {
        setUploading(true);
        
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${user.id}/gallery/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('pet-photos')
            .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('pet-photos')
            .getPublicUrl(fileName);
            
        const finalData = { 
          ...formData, 
          url_imagem: publicUrl,
          pet_id: formData.pet_id === 'none' ? null : formData.pet_id
        };
        onSubmit(finalData);

    } catch (error: any) {
        toast.error(`Erro no upload: ${error.message}`);
    } finally {
        setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      <div>
        <Label>Imagem</Label>
        <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
            {previewUrl ? (
                <div className="relative w-full aspect-video">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-md" />
                </div>
            ) : (
                <div className="flex flex-col items-center">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">Arraste uma foto ou clique para selecionar</p>
                </div>
            )}
             <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="mt-2"
                disabled={uploading || !!initialData}
            />
            {initialData && <p className="text-xs text-muted-foreground mt-2">A alteração da imagem não é permitida na edição.</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input
          id="titulo"
          value={formData.titulo}
          onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
          placeholder="Digite um título para a foto"
        />
      </div>
      
      <div>
        <Label htmlFor="pet_id">Pet</Label>
        <Select value={formData.pet_id} onValueChange={(value) => setFormData(prev => ({ ...prev, pet_id: value || null }))}>
          <SelectTrigger>
            <SelectValue placeholder="Associar a um pet (opcional)" />
          </SelectTrigger>
          <SelectContent>
            {/* CORREÇÃO: A linha com value="" foi removida daqui */}
            {pets.map((pet) => (
              <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="data_foto">Data da Foto</Label>
        <Input
          id="data_foto"
          type="date"
          value={formData.data_foto}
          onChange={(e) => setFormData(prev => ({ ...prev, data_foto: e.target.value }))}
        />
      </div>
      
      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          value={formData.descricao}
          onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
          placeholder="Descreva a foto..."
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={uploading}>
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (initialData ? 'Atualizar' : 'Adicionar')} Foto
      </Button>
    </form>
  );
};

export default Galeria;