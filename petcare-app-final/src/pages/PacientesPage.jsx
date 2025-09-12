import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const PacientesPage = () => {
  const [form, setForm] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: '',
  });
  const [pacientes, setPacientes] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nome || !form.especie || !form.raca || !form.idade || !form.peso) return;
    setPacientes(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ nome: '', especie: '', raca: '', idade: '', peso: '' });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Paciente</CardTitle>
        return (
          <DashboardLayout>
            <div className="p-8 max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">Pacientes</h1>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Adicionar Paciente</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input id="nome" value={form.nome} onChange={e => handleChange('nome', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="especie">Espécie</Label>
                      <Input id="especie" value={form.especie} onChange={e => handleChange('especie', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="raca">Raça</Label>
                      <Input id="raca" value={form.raca} onChange={e => handleChange('raca', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="idade">Idade</Label>
                      <Input id="idade" value={form.idade} onChange={e => handleChange('idade', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input id="peso" type="number" step="0.01" value={form.peso} onChange={e => handleChange('peso', e.target.value)} required />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-4">
                      <Button type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">Adicionar</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
              {/* ...restante do conteúdo... */}
            </div>
          </DashboardLayout>
          ) : (
            <div className="space-y-4">
              {pacientes.map(paciente => (
                <div key={paciente.id} className="border rounded-lg p-4">
                  <p><strong>Nome:</strong> {paciente.nome}</p>
                  <p><strong>Espécie:</strong> {paciente.especie}</p>
                  <p><strong>Raça:</strong> {paciente.raca}</p>
                  <p><strong>Idade:</strong> {paciente.idade}</p>
                  <p><strong>Peso:</strong> {paciente.peso} kg</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PacientesPage;
