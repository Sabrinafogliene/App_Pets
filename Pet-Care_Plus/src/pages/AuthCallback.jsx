// src/pages/AuthCallback.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AuthCallback = () => {
  const { session, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Não faça nada enquanto os dados estão carregando.
    if (loading) {
      return;
    }

    // Se, após o carregamento, não houver sessão, algo deu errado. Vá para o login.
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    // A LÓGICA PRINCIPAL:
    // Verifica se é um usuário convidado que precisa definir a senha.
    const isNewInvitedUser = session.user.last_sign_in_at === null;
    if (isNewInvitedUser) {
      navigate('/definir-senha', { replace: true });
    } else if (profile) {
      // Se for um usuário normal, redireciona para o painel correto.
      if (profile.user_type === 'vet') {
        navigate('/vet/painel', { replace: true });
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    }
    // Se o perfil ainda não carregou, o useEffect será executado novamente quando ele carregar.

  }, [session, profile, loading, navigate]);

  // Exibe uma tela de carregamento universal enquanto a decisão é tomada.
  return <div className="flex justify-center items-center h-screen">Autenticando...</div>;
};

export default AuthCallback;
