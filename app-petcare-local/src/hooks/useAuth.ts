// Copie este código e substitua TODO o conteúdo do seu arquivo src/hooks/useAuth.ts

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  nome: string | null;
  email: string | null;
  role: 'tutor' | 'veterinario';
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // Ignora erro "not found"
          throw error;
        }
      }
      setProfile(data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (error) {
        console.error("Erro na inicialização da autenticação:", error);
        // Garante que o estado de erro não prenda o app
        setSession(null);
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          setProfile(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, userData: { nome: string; role: 'tutor' | 'veterinario' }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: { nome: userData.nome, role: userData.role } }
    });
  };

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signOut = async () => {
    return await supabase.auth.signOut();
  };
  
  return { user, session, profile, loading, signUp, signIn, signOut };
}