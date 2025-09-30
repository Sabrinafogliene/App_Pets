// src/components/AuthRedirector.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AuthRedirector = () => {
  const { session, profile, loading } = useAuth();

  // Enquanto carrega, não faz nada (mostra uma tela em branco ou um spinner)
  if (loading || !session) {
    // Se não tiver sessão após o loading, algo deu errado, volta pro login
    if (!loading && !session) {
      return <Navigate to="/login" replace />;
    }
    return <div className="flex justify-center items-center h-screen">Verificando autenticação...</div>;
  }

  // A LÓGICA DECISIVA:
  const isNewUser = session.user.last_sign_in_at === null;

  // 1. Se for um novo usuário (convidado ou cadastro), vai para definir a senha.
  if (isNewUser) {
    return <Navigate to="/definir-senha" replace />;
  }

  // 2. Se for um usuário existente e tiver perfil, vai para o painel correto.
  if (profile) {
    if (profile.user_type === 'vet') {
      return <Navigate to="/vet/painel" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  // 3. Se por algum motivo o perfil ainda não carregou, espera.
  // (O componente vai re-renderizar quando o perfil chegar)
  return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
};

export default AuthRedirector;
