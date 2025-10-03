import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';


const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, supabase } = useAuth();
  const [error, setError] = useState(null);
  

  useEffect(() => {
    
    if (!loading && session) {
      const timer = setTimeout(() => {
        navigate('/', {replace: true});
      }, 200);
      return () => clearTimeout(timer);
    }

    const processAuth = async () => {
      const params = new URLSearchParams(location.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        try {
          const { data: {session: newSession}, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,  
          });
          if (sessionError) throw sessionError;

            window.location.href = '/';
        } catch (err) {
          console.error("Erro ao processar tokens de callback:", err);
          setError("Erro de autenticação. Tente fazer login novamente.");
          navigate('/login', {replace: true});
        }
      } else if (!loading && !session) {
        navigate('/login', {replace: true});
      }
    };
        
    if (location.hash.includes('access_token')) {
      processAuth();

    } else if (!loading && session) {
      navigate('/', {replace: true});
    }
  }, [loading, session, navigate, location.hash, supabase]);
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-4">
      <div className="text-center">
        {error? (
          <p className="text-red-600 font-semibold mb-4">{error}</p>
        ) : (
          <p className="text-gray-700 font-medium text-lg">
            Finalizando autenticação...
          </p>
        )}
          <p className="text-sm text-gray-500 mt-2">
            Você será redirecionado automaticamente.
          </p>
      </div>
    </div>
  );
};

export default AuthCallback;
