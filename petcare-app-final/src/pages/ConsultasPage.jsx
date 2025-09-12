import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/DashboardLayout';

const ConsultasPage = () => {
  const { pets } = useData();
  const [form, setForm] = useState({
    petId: '',
    tipo: '',
    data: '',
    local: '',
  });
  const [consultas, setConsultas] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.petId || !form.tipo || !form.data || !form.local) return;
    setConsultas(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ petId: '', tipo: '', data: '', local: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Consultas</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Agendar Consulta</CardTitle>
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
                <Label htmlFor="tipo">Tipo</Label>
                <Input id="tipo" value={form.tipo} onChange={e => handleChange('tipo', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">Agendar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Consultas Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            {consultas.length === 0 ? (
              <p className="text-gray-500">Nenhuma consulta agendada.</p>
            ) : (
              <div className="space-y-4">
                {consultas.map(con => {
                  const pet = pets.find(p => p.id === con.petId);
                  return (
                    <div key={con.id} className="border rounded-lg p-4">
                      <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                      <p><strong>Tipo:</strong> {con.tipo}</p>
                      <p><strong>Data:</strong> {con.data}</p>
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
};

export default ConsultasPage;
