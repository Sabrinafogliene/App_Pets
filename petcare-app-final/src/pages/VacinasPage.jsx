import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/DashboardLayout';

const VacinasPage = () => {
  const { pets } = useData();
  const [form, setForm] = useState({
    petId: '',
    nome: '',
    data: '',
    proxima: '',
  });
  const [vacinas, setVacinas] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.petId || !form.nome || !form.data) return;
    setVacinas(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ petId: '', nome: '', data: '', proxima: '' });
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Vacinas</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registrar Vacina</CardTitle>
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
                <Label htmlFor="nome">Nome da Vacina</Label>
                <Input id="nome" value={form.nome} onChange={e => handleChange('nome', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="data">Data</Label>
                <Input id="data" type="date" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="proxima">Próxima Dose</Label>
                <Input id="proxima" type="date" value={form.proxima} onChange={e => handleChange('proxima', e.target.value)} />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">Adicionar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Vacinas</CardTitle>
          </CardHeader>
          <CardContent>
            {vacinas.length === 0 ? (
              <p className="text-gray-500">Nenhum registro de vacina.</p>
            ) : (
              <div className="space-y-4">
                {vacinas.map(vac => {
                  const pet = pets.find(p => p.id === vac.petId);
                  return (
                    <div key={vac.id} className="border rounded-lg p-4">
                      <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                      <p><strong>Vacina:</strong> {vac.nome}</p>
                      <p><strong>Data:</strong> {vac.data}</p>
                      <p><strong>Próxima Dose:</strong> {vac.proxima || '-'}</p>
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

export default VacinasPage;
