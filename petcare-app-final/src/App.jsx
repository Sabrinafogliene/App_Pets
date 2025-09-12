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
    if(profileType){
        if (profileType === 'tutor') {
          navigate('/tutor/dashboard', { replace: true });
        } else if (profileType === 'vet') {
          navigate('/vet/dashboard', { replace: true });
        }
    }
  }, [profileType, navigate])

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
          <Route 
            path="/tutor/dashboard" 
            element={
              <ProtectedRoute userType="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/vet/dashboard" 
            element={
              <ProtectedRoute userType="vet">
                <VetDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pet/:petId" 
            element={
              <ProtectedRoute userType="tutor">
                <PetProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/grant-access" 
            element={
              <ProtectedRoute userType="tutor">
                <GrantAccessPage />
              </ProtectedRoute>
            } 
          />
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </DataProvider>
  );
}

export default App;