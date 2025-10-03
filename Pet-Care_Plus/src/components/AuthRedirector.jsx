import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AuthRedirector = () => {
  const { session, profile, loading, needsPasswordSetup } = useAuth();

  // Logs para depuração
  console.log('AuthRedirector: Estado de Carregamento (loading):', loading);
  console.log('AuthRedirector: Objeto da Sessão (session):', session);
  console.log('AuthRedirector: Perfil do Usuário (profile):', profile);
  console.log('AuthRedirector: Precisa configurar senha? (needsPasswordSetup):', needsPasswordSetup);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verificando autenticação...</div>;
  }

  if (!session) {
    console.log('AuthRedirector: Nenhuma sessão encontrada. Redirecionando para /login');
    return <Navigate to="/login" replace />;
  }

  
  if (needsPasswordSetup) {
    console.log('AuthRedirector: Usuário precisa configurar senha! Redirecionando para /definir-senha');
    return <Navigate to="/definir-senha" replace />;
  }

  if (profile) {
    if (profile.user_type === 'vet') {
      console.log('AuthRedirector: Perfil de veterinário encontrado. Redirecionando para /vet/painel');
      return <Navigate to="/vet/painel" replace />;
    }
    console.log('AuthRedirector: Perfil de usuário padrão encontrado. Redirecionando para /app/dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  console.log('AuthRedirector: Sessão existe, mas o perfil ainda está carregando...');
  return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
};

export default AuthRedirector;
