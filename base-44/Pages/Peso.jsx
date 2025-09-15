import React, { useState, useEffect } from "react";
import { Pet } from "@/entities/Pet";
import { RegistroPeso } from "@/entities/RegistroPeso";
import { Scale, Plus, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Peso() {
  const [pets, setPets] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [newWeight, setNewWeight] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadPets();
  }, []);

  useEffect(() => {
    if (selectedPet) {
      loadRegistros(selectedPet);
    } else {
      setRegistros([]);
    }
  }, [selectedPet]);

  const loadPets = async () => {
    setIsLoading(true);
    const petsData = await Pet.list('-created_date');
    setPets(petsData);
    if (petsData.length > 0) {
      setSelectedPet(petsData[0].id);
    }
    setIsLoading(false);
  };

  const loadRegistros = async (petId) => {
    const registrosData = await RegistroPeso.filter({ pet_id: petId }, 'data');
    setRegistros(registrosData);
  };
  
  const handleAddWeight = async (e) => {
    e.preventDefault();
    if (!newWeight || !selectedPet) return;
    await RegistroPeso.create({
      pet_id: selectedPet,
      peso: parseFloat(newWeight),
      data: newDate,
    });
    setNewWeight("");
    loadRegistros(selectedPet);
  };

  const chartData = registros.map(r => ({
    data: format(new Date(r.data), 'dd/MM/yy'),
    peso: r.peso,
  }));

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Controle de Peso
            </h1>
            <p className="text-gray-600 mt-2">Acompanhe a evolução do peso do seu pet</p>
          </div>
          <div className="w-full md:w-64">
            <Select value={selectedPet} onValueChange={setSelectedPet}>
              <SelectTrigger><SelectValue placeholder="Selecione um pet" /></SelectTrigger>
              <SelectContent>{pets.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><LineChart/> Gráfico de Evolução</CardTitle></CardHeader>
              <CardContent>
                {registros.length > 1 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="data" />
                    <YAxis domain={['dataMin - 1', 'dataMax + 1']} unit="kg" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="peso" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
                ) : <p className="text-center text-gray-500 py-10">Adicione pelo menos dois registros de peso para ver o gráfico.</p>}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="shadow-xl">
              <CardHeader><CardTitle className="flex items-center gap-2"><Plus/> Adicionar Novo Registro</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleAddWeight} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input id="peso" type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} required disabled={!selectedPet} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="data-peso">Data</Label>
                    <Input id="data-peso" type="date" value={newDate} onChange={e => setNewDate(e.target.value)} required disabled={!selectedPet} />
                  </div>
                  <Button type="submit" disabled={!selectedPet || !newWeight} className="w-full bg-gradient-to-r from-indigo-500 to-blue-500"><Scale className="w-4 h-4 mr-2"/> Salvar Peso</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}