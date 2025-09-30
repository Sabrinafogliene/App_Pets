import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const DefinirSenha = () => {
  const { supabase, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error: authError } = await supabase.auth.updateUser({ password: password });
    if (authError) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Erro ao definir senha',
        description: authError.message,
      });
    }

    const {error: profileError} = await supabase
        .from('profiles')
        .update({ is_setup_complete: true})
        .eq('id', user.id);

    setLoading(false);

    if (profileError) {
        console.error("Erro ao marcar setup como completo:", profileError.message);
        toast({
          variant: 'destructive',
          title: 'Erro ao definir senha',
          description: 'Senha definida, mas houve erro ao finalizar setup. Tente fazer login.',
        });
    } 
    toast({
      title: 'Senha definida com sucesso!',
      description: 'Você será redirecionado para o painel.',
      className: 'bg-green-500 text-white',
    });
      
    navigate('/vet/painel'); 
    
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Defina sua Senha</h1>
        <p className="text-sm text-center text-gray-600">
          Crie uma senha para acessar sua conta de veterinário.
        </p>
        <form onSubmit={handleSetPassword} className="space-y-6">
          <div>
            <Label htmlFor="password">Nova Senha</Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Senha e Acessar'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default DefinirSenha;
