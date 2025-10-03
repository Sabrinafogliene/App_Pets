import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import MeusPets from '@/pages/MeusPets';
import Vacinas from '@/pages/Vacinas';
import Consultas from '@/pages/Consultas';
import Medicamentos from '@/pages/Medicamentos';
import Alimentacao from '@/pages/Alimentacao';
import Peso from '@/pages/Peso';
import Galeria from '@/pages/Galeria';
import AcessoVeterinarios from '@/pages/AcessoVeterinarios';
import PainelVeterinario from '@/pages/PainelVeterinario';
import PerfilPaciente from '@/pages/PerfilPaciente';
import PerfilTutor from '@/pages/PerfilTutor';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import ProntuarioVet from '@/pages/ProntuarioVet';
import AgendaVet from '@/pages/AgendaVet';
import ConfiguracoesVet from '@/pages/ConfiguracoesVet';
import DefinirSenha from '@/pages/DefinirSenha'; 
import { useAuth } from '@/contexts/SupabaseAuthContext';
import AuthCallback from '@/pages/AuthCallback';

const AuthRedirect = () => {
  const { profile, session, loading, needsPasswordSetup } = useAuth();
  const isVet= profile?.user_type === 'veterinario' || profile?.user_type === 'vet';
  const isTutor = profile?.user_type === 'tutor';

  
  if (loading || (session && profile === null)) {
    return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
  }

  if (needsPasswordSetup) {
    return <Navigate to="/definir-senha" replace />;
  }

  if (isVet) {
    return <Navigate to="/vet/painel" replace />;
  }
  if (isTutor) {
    return <Navigate to="/app/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
};

const PrivateRoutes = () => {
  const { profile } = useAuth();
  const userType = profile?.user_type;
  const isVet = userType === 'veterinario' || userType === 'vet';
  

  return (
    <Layout>
      <Routes>
        {userType === 'tutor' && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/meus-pets" element={<MeusPets />} />
            <Route path="/vacinas" element={<Vacinas />} />
            <Route path="/consultas" element={<Consultas />} />
            <Route path="/medicamentos" element={<Medicamentos />} />
            <Route path="/alimentacao" element={<Alimentacao />} />
            <Route path="/peso" element={<Peso />} />
            <Route path="/galeria" element={<Galeria />} />
            <Route path="/acesso-veterinarios" element={<AcessoVeterinarios />} />
            <Route path="/meu-pet/:id" element={<PerfilTutor />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
        {isVet && (
          <>
            <Route path="/painel" element={<PainelVeterinario />} />
            <Route path="/paciente/:id" element={<PerfilPaciente />} />
            <Route path="/prontuario" element={<ProntuarioVet />} />
            <Route path="/agenda" element={<AgendaVet />} />
            <Route path="/configuracoes" element={<ConfiguracoesVet />} />
            <Route path="*" element={<Navigate to="/painel" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
};

const AppRoutes = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando My Pet On...</div>;
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/definir-senha" element={<DefinirSenha />} />
      <Route path="/resetar-senha" element={<DefinirSenha />} />

      {!session && (
        <>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </>
      )}

      
      {session && (
        <>
          
          <Route path="/" element={<AuthRedirect />} />
          
          <Route path="/app/*" element={<PrivateRoutes />} />
          <Route path="/vet/*" element={<PrivateRoutes />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
};

function App() {
  return (
    <>
      <title>My Pet On</title>
      <div className="min-h-screen bg-gray-50">
        <AppRoutes />
        <Toaster />
      </div>
      
    </>
  );
}

export default App;
