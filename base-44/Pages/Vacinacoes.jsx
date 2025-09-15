import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { Vacinacao } from "@/entities/Vacinacao";
import { Syringe, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import VacinacaoForm from "../components/vacinacoes/VacinacaoForm";
import VacinacaoCard from "../components/vacinacoes/VacinacaoCard";

export default function Vacinacoes() {
  const [pets, setPets] = useState([]);
  const [vacinacoes, setVacinacoes] = useState([]);
  const [selectedPet, setSelectedPet] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingVacinacao, setEditingVacinacao] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(window.location.search);
  const actionParam = urlParams.get('action');

  useEffect(() => {
    loadData();
    if (actionParam === 'add') {
      setShowForm(true);
    }
  }, [actionParam]);

  const loadData = async () => {
    setIsLoading(true);
    const [petsData, vacinacoesData] = await Promise.all([
      Pet.list('-created_date'),
      Vacinacao.list('-data_aplicacao')
    ]);
    setPets(petsData);
    setVacinacoes(vacinacoesData);
    setIsLoading(false);
  };

  const handleSave = async (data) => {
    if (editingVacinacao) {
      await Vacinacao.update(editingVacinacao.id, data);
    } else {
      await Vacinacao.create(data);
    }
    setShowForm(false);
    setEditingVacinacao(null);
    loadData();
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleEdit = (vacinacao) => {
    setEditingVacinacao(vacinacao);
    setShowForm(true);
  };

  const filteredVacinacoes = vacinacoes.filter(vac => 
    selectedPet === "all" || vac.pet_id === selectedPet
  );

  const getPetName = (petId) => pets.find(p => p.id === petId)?.nome || "Pet não encontrado";
  
  const stats = filteredVacinacoes.reduce((acc, vac) => {
    acc[vac.status] = (acc[vac.status] || 0) + 1;
    return acc;
  }, { em_dia: 0, proximo_vencimento: 0, atrasada: 0 });

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Controle de Vacinas
            </h1>
            <p className="text-gray-600 mt-2">Mantenha as vacinas dos seus pets sempre em dia</p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Vacina
          </Button>
        </div>

        {showForm && (
          <VacinacaoForm
            pets={pets}
            vacinacao={editingVacinacao}
            onSave={handleSave}
            onCancel={() => {
              setShowForm(false);
              setEditingVacinacao(null);
              window.history.replaceState({}, document.title, window.location.pathname);
            }}
          />
        )}

        {/* Stats and Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="grid grid-cols-3 gap-4 text-center w-full md:w-auto">
                <div className="p-2 rounded-lg bg-green-100">
                    <p className="text-sm text-green-800">Em Dia</p>
                    <p className="text-2xl font-bold text-green-600">{stats.em_dia}</p>
                </div>
                <div className="p-2 rounded-lg bg-yellow-100">
                    <p className="text-sm text-yellow-800">Venc. Próximo</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.proximo_vencimento}</p>
                </div>
                <div className="p-2 rounded-lg bg-red-100">
                    <p className="text-sm text-red-800">Atrasadas</p>
                    <p className="text-2xl font-bold text-red-600">{stats.atrasada}</p>
                </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedPet} onValueChange={setSelectedPet}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por pet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pets</SelectItem>
                  {pets.map(pet => (
                    <SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <p>Carregando vacinas...</p>
        ) : filteredVacinacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVacinacoes.map(vac => (
              <VacinacaoCard 
                key={vac.id} 
                vacinacao={vac} 
                petName={getPetName(vac.pet_id)} 
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">Nenhuma vacina encontrada para o filtro selecionado.</p>
        )}
      </div>
    </div>
  );
}