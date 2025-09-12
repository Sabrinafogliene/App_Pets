import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/DashboardLayout';

const AlimentacaoPage = () => {
  const { pets } = useData();
  const [form, setForm] = useState({
    petId: '',
    marca: '',
    tipo: '',
    quantidade: '',
    horarios: '',
  });
  const [alimentacoes, setAlimentacoes] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Alimentação</h1>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Registrar Alimentação</CardTitle>
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
                <Label htmlFor="marca">Marca</Label>
                <Input id="marca" value={form.marca} onChange={e => handleChange('marca', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Input id="tipo" value={form.tipo} onChange={e => handleChange('tipo', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="quantidade">Quantidade</Label>
                <Input id="quantidade" value={form.quantidade} onChange={e => handleChange('quantidade', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="horarios">Horários</Label>
                <Input id="horarios" value={form.horarios} onChange={e => handleChange('horarios', e.target.value)} required />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">Registrar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Alimentação</CardTitle>
          </CardHeader>
          <CardContent>
            {alimentacoes.length === 0 ? (
              <p className="text-gray-500">Nenhum registro de alimentação.</p>
            ) : (
              <div className="space-y-4">

                {alimentacoes.map(alim => {
                  const pet = pets.find(p => p.id === alim.petId);
                  return (
                    <div key={alim.id} className="border rounded-lg p-4">
                      <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                      <p><strong>Marca:</strong> {alim.marca}</p>
                      <p><strong>Tipo:</strong> {alim.tipo}</p>
                      <p><strong>Quantidade:</strong> {alim.quantidade}</p>
                      <p><strong>Horários:</strong> {alim.horarios}</p>
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

export default AlimentacaoPage;
