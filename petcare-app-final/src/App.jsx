import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { DataProvider } from '@/contexts/DataContext';
import LoginPage from '@/pages/LoginPage';
import TutorDashboard from '@/pages/TutorDashboard';
import VetDashboard from '@/pages/VetDashboard';
import PetProfile from '@/pages/PetProfile';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import GrantAccessPage from '@/pages/GrantAccessPage';
import MeusPetsPage from '@/pages/MeusPetsPage';
import VacinasPage from '@/pages/VacinasPage';
import ConsultasPage from '@/pages/ConsultasPage';
import MedicamentosPage from '@/pages/MedicamentosPage';
import PesoPage from '@/pages/PesoPage';
import AlimentacaoPage from '@/pages/AlimentacaoPage';
import GaleriaPage from '@/pages/GaleriaPage';
import PacientesPage from '@/pages/PacientesPage';
import AgendaPage from '@/pages/AgendaPage';
import ProntuariosPage from '@/pages/ProntuariosPage';

function App() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (session) {
        supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setProfileType(data.user_type);
            }
          });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [session, loading, navigate]);
  
  useEffect(() => {
    // Redireciona apenas se estiver na raiz ou na página de login
    const currentPath = window.location.pathname;
    if (profileType) {
      if ((currentPath === '/' || currentPath === '/login')) {
        if (profileType === 'tutor') {
          navigate('/tutor/dashboard', { replace: true });
        } else if (profileType === 'vet') {
          navigate('/vet/dashboard', { replace: true });
        }
      }
    }
  }, [profileType, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <DataProvider>
      <Helmet>
        <title>PetCare+ - Cuidando do seu melhor amigo</title>
        <meta name="description" content="Acompanhe a saúde e bem-estar dos seus pets em um só lugar" />
      </Helmet>
      <div className="min-h-screen main-container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/tutor/dashboard" element={<ProtectedRoute userType="tutor"><TutorDashboard /></ProtectedRoute>} />
          <Route path="/vet/dashboard" element={<ProtectedRoute userType="vet"><VetDashboard /></ProtectedRoute>} />
          <Route path="/pet/:petId" element={<ProtectedRoute userType="tutor"><PetProfile /></ProtectedRoute>} />
          <Route path="/grant-access" element={<ProtectedRoute userType="tutor"><GrantAccessPage /></ProtectedRoute>} />
          <Route path="/meus-pets" element={<ProtectedRoute userType="tutor"><MeusPetsPage /></ProtectedRoute>} />
          <Route path="/vacinas" element={<ProtectedRoute userType="tutor"><VacinasPage /></ProtectedRoute>} />
          <Route path="/consultas" element={<ProtectedRoute userType="tutor"><ConsultasPage /></ProtectedRoute>} />
          <Route path="/medicamentos" element={<ProtectedRoute userType="tutor"><MedicamentosPage /></ProtectedRoute>} />
          <Route path="/peso" element={<ProtectedRoute userType="tutor"><PesoPage /></ProtectedRoute>} />
          <Route path="/alimentacao" element={<ProtectedRoute userType="tutor"><AlimentacaoPage /></ProtectedRoute>} />
          <Route path="/galeria" element={<ProtectedRoute userType="tutor"><GaleriaPage /></ProtectedRoute>} />
          <Route path="/pacientes" element={<ProtectedRoute userType="vet"><PacientesPage /></ProtectedRoute>} />
          <Route path="/agenda" element={<ProtectedRoute userType="vet"><AgendaPage /></ProtectedRoute>} />
          <Route path="/prontuarios" element={<ProtectedRoute userType="vet"><ProntuariosPage /></ProtectedRoute>} />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </DataProvider>
  );
}

export default App;