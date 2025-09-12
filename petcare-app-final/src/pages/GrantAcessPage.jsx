import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, Search, ShieldCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';
import { useData } from '@/contexts/DataContext';
import { Checkbox } from '@/components/ui/checkbox';

const GrantAccessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pets, grantVetAccess } = useData();
  const [vetEmail, setVetEmail] = useState('');
  const [foundVet, setFoundVet] = useState(null);
  const [selectedPets, setSelectedPets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearchVet = async () => {
    if (!vetEmail) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, insira o e-mail do veterinário.' });
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, crmv')
      .eq('email', vetEmail)
      .eq('user_type', 'vet')
      .single();
    
    if (data) {
      setFoundVet(data);
      toast({ title: 'Veterinário encontrado!', description: `Dr(a). ${data.full_name} está na plataforma.` });
    } else {
      setFoundVet({ email: vetEmail, isNew: true });
      toast({ variant: 'default', title: 'Veterinário não encontrado', description: 'Você pode convidá-lo para a plataforma.' });
    }
    setIsLoading(false);
  };

  const handlePetSelection = (petId) => {
    setSelectedPets(prev => 
      prev.includes(petId) ? prev.filter(id => id !== petId) : [...prev, petId]
    );
  };

  const handleGrantAccess = async () => {
    if (selectedPets.length === 0) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Selecione pelo menos um pet.' });
      return;
    }
    setIsLoading(true);
    for (const petId of selectedPets) {
      await grantVetAccess(foundVet.id, petId);
    }
    setIsLoading(false);
    toast({ title: 'Acesso concedido!', description: `Acesso aos pets selecionados foi concedido para Dr(a). ${foundVet.full_name}.` });
    navigate('/tutor/dashboard');
  };

  const handleInviteVet = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
        email: vetEmail,
        options: {
            shouldCreateUser: true,
            emailRedirectTo: window.location.origin,
        },
    });

    setIsLoading(false);
    if (error) {
        toast({ variant: 'destructive', title: 'Erro ao enviar convite', description: error.message });
    } else {
        toast({ title: 'Convite enviado!', description: `Um convite foi enviado para ${vetEmail}.` });
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center space-x-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/tutor/dashboard')} className="hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Conceder Acesso ao Veterinário</h1>
            <p className="text-gray-500">Compartilhe as informações do seu pet com um profissional.</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center"><UserPlus className="w-5 h-5 mr-2 text-teal-500" />Buscar Veterinário</CardTitle>
            <CardDescription>Insira o e-mail do veterinário para buscar ou convidar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                type="email" 
                placeholder="email.do@veterinario.com" 
                value={vetEmail}
                onChange={(e) => setVetEmail(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleSearchVet} disabled={isLoading} className="bg-teal-500 hover:bg-teal-600 text-white">
                {isLoading ? 'Buscando...' : <><Search className="w-4 h-4 mr-2" /> Buscar</>}
              </Button>
            </div>
          </CardContent>
        </Card>

        {foundVet && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            {foundVet.isNew ? (
              <Card className="shadow-sm bg-yellow-50 border-yellow-200">
                <CardHeader>
                  <CardTitle className="flex items-center"><Mail className="w-5 h-5 mr-2 text-yellow-600" />Convidar Veterinário</CardTitle>
                  <CardDescription>O e-mail <span className="font-semibold">{vetEmail}</span> não está cadastrado. Envie um convite para que ele(a) possa acessar os dados.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleInviteVet} disabled={isLoading} className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white">
                    {isLoading ? 'Enviando...' : <><Send className="w-4 h-4 mr-2" /> Enviar Convite</>}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-green-600" />Veterinário Encontrado</CardTitle>
                  <CardDescription>Selecione os pets para compartilhar com <span className="font-semibold">{foundVet.full_name}</span> (CRMV: {foundVet.crmv || 'Não informado'}).</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-700">Meus Pets:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {pets.map(pet => (
                        <div key={pet.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                          <Checkbox 
                            id={`pet-${pet.id}`} 
                            onCheckedChange={() => handlePetSelection(pet.id)}
                            checked={selectedPets.includes(pet.id)}
                          />
                          <Label htmlFor={`pet-${pet.id}`} className="font-medium text-sm cursor-pointer">{pet.name}</Label>
                        </div>
                      ))}
                    </div>
                    <Button onClick={handleGrantAccess} disabled={isLoading || selectedPets.length === 0} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white">
                      {isLoading ? 'Concedendo...' : 'Conceder Acesso'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default GrantAccessPage;