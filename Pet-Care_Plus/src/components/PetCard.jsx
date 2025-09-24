import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit, CalendarDays, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Link } from 'react-router-dom';
import { differenceInYears, differenceInMonths } from "date-fns";

const getSpeciesInfo = (especie) => {
  const speciesData = {
    cachorro: { icon: "🐕", nome: "Cachorro", color: "bg-amber-100 text-amber-800" },
    gato: { icon: "🐈", nome: "Gato", color: "bg-purple-100 text-purple-800" },
    passaro: { icon: "🦜", nome: "Pássaro", color: "bg-blue-100 text-blue-800" },
    coelho: { icon: "🐇", nome: "Coelho", color: "bg-pink-100 text-pink-800" },
    peixe: { icon: "🐟", nome: "Peixe", color: "bg-cyan-100 text-cyan-800" },
    cavalo: { icon: "🐎", nome: "Cavalo", color: "bg-pink-200 text-pink-800" },
    lhama: { icon: "🦙", nome: "Lhama", color: "bg-blue-200 text-blue-800" },
    cabra: { icon: "🐐", nome: "Cabra", color: "bg-amber-200 text-amber-800" },
    bovino: { icon: "🐄", nome: "Bovino", color: "bg-cyan-200 text-cyan-800" },
    porco: { icon: "🐖", nome: "Porco", color: "bg-pink-200 text-pink-800" },
    reptil: { icon: "🐢", nome: "Réptil", color: "bg-green-100 text-green-800" },
    roedor: { icon: "🐀", nome: "Roedor", color: "bg-purple-200 text-purple-800" },
    outro: { icon: "🐾", nome: "Outro", color: "bg-gray-100 text-gray-800" }
  };
  return speciesData[especie] || speciesData.outro;
};

const calculateAge = (birthday) => {
  if (!birthday) return "--";
  const birthDate = new Date(birthday);
  const now = new Date();
  const years = differenceInYears(now, birthDate);
  const months = differenceInMonths(now, birthDate) % 12;

  let ageString = "";
  if (years > 0) { ageString += `${years}a`;}
  if (months > 0) {
    if (ageString !== "") ageString += " ";
      ageString += `${months}m`;
  }
  if (ageString === "") return "N/A";
  return ageString;
};
const PetCard = ({ pet, delay = 0, onEditClick }) => {
  const { user, supabase } = useAuth();
  const [imageUrl, setImageUrl] = useState(null);
  
  if (!pet || !pet.id) return null;
  
  const profileLink = user?.user_metadata?.user_type === 'vet' ? `/vet/paciente/${pet.id}` : `/app/meu-pet/${pet.id}`;
  const speciesInfo = getSpeciesInfo(pet.species.toLowerCase());
  
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!pet.file_path) return;
      const { data, error } = await supabase.storage.from('gallery').createSignedUrl(pet.file_path, 3600);
      if (error) {
        console.error('Error creating signed URL for PetCard:', error.message, 'path:', pet.file_path);
      } else if (data) {
        setImageUrl(data.signedUrl);
      }
    };
    getSignedUrl();
  }, [pet.file_path, supabase]);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEditClick) onEditClick(pet);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl overflow-hidden card-shadow hover:card-shadow-hover pet-card cursor-pointer relative"
    >

      <Link to={profileLink} className="block">
        <div className="relative">
          <img
            src={imageUrl || 'https://placehold.co/600x400/fecaca/fecaca?text=...'}
            alt={pet.name}
            className="w-full h-48 object-cover"
          />
          {pet.species && (
            <div
              className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${speciesInfo.color}`}
            >
              <span>{speciesInfo.icon}</span>
              <span>{speciesInfo.nome}</span>
            </div>
          )}
          
          {user?.user_metadata?.user_type !== 'vet' && (
            <div className="absolute right-3 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          <div className="flex flex-col items-center space-y-0.5">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{pet.name}</h3>
            <p className="text-gray-500 font-light text-xs">{pet.breed}</p>
          </div>

          <div className="flex justify-center text-gray-500 text-sm mt-4 w-full space-x-14">
            <div className="flex flex-col items-center">
              <CalendarDays className="w-4 h-4 mb-1 text-gray-500" />
              <span>{calculateAge(pet.birthday)}</span>
          </div>
          <div className="flex flex-col items-center">
            <Scale className="w-4 h-4 mb-1 text-gray-500" />
            <span>{pet.weight ? `${pet.weight} kg` : '--'}</span>
          </div>
        </div>
        <div className="flex justify-center flex-wrap gap-2 mt-4">
          {pet.castrated && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              Castrado
            </span>
          )}
          {pet.registro && (
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
              Registro
            </span>
          )}
        </div>
      </div>
    </Link>
  </motion.div>

  );
};

export default PetCard;