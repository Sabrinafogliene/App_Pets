import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { Medicamento } from "@/entities/Medicamento";
import { Pill, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MedicamentoForm from "../components/medicamentos/MedicamentoForm";
import MedicamentoCard from "../components/medicamentos/MedicamentoCard";

export default function Medicamentos() {
  const [pets, setPets] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [selectedPet, setSelectedPet] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingMedicamento, setEditingMedicamento] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [petsData, medicamentosData] = await Promise.all([
      Pet.list('-created_date'),
      Medicamento.list('-data_inicio')
    ]);
    setPets(petsData);
    setMedicamentos(medicamentosData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (editingMedicamento) {
      await Medicamento.update(editingMedicamento.id, data);
    } else {
      await Medicamento.create(data);
    }
    setShowForm(false);
    setEditingMedicamento(null);
    loadData();
  };

  const handleEdit = (medicamento) => {
    setEditingMedicamento(medicamento);
    setShowForm(true);
  };

  const filteredMedicamentos = medicamentos.filter(m => 
    selectedPet === "all" || m.pet_id === selectedPet
  );

  const getPetName = (petId) => pets.find(p => p.id === petId)?.nome || "Pet não encontrado";

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              Medicamentos e Tratamentos
            </h1>
            <p className="text-gray-600 mt-2">Gerencie os medicamentos em uso</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Medicamento
          </Button>
        </div>

        {showForm && (
          <MedicamentoForm
            pets={pets}
            medicamento={editingMedicamento}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingMedicamento(null); }}
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
          <p>Carregando medicamentos...</p>
        ) : filteredMedicamentos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicamentos.map(m => (
              <MedicamentoCard 
                key={m.id} 
                medicamento={m} 
                petName={getPetName(m.pet_id)} 
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhum medicamento encontrado.</p>
        )}
      </div>
    </div>
  );
}