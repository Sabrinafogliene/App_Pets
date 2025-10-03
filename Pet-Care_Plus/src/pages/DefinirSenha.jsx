import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/supabaseClient';
import { motion } from 'framer-motion';

const DefinirSenha = () => {
  const { supabase: supabaseContext } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    let authUser = null;
    let updateError = null;

    const { data: {user }, error: apiError } = await supabaseContext.auth.updateUser({ password: password });
    
    authUser = user;
    updateError = apiError;
    
    if (updateError || !authUser) {
      setLoading(false);
      toast({
        variant: 'destructive',
        title: 'Erro ao definir senha',
        description: updateError?.message || 'Erro de autenticação.',
      });
      return;
    }

    let initialPetId = null;
    let initialTutorId = null;

    try {
        const rawMetaData = authUser.user_metadata;
        initialPetId = rawMetaData.initial_pet_access;
        initialTutorId = rawMetaData.tutor_id;

        if (initialPetId && initialTutorId) {
            const { error: accessError } = await supabaseContext
                .from('vet_access')
                .insert({
                    pet_id: initialPetId,
                    vet_id: authUser.id,
                    tutor_id: initialTutorId,
                    is_active: true,
                });
            
                if (accessError){
                    console.warn("Falha ao conceder acesso inicial ao pet:", accessError.message);
                }
        }
        const {error: profileUpdateError} = await supabaseContext
        .from('profiles')
        .update({ is_setup_complete: true})
        .eq('id', authUser.id);

        if (profileUpdateError) {
            console.error("Falha ao atualizar is_setup_complete:", profileUpdateError.message);
        }
        toast({
            title: 'Senha definida e acesso concedido!',
            description: 'Você será redirecionado para o painel.',
            className: 'bg-green-500 text-white', 
        });
        const redirectPath = authUser.user_metadata.user_type === 'vet' ? '/vet/painel' : '/app/dashboard';
        navigate(redirectPath, { replace: true});
    } catch (e) {
      console.error("Erro no fluxo de setup de senha:", e);
      toast({
          variant: 'destructive',
          title: 'Erro de processamento',
          description: 'Ocorreu um erro ao finalizar o setup. Tente novamente ou contate o suporte.',
      });
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-md p-6 space-y-8 bg-white rounded-lg shadow-md"
      >

          <div className="px-6 py-8 text-center">
            <h1 className="text-2xl font-bold text-gray-600 mt-4">
              Bem-vindo ao
            </h1>
            <img
                src="logotipo.png"
                alt="Logotipo MyPetOn"
                className="mx-auto h-32 w-auto my-0"
            />
            <h1 className="text-sm font-semibold text-gray-500 py-0">Defina sua Senha para acessar sua conta de veterinário!</h1>
              
            <form onSubmit={handleSetPassword} className="space-y-6 text-teal-600 py-4">
              <div>
                <Label htmlFor="password">Sua Senha</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
               />
            </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Senha e Acessar'}
              </Button>
            </form>
          </div>
      </motion.div>
    </div>
  );
};

export default DefinirSenha;
