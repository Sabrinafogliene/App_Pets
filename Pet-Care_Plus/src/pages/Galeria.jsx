import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Camera, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewPhotoDialog from '@/components/NewPhotoDialog';
import EditPhotoDialog from '@/components/EditPhotoDialog';

const PhotoCard = ({ photo, index, onEdit }) => {
  const { supabase } = useAuth();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const getSignedUrl = async () => {
      if (!photo.file_path) return;
      const { data, error } = await supabase.storage.from('gallery').createSignedUrl(photo.file_path, 3600);
      if (error) {
        console.error('Error creating signed URL for PhotoCard:', error.message, 'path:', photo.file_path);
      } else if (data) {
        setImageUrl(data.signedUrl);
      }
    };
    getSignedUrl();
  }, [photo.file_path, supabase]);

  return (
    <motion.div
      key={photo.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="bg-white rounded-xl overflow-hidden card-shadow hover:card-shadow-hover pet-card"
    >
      <div className="relative aspect-square">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={photo.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(photo)}
          className="absolute top-2 right-2 text-white bg-black/30 hover:bg-black/50 p-1 h-auto rounded-full"
        >
          <Edit className="w-4 h-4" />
        </Button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 truncate">{photo.title}</h3>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <span>Pet: {photo.pet}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Camera className="w-4 h-4" />
            <span>{photo.date}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Galeria = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [selectedPet, setSelectedPet] = useState('todos');
  const [photos, setPhotos] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNewPhotoOpen, setIsNewPhotoOpen] = useState(false);
  const [isEditPhotoOpen, setIsEditPhotoOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name')
      .eq('user_id', user.id);

    if (petsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pets.' });
    } else {
      setMyPets(petsData || []);
    }

    let query = supabase.from('gallery').select('*, pets(name)').eq('user_id', user.id);
    if (selectedPet !== 'todos') {
      query = query.eq('pet_id', selectedPet);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao buscar fotos.' });
      setPhotos([]);
    } else {
      setPhotos(data.map(p => ({
        ...p,
        pet: p.pets?.name || 'Desconhecido',
        date: new Date(p.created_at).toLocaleDateString('pt-BR'),
        title: p.description || 'Sem título',
        category: 'Diversão'
      })) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [supabase, user, toast, selectedPet]);

  const handleEdit = (photo) => {
    setCurrentPhoto(photo);
    setIsEditPhotoOpen(true);
  };

  return (
    <>
      <NewPhotoDialog
        open={isNewPhotoOpen}
        onOpenChange={setIsNewPhotoOpen}
        onPhotoAdded={fetchData}
        pets={myPets}
        className="galeria-theme"
      />
      <EditPhotoDialog
        open={isEditPhotoOpen}
        onOpenChange={setIsEditPhotoOpen}
        onPhotoUpdated={fetchData}
        photo={currentPhoto}
        className="galeria-theme"
      />
      <div className="space-y-6 galeria-theme">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-teal-600 mb-2">Galeria de Fotos</h1>
          <p className="text-gray-600">Relembre os melhores momentos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div></div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os Pets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Pets</SelectItem>
                {myPets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsNewPhotoOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Nova Foto
            </Button>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">Carregando galeria...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {photos.map((photo, index) => (
              <PhotoCard key={photo.id} photo={photo} index={index} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Galeria;