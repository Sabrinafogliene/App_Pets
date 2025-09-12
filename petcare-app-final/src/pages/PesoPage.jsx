import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
const PesoPage = () => {

  const { pets } = useData();
  const [form, setForm] = useState({
    petId: '',
    peso: '',
    data: '',
  });
  const [pesos, setPesos] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.petId || !form.peso || !form.data) return;
    setPesos(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ petId: '', peso: '', data: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Peso</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registrar Peso</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="petId">Pet</Label>
                <select
                  id="petId"
                  value={form.petId}
                  onChange={e => handleChange('petId', e.target.value)}
                  className="w-full border rounded-md p-2 mt-1"
                  required
                >
                  <option value="">Selecione o pet</option>
                  {pets.map(pet => (
                    <option key={pet.id} value={pet.id}>{pet.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input id="peso" type="number" step="0.01" value={form.peso} onChange={e => handleChange('peso', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white">Registrar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Pesos</CardTitle>
          </CardHeader>
          <CardContent>
            {pesos.length === 0 ? (
              <p className="text-gray-500">Nenhum registro de peso.</p>
            ) : (
              <div className="space-y-4">
                {pesos.map(peso => {
                  const pet = pets.find(p => p.id === peso.petId);
                  return (
                    <div key={peso.id} className="border rounded-lg p-4">
                      <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                      <p><strong>Peso:</strong> {peso.peso} kg</p>
                      <p><strong>Data:</strong> {peso.data}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default PesoPage;
