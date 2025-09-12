import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/customSupabaseClient'; // Importa a instância única
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Função para lidar com a sessão
  const handleSession = useCallback((session) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  // Efeito para buscar a sessão inicial e ouvir mudanças
  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      handleSession(session);
    };

    getInitialSession();

    // Ouve mudanças no estado de autenticação (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        handleSession(session);
      }
    );

    // Limpa a inscrição ao desmontar o componente
    return () => subscription.unsubscribe();
  }, [handleSession]);

  // Função de Sign Up
  const signUp = useCallback(async (email, password, options) => {
    return supabase.auth.signUp({ email, password, options });
  }, []);

  // Função de Sign In
  const signIn = useCallback(async (email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  // Função de Sign Out
  const signOut = useCallback(async () => {
    return supabase.auth.signOut();
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  }), [user, session, loading, signUp, signIn, signOut]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
