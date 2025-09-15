import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint, Plus, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { differenceInYears, differenceInMonths } from "date-fns";

const getSpeciesIcon = (especie) => {
  const icons = {
    cao: "🐕",
    gato: "🐱", 
    passaro: "🐦",
    coelho: "🐰",
    peixe: "🐠",
    reptil: "🦎"
  };
  return icons[especie] || "🐾";
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

export default function PetOverview({ pets, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-blue-500" />
            Meus Pets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center space-x-4 p-4 rounded-xl border">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5 text-blue-500" />
            Meus Pets ({pets.length})
          </CardTitle>
          <Link to={createPageUrl("Pets?action=add")}>
            <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pet
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {pets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum pet cadastrado</h3>
            <p className="text-gray-500 mb-6">Cadastre seu primeiro pet para começar!</p>
            <Link to={createPageUrl("Pets?action=add")}>
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Pet
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                to={createPageUrl(`Pets?id=${pet.id}`)}
                className="block transition-transform hover:scale-105"
              >
                <div className="p-4 rounded-xl border-2 border-gray-100 hover:border-pink-200 bg-gradient-to-r from-white to-pink-50 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {pet.url_foto ? (
                        <img
                          src={pet.url_foto}
                          alt={pet.nome}
                          className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-2xl border-4 border-white shadow-lg">
                          {getSpeciesIcon(pet.especie)}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                        <span className="text-sm">{getSpeciesIcon(pet.especie)}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{pet.nome}</h3>
                      <p className="text-sm text-gray-600">
                        {pet.raca || pet.especie}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {getAge(pet.data_nascimento)}
                        </Badge>
                        {pet.peso && (
                          <Badge variant="outline" className="text-xs">
                            {pet.peso}kg
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}