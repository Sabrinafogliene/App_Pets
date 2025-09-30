// src/pages/DefinirSenha.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const DefinirSenha = () => {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password: password });

    setLoading(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao definir senha',
        description: error.message,
      });
    } else {
      toast({
        title: 'Senha definida com sucesso!',
        description: 'Você será redirecionado para o painel.',
        className: 'bg-green-500 text-white',
      });
      // Redireciona para o painel do veterinário após definir a senha
      navigate('/vet/painel'); 
    }
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
