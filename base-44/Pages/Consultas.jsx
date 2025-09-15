import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { Consulta } from "@/entities/Consulta";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConsultaForm from "../components/consultas/ConsultaForm";
import ConsultaCard from "../components/consultas/ConsultaCard";

export default function Consultas() {
  const [pets, setPets] = useState([]);
  const [consultas, setConsultas] = useState([]);
  const [selectedPet, setSelectedPet] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [petsData, consultasData] = await Promise.all([
      Pet.list('-created_date'),
      Consulta.list('-data')
    ]);
    setPets(petsData);
    setConsultas(consultasData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (editingConsulta) {
      await Consulta.update(editingConsulta.id, data);
    } else {
      await Consulta.create(data);
    }
    setShowForm(false);
    setEditingConsulta(null);
    loadData();
  };

  const handleEdit = (consulta) => {
    setEditingConsulta(consulta);
    setShowForm(true);
  };

  const filteredConsultas = consultas.filter(c => 
    selectedPet === "all" || c.pet_id === selectedPet
  );

  const getPetName = (petId) => pets.find(p => p.id === petId)?.nome || "Pet não encontrado";

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Histórico de Consultas
            </h1>
            <p className="text-gray-600 mt-2">Acompanhe todas as visitas ao veterinário</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Consulta
          </Button>
        </div>

        {showForm && (
          <ConsultaForm
            pets={pets}
            consulta={editingConsulta}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingConsulta(null); }}
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
          <p>Carregando consultas...</p>
        ) : filteredConsultas.length > 0 ? (
          <div className="space-y-6">
            {filteredConsultas.map(c => (
              <ConsultaCard 
                key={c.id} 
                consulta={c} 
                petName={getPetName(c.pet_id)} 
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhuma consulta encontrada.</p>
        )}
      </div>
    </div>
  );
}