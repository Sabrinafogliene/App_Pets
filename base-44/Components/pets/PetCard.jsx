import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Heart, Scale, Calendar } from "lucide-react";
import { differenceInYears, differenceInMonths } from "date-fns";

const getSpeciesInfo = (especie) => {
  const speciesData = {
    cao: { icon: "🐕", nome: "Cão", color: "bg-amber-100 text-amber-800" },
    gato: { icon: "🐱", nome: "Gato", color: "bg-purple-100 text-purple-800" },
    passaro: { icon: "🐦", nome: "Ave", color: "bg-blue-100 text-blue-800" },
    coelho: { icon: "🐰", nome: "Coelho", color: "bg-pink-100 text-pink-800" },
    peixe: { icon: "🐠", nome: "Peixe", color: "bg-cyan-100 text-cyan-800" },
    reptil: { icon: "🦎", nome: "Réptil", color: "bg-green-100 text-green-800" },
    outro: { icon: "🐾", nome: "Outro", color: "bg-gray-100 text-gray-800" }
  };
  return speciesData[especie] || speciesData.outro;
};

const getAge = (dataNascimento) => {
  if (!dataNascimento) return "Idade não informada";
  
  const years = differenceInYears(new Date(), new Date(dataNascimento));
  const months = differenceInMonths(new Date(), new Date(dataNascimento)) % 12;
  
  if (years === 0) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  } else if (months === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years}a ${months}m`;
};

export default function PetCard({ pet, onEdit }) {
  const speciesInfo = getSpeciesInfo(pet.especie);

  return (
    <Card className="group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white via-white to-pink-50 border-white/50 overflow-hidden">
      <div className="relative">
        {/* Pet Photo or Avatar */}
        <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100">
          {pet.url_foto ? (
            <img
              src={pet.url_foto}
              alt={pet.nome}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200">
              <div className="text-8xl opacity-80">{speciesInfo.icon}</div>
            </div>
          )}
          
          {/* Overlay with edit button */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              size="sm"
              onClick={() => onEdit(pet)}
              className="bg-white/90 text-gray-800 hover:bg-white shadow-lg backdrop-blur-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Species badge */}
          <div className="absolute top-4 right-4">
            <Badge className={`${speciesInfo.color} shadow-lg backdrop-blur-sm`}>
              {speciesInfo.icon} {speciesInfo.nome}
            </Badge>
          </div>

          {/* Gender indicator */}
          <div className="absolute top-4 left-4">
            <div className={`w-3 h-3 rounded-full shadow-lg ${
              pet.sexo === 'macho' ? 'bg-blue-500' : 'bg-pink-500'
            }`} />
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Pet Name */}
          <div className="text-center">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              {pet.nome}
            </h3>
            {pet.raca && (
              <p className="text-gray-600 font-medium">{pet.raca}</p>
            )}
          </div>

          {/* Pet Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Calendar className="w-4 h-4" />
              </div>
              <p className="text-sm font-medium text-gray-700">{getAge(pet.data_nascimento)}</p>
            </div>
            
            {pet.peso && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Scale className="w-4 h-4" />
                </div>
                <p className="text-sm font-medium text-gray-700">{pet.peso} kg</p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-center gap-2 pt-2">
            {pet.castrado && (
              <Badge variant="secondary" className="text-xs">
                Castrado
              </Badge>
            )}
            {pet.microchip && (
              <Badge variant="outline" className="text-xs">
                Microchip
              </Badge>
            )}
          </div>

          {/* Medical History Preview */}
          {pet.historico_medico && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-600 line-clamp-2">
                {pet.historico_medico}
              </p>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}