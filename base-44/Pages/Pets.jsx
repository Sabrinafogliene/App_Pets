
import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { PawPrint, Plus, Search, Edit, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { differenceInYears, differenceInMonths } from "date-fns";

import PetCard from "../components/pets/PetCard";
import PetForm from "../components/pets/PetForm";

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

export default function Pets() {
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check URL params
  const urlParams = new URLSearchParams(window.location.search);
  const actionParam = urlParams.get('action');
  const petIdParam = urlParams.get('id');

  useEffect(() => {
    loadPets();
    if (actionParam === 'add') {
      setShowForm(true);
    }
  }, [actionParam]);

  const loadPets = async () => {
    setIsLoading(true);
    const data = await Pet.list('-created_date');
    setPets(data);
    setIsLoading(false);
  };

  const handleSavePet = async (petData) => {
    if (editingPet) {
      await Pet.update(editingPet.id, petData);
    } else {
      await Pet.create(petData);
    }
    setShowForm(false);
    setEditingPet(null);
    loadPets();
    
    // Clear URL params
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setShowForm(true);
  };

  const filteredPets = pets.filter(pet =>
    (pet.nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.raca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pet.especie || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Meus Pets
            </h1>
            <p className="text-gray-600 mt-2">Gerencie todos os seus companheiros</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Pet
          </Button>
        </div>

        {showForm && (
          <PetForm
            pet={editingPet}
            onSave={handleSavePet}
            onCancel={() => {
              setShowForm(false);
              setEditingPet(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
          />
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="w-5 h-5 text-blue-500" />
                Pets Cadastrados ({filteredPets.length})
              </CardTitle>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar pets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full md:w-80"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-200 rounded-2xl h-48"></div>
                  </div>
                ))}
              </div>
            ) : filteredPets.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🐾</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {searchTerm ? "Nenhum pet encontrado" : "Nenhum pet cadastrado"}
                </h3>
                <p className="text-gray-500 mb-8">
                  {searchTerm 
                    ? "Tente uma busca diferente" 
                    : "Cadastre seu primeiro pet para começar!"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Pet
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    onEdit={handleEditPet}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
