import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { Foto } from "@/entities/Foto";
import { Camera, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FotoForm from "../components/galeria/FotoForm";
import FotoCard from "../components/galeria/FotoCard";

export default function Galeria() {
  const [pets, setPets] = useState([]);
  const [fotos, setFotos] = useState([]);
  const [selectedPet, setSelectedPet] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingFoto, setEditingFoto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [petsData, fotosData] = await Promise.all([
      Pet.list('-created_date'),
      Foto.list('-data_foto')
    ]);
    setPets(petsData);
    setFotos(fotosData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (editingFoto) {
      await Foto.update(editingFoto.id, data);
    } else {
      await Foto.create(data);
    }
    setShowForm(false);
    setEditingFoto(null);
    loadData();
  };

  const handleEdit = (foto) => {
    setEditingFoto(foto);
    setShowForm(true);
  };

  const filteredFotos = fotos.filter(f => 
    selectedPet === "all" || f.pet_id === selectedPet
  );

  const getPet = (petId) => pets.find(p => p.id === petId);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Galeria de Fotos
            </h1>
            <p className="text-gray-600 mt-2">Relembre os melhores momentos</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Foto
          </Button>
        </div>

        {showForm && (
          <FotoForm
            pets={pets}
            foto={editingFoto}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingFoto(null); }}
          />
        )}

        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-4">
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Filtrar por pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Pets</SelectItem>
                {pets.map(pet => (
                  <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {isLoading ? (
          <p>Carregando fotos...</p>
        ) : filteredFotos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredFotos.map(f => (
              <FotoCard 
                key={f.id} 
                foto={f} 
                pet={getPet(f.pet_id)} 
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhuma foto encontrada.</p>
        )}
      </div>
    </div>
  );
}