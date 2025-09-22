import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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
import { useAuth } from '@/contexts/SupabaseAuthContext';
import ProntuarioVet from '@/pages/ProntuarioVet';
import AgendaVet from '@/pages/AgendaVet';
import ConfiguracoesVet from '@/pages/ConfiguracoesVet';

// --- COMPONENTES DE ROTEAMENTO ATUALIZADOS ---

/**
 * Componente para redirecionar o usuário logado para o dashboard correto.
 * Ele aguarda o perfil ser carregado para evitar condições de corrida.
 */
const AuthRedirect = () => {
  const { profile, loading } = useAuth();

  // Exibe uma tela de carregamento enquanto o perfil está sendo buscado
  if (loading || !profile) {
    return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
  }

  // Quando o perfil estiver carregado, redireciona com base no user_type
  if (profile.user_type === 'veterinario' || profile.user_type === 'vet') {
    return <Navigate to="/vet/painel" replace />;
  }

  // O padrão é redirecionar para o dashboard do tutor
  return <Navigate to="/dashboard" replace />;
};

/**
 * Define as rotas privadas, garantindo que o usuário correto veja as páginas corretas.
 */
const PrivateRoutes = () => {
  const { profile } = useAuth();
  const userType = profile?.user_type;
  const isVet = userType === 'veterinario' || userType === 'vet';

  // Renderiza as rotas dentro de um Layout compartilhado
  return (
    <Layout>
      <Routes>
        {userType === 'tutor' && (
          <>
            <Route path="/app/dashboard" element={<Dashboard />} />
            <Route path="/app/meus-pets" element={<MeusPets />} />
            <Route path="/app/vacinas" element={<Vacinas />} />
            <Route path="/app/consultas" element={<Consultas />} />
            <Route path="/app/medicamentos" element={<Medicamentos />} />
            <Route path="/app/alimentacao" element={<Alimentacao />} />
            <Route path="/app/peso" element={<Peso />} />
            <Route path="/app/galeria" element={<Galeria />} />
            <Route path="/app/acesso-veterinarios" element={<AcessoVeterinarios />} />
            <Route path="/app/meu-pet/:id" element={<PerfilTutor />} />
            {/* Redireciona qualquer rota não encontrada para o dashboard do tutor */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
        {isVet && (
          <>
            <Route path="/vet/painel" element={<PainelVeterinario />} />
            <Route path="/vet/paciente/:id" element={<PerfilPaciente />} />
            <Route path="/vet/prontuario" element={<ProntuarioVet />} />
            <Route path="/vet/agenda" element={<AgendaVet />} />
            <Route path="/vet/configuracoes" element={<ConfiguracoesVet />} />
            {/* Redireciona qualquer rota não encontrada para o painel do veterinário */}
            <Route path="*" element={<Navigate to="/vet/painel" replace />} />
          </>
        )}
      </Routes>
    </Layout>
  );
};

/**
 * Gerenciador principal de rotas da aplicação.
 */
const AppRoutes = () => {
  const { session, loading } = useAuth();
  const location = useLocation();

  // Exibe uma tela de carregamento global enquanto a sessão é validada
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Carregando PetCare+...</div>;
  }

  // Se não há sessão e o usuário não está em uma página pública, redireciona para o login
  if (!session && location.pathname !== '/login' && location.pathname !== '/signup') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <Routes>
      {/* Rotas Públicas: Login e Cadastro */}
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" replace />} />
      <Route path="/signup" element={!session ? <SignUp /> : <Navigate to="/" replace />} />

      {/* Rota Raiz: Ponto de entrada para usuários logados, usa AuthRedirect */}
      <Route
        path="/"
        element={session ? <AuthRedirect /> : <Navigate to="/login" replace />}
      />

      {/* Rotas Privadas: Carrega o componente PrivateRoutes para qualquer outra rota */}
      <Route
        path="/*"
        element={session ? <PrivateRoutes /> : <Navigate to="/login" replace />}
      />
    </Routes>
  );
};

/**
 * Manipulador de autenticação via URL (Magic Link, convites, etc.).
 * O código original aqui está correto e foi mantido.
 */
const AuthHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { supabase } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const hash = location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const tokenType = params.get('type');
      const refreshToken = params.get('refresh_token');
      const invitationToken = params.get('invitation_token');

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!error) {
          if (tokenType === 'invite' || tokenType === 'magiclink' || tokenType === 'signup') {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', user.id).single();

            if (user && !profile) {
              navigate(`/signup?invitation_token=${invitationToken || ''}`, { replace: true });
              return;
            }
          }
          // Redireciona para a raiz, que agora é gerenciada pelo AuthRedirect
          navigate('/', { replace: true });
        } else {
          console.error('Error setting session from URL:', error);
          navigate('/login', { replace: true });
        }
      }
    };

    if (location.hash.includes('access_token')) {
      handleAuth();
    }
  }, [location, navigate, supabase]);

  return null;
};

/**
 * Componente principal da aplicação.
 */
function App() {
  return (
    <>
      <Helmet>
        <title>PetCare+ - Cuidando do seu melhor amigo</title>
        <meta name="description" content="Acompanhe a saúde e bem-estar dos seus pets em um só lugar" />
      </Helmet>
      <Router>
        <AuthHandler />
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <Toaster />
        </div>
      </Router>
    </>
  );
}

export default App;
