import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/supabaseClient.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (user) => {
    if (!user) return null;
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, user_type, full_name')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.warn("Could not fetch profile:", profileError.message);
        return null;
      }
      return profileData;
    } catch (error) {
      console.error("Error fetching profile:", error.message);
      return null;
    }
  }, []);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      if (initialSession?.user) {
        const initialProfile = await fetchUserProfile(initialSession.user);
        setProfile(initialProfile);
      }
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Sempre busca o perfil quando a sessão muda para garantir que está atualizado
          const newProfile = await fetchUserProfile(newSession.user);
          setProfile(newProfile);
        } else {
          setProfile(null);
        }
        // O loading principal só é falso após a primeira verificação
        if (loading) setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfile, loading]);

  const signIn = useCallback((email, password) => {
    return supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

  const value = useMemo(() => ({
    loading, 
    session,
    user: session?.user ?? null,
    profile,
    signIn,
    signOut,
    supabase,
  }), [loading, session, profile, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
