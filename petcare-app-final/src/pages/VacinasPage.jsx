import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useData } from '@/contexts/DataContext';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const VacinasPage = () => {
  const { pets } = useData();
  const { user } = useAuth();
  const { toast } = useToast();

  const [form, setForm] = useState({
    petId: '',
    nome: '',
    data: '',
    proxima: '',
  });
  const [vacinas, setVacinas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Efeito para carregar as vacinas existentes do banco de dados
  useEffect(() => {
    const fetchVacinas = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('vaccines')
        .select('*')
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao carregar vacinas:', error.message);
      } else {
        setVacinas(data || []);
      }
      setLoading(false);
    };

    fetchVacinas();
  }, []);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.petId || !form.nome || !form.data || !user) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos e faça o login.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { petId, nome, data, proxima } = form;
      
      const { data: newVacina, error } = await supabase
        .from('vaccines')
        .insert({
          pet_id: petId,
          user_id: user.id,
          name: nome,
          date: data,
          next_dose: proxima || null
        })
        .select()
        .single();
      
      if (error) throw error;

      setVacinas(prev => [newVacina, ...prev]);
      setForm({ petId: '', nome: '', data: '', proxima: '' });
      toast({
        title: "Sucesso",
        description: "Vacina registrada com sucesso!"
      });

    } catch (error) {
      console.error("Erro ao registrar vacina:", error);
      toast({
        title: "Erro",
        description: `Não foi possível registrar a vacina: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      </DashboardLayout>
    );
  }

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
                  const pet = pets.find(p => p.id === vac.pet_id);
                  return (
                    <div key={vac.id} className="border rounded-lg p-4">
                      <p><strong>Pet:</strong> {pet ? pet.name : 'Desconhecido'}</p>
                      <p><strong>Vacina:</strong> {vac.name}</p>
                      <p><strong>Data:</strong> {vac.date}</p>
                      <p><strong>Próxima Dose:</strong> {vac.next_dose || '-'}</p>
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