import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const AuthRedirector = () => {
  const { session, profile, loading } = useAuth();


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verificando autenticação...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  
  const isInvitedUser = session.user.identities?.some((identity) => identity.provider === 'invite');

  
  if (isInvitedUser) {
    console.log("AuthRedirector: Usuário convidado detectado! Redirecionando para /definir-senha");
    return <Navigate to="/definir-senha" replace />;
  }

  
  if (profile) {
    if (profile.user_type === 'vet') {
      return <Navigate to="/vet/painel" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }


  return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
};

export default AuthRedirector;
