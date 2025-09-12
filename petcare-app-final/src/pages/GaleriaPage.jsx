import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';

const GaleriaPage = () => {
  const { pets } = useData();
  const [form, setForm] = useState({
    petId: '',
    url: '',
    descricao: '',
  });
  const [fotos, setFotos] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.petId || !form.url) return;
    setFotos(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ petId: '', url: '', descricao: '' });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Galeria</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Foto</CardTitle>
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
            <div className="md:col-span-2">
              <Label htmlFor="url">URL da Foto</Label>
              <Input id="url" value={form.url} onChange={e => handleChange('url', e.target.value)} required placeholder="Cole o link da imagem" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} placeholder="Opcional" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-indigo-500 hover:bg-indigo-600 text-white">Adicionar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fotos dos Pets</CardTitle>
        </CardHeader>
        <CardContent>
          {fotos.length === 0 ? (
            <p className="text-gray-500">Nenhuma foto adicionada.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fotos.map(foto => {
                const pet = pets.find(p => p.id === foto.petId);
                return (
                  <div key={foto.id} className="border rounded-lg p-4 flex flex-col items-center">
                    <img src={foto.url} alt={foto.descricao || 'Foto do pet'} className="w-full h-48 object-cover rounded mb-2" />
                    <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                    {foto.descricao && <p><strong>Descrição:</strong> {foto.descricao}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GaleriaPage;
