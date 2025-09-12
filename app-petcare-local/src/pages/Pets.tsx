import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, PawPrint, MoreVertical, Loader2, Upload } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Pet {
  id: string;
  nome: string;
  especie: string;
  raca: string | null;
  idade: number | null;
  peso: number | null;
  foto_url: string | null;
  sexo: string | null;
  cor: string | null;
  data_nascimento: string | null;
}

const Pets = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(searchParams.get('action') === 'add');
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuthContext();

  // ALTERAÇÃO 1: Definindo a lista de espécies com emojis
  const especies = [
    { value: 'cão', label: 'Cão', emoji: '🐶' },
    { value: 'gato', label: 'Gato', emoji: '🐱' },
    { value: 'pássaro', label: 'Pássaro', emoji: '🐦' },
    { value: 'peixe', label: 'Peixe', emoji: '🐠' },
    { value: 'roedor', label: 'Roedor', emoji: '🐹' },
    { value: 'réptil', label: 'Réptil', emoji: '🐢' },
    { value: 'bovino', label: 'Bovino', emoji: '🐄' },
    { value: 'lhama', label: 'Lhama', emoji: '🦙' },
    { value: 'cabra', label: 'Cabra', emoji: '🐐' },
    { value: 'outro', label: 'Outro', emoji: '🐾' }
  ];

  const [formData, setFormData] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: '',
    sexo: '',
    cor: '',
    data_nascimento: '',
    foto_url: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPets();
    }
  }, [user]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPets(data || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      toast.error('Erro ao carregar pets');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (file: File) => {
    if (!user) return;
    
    try {
      setUploadingPhoto(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Corrigido para o bucket 'pet-photos'
      const { error: uploadError } = await supabase.storage
        .from('pet-photos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('pet-photos')
        .getPublicUrl(fileName);
      
      setFormData(prev => ({ ...prev, foto_url: publicUrl }));
      toast.success('Foto carregada com sucesso!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      toast.error(`Erro ao carregar foto: ${error.message}`);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('pets')
        .insert({
          nome: formData.nome,
          especie: formData.especie,
          raca: formData.raca || null,
          idade: formData.idade ? parseInt(formData.idade) : null,
          peso: formData.peso ? parseFloat(formData.peso) : null,
          sexo: formData.sexo || null,
          cor: formData.cor || null,
          data_nascimento: formData.data_nascimento || null,
          foto_url: formData.foto_url || null,
          user_id: user.id
        });

      if (error) throw error;
      
      toast.success('Pet cadastrado com sucesso!');
      setShowAddForm(false);
      setFormData({
        nome: '',
        especie: '',
        raca: '',
        idade: '',
        peso: '',
        sexo: '',
        cor: '',
        data_nascimento: '',
        foto_url: ''
      });
      fetchPets();
    } catch (error: any) {
      console.error('Error adding pet:', error);
      toast.error(`Erro ao cadastrar pet: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPets = pets.filter(pet =>
    pet.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pet.especie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.raca && pet.raca.toLowerCase().includes(searchTerm.toLowerCase()))
  );

const PetCard = ({ pet }: { pet: Pet }) => {
  // Lógica para encontrar o emoji e o nome correto na nossa lista
  const especieInfo = especies.find(e => e.value.toLowerCase() === pet.especie.toLowerCase());

  // Se encontrar na lista, usa o emoji e o nome padronizado. Senão, só capitaliza o que veio do banco.
  const displayEspecie = especieInfo
    ? `${especieInfo.emoji} ${especieInfo.label}`
    : pet.especie.charAt(0).toUpperCase() + pet.especie.slice(1);

  return (
    <Link to={`/pets/${pet.id}`} className="block">
      <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            
            {pet.foto_url ? (
              <img 
                src={pet.foto_url} 
                alt={pet.nome} 
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {pet.nome.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                {pet.nome}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {/* AQUI ESTÁ A MUDANÇA */}
                  {displayEspecie}
                </Badge>
                {pet.raca && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{pet.raca}</span>
                  </>
                )}
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                {pet.idade != null && <span>{pet.idade} anos</span>}
                {pet.peso != null && <span>{pet.peso}kg</span>}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Meus Pets</h1>
            <p className="text-muted-foreground mt-1">Gerencie todos os seus companheiros</p>
          </div>
          <Button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-petcare-pink to-petcare-purple hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pet
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar pets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pets Grid */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <PawPrint className="w-5 h-5 text-petcare-blue" />
              <h2 className="text-xl font-semibold">Pets Cadastrados ({filteredPets.length})</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPets.map((pet) => (
                <PetCard key={pet.id} pet={pet} />
              ))}
            </div>

            {filteredPets.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <PawPrint className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                    Nenhum pet encontrado
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm 
                      ? "Tente uma busca diferente ou adicione um novo pet."
                      : "Adicione seu primeiro pet para começar!"
                    }
                  </p>
                  <Button 
                    onClick={() => setShowAddForm(true)}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Pet
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Add Pet Dialog */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Upload */}
              <div>
                <Label>Foto do Pet</Label>
                <div className="mt-2">
                  {formData.foto_url ? (
                    <div className="relative w-20 h-20 mx-auto">
                      <img 
                        src={formData.foto_url} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground p-0 text-xs"
                        onClick={() => setFormData(prev => ({ ...prev, foto_url: '' }))}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                      <Upload className="w-6 h-6 mx-auto text-muted-foreground/50 mb-1" />
                      <p className="text-xs text-muted-foreground mb-2">Adicionar foto</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePhotoUpload(file);
                        }}
                        disabled={uploadingPhoto}
                        className="text-xs h-8"
                      />
                      {uploadingPhoto && <p className="text-xs text-muted-foreground mt-1">Carregando...</p>}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                  required
                  className="h-9"
                />
              </div>
              
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* ALTERAÇÃO 2: Bloco do seletor de Espécie e Sexo */}
                  <div>
                    <Label htmlFor="especie">Espécie *</Label>
                    <Select
                      value={formData.especie}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, especie: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {especies.map((especie) => (
                          <SelectItem key={especie.value} value={especie.value}>
                            <div className="flex items-center space-x-2">
                              <span>{especie.emoji}</span>
                              <span>{especie.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select
                      value={formData.sexo}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value }))}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="macho">Macho</SelectItem>
                        <SelectItem value="femea">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              
              <div>
                <Label htmlFor="raca">Raça</Label>
                <Input
                  id="raca"
                  value={formData.raca}
                  onChange={(e) => setFormData(prev => ({...prev, raca: e.target.value}))}
                  placeholder="Ex: Golden Retriever"
                  className="h-9"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="idade">Idade (anos)</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData(prev => ({...prev, idade: e.target.value}))}
                    placeholder="Ex: 3"
                    className="h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    step="0.1"
                    value={formData.peso}
                    onChange={(e) => setFormData(prev => ({...prev, peso: e.target.value}))}
                    placeholder="Ex: 15.5"
                    className="h-9"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="cor">Cor</Label>
                  <Input
                    id="cor"
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({...prev, cor: e.target.value}))}
                    placeholder="Ex: Marrom, Branco..."
                    className="h-9"
                  />
                </div>
                
                <div>
                  <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData(prev => ({...prev, data_nascimento: e.target.value}))}
                    className="h-9"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 h-9"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 h-9"
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Pets;