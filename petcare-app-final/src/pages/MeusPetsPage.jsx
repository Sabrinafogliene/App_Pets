import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';


const MeusPetsPage = () => {
  const { pets, addPet } = useData();
  const [form, setForm] = useState({
    nome: '',
    especie: '',
    raca: '',
    idade: '',
    peso: '',
  });
  const [showForm, setShowForm] = useState(false);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome || !form.especie || !form.raca || !form.idade || !form.peso) return;
    await addPet({
      name: form.nome,
      species: form.especie,
      breed: form.raca,
      age: form.idade,
      weight: form.peso
    });
    setForm({ nome: '', especie: '', raca: '', idade: '', peso: '' });
    setShowForm(false);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Meus Pets Cadastrados</CardTitle>
            <Button onClick={() => setShowForm(true)} className="bg-purple-500 hover:bg-purple-600 text-white">Adicionar Pet</Button>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <p className="text-gray-500">Nenhum pet cadastrado.</p>
            ) : (
              <div className="space-y-4">
                {pets.map(pet => (
                  <div key={pet.id} className="border rounded-lg p-4">
                    <p><strong>Nome:</strong> {pet.name}</p>
                    <p><strong>Espécie:</strong> {pet.species}</p>
                    <p><strong>Raça:</strong> {pet.breed}</p>
                    <p><strong>Idade:</strong> {pet.age}</p>
                    <p><strong>Peso:</strong> {pet.weight} kg</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showForm && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Adicionar Pet</CardTitle>
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
                <div className="md:col-span-2 flex justify-end mt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">Adicionar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

export default MeusPetsPage;
