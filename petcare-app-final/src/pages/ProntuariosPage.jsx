import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const ProntuariosPage = () => {
  const [form, setForm] = useState({
    paciente: '',
    descricao: '',
    data: '',
  });
  const [prontuarios, setProntuarios] = useState([]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.paciente || !form.descricao || !form.data) return;
    setProntuarios(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ paciente: '', descricao: '', data: '' });
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Prontuários</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Adicionar Prontuário</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="paciente">Paciente</Label>
              <Input id="paciente" value={form.paciente} onChange={e => handleChange('paciente', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Input id="descricao" value={form.descricao} onChange={e => handleChange('descricao', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="data">Data</Label>
              <Input id="data" type="date" value={form.data} onChange={e => handleChange('data', e.target.value)} required />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <Button type="submit" className="bg-purple-500 hover:bg-purple-600 text-white">Adicionar</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prontuários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {prontuarios.length === 0 ? (
            <p className="text-gray-500">Nenhum prontuário cadastrado.</p>
          ) : (
            <div className="space-y-4">
              {prontuarios.map(prontuario => (
                <div key={prontuario.id} className="border rounded-lg p-4">
                  <p><strong>Paciente:</strong> {prontuario.paciente}</p>
                  <p><strong>Descrição:</strong> {prontuario.descricao}</p>
                  <p><strong>Data:</strong> {prontuario.data}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProntuariosPage;
