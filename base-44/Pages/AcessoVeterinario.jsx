import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { AcessoVeterinario } from "@/entities/AcessoVeterinario";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AcessoForm from "../components/acesso/AcessoForm";
import AcessoCard from "../components/acesso/AcessoCard";

export default function AcessoVeterinarioPage() {
  const [pets, setPets] = useState([]);
  const [acessos, setAcessos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAcesso, setEditingAcesso] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [petsData, acessosData] = await Promise.all([
      Pet.list('-created_date'),
      AcessoVeterinario.list('-created_date')
    ]);
    setPets(petsData);
    setAcessos(acessosData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (editingAcesso) {
      await AcessoVeterinario.update(editingAcesso.id, data);
    } else {
      await AcessoVeterinario.create(data);
    }
    setShowForm(false);
    setEditingAcesso(null);
    loadData();
  };

  const handleEdit = (acesso) => {
    setEditingAcesso(acesso);
    setShowForm(true);
  };
  
  const handleToggle = async (acesso) => {
    await AcessoVeterinario.update(acesso.id, { ativo: !acesso.ativo });
    loadData();
  };
  
  const getPet = (petId) => pets.find(p => p.id === petId);

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-sky-600 bg-clip-text text-transparent">
              Acesso de Veterinários
            </h1>
            <p className="text-gray-600 mt-2">Compartilhe o histórico do seu pet com profissionais</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Conceder Acesso
          </Button>
        </div>

        {showForm && (
          <AcessoForm
            pets={pets}
            acesso={editingAcesso}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingAcesso(null); }}
          />
        )}
        
        {isLoading ? (
          <p>Carregando acessos...</p>
        ) : acessos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {acessos.map(a => (
              <AcessoCard 
                key={a.id} 
                acesso={a} 
                pet={getPet(a.pet_id)} 
                onEdit={handleEdit}
                onToggleAccess={() => handleToggle(a)}
              />
            ))}
          </div>
        ) : (
          <Card><CardContent className="p-10 text-center text-gray-500">Nenhum acesso concedido ainda.</CardContent></Card>
        )}
      </div>
    </div>
  );
}