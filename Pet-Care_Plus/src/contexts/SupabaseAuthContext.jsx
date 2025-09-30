import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { supabase } from '@/supabaseClient.js';
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (user) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_type, full_name, is_setup_complete')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.warn("Erro ao buscar perfil:", error.message);
      return null;
    }
  }, []);


  useEffect(() => {
    setLoading(true);

    
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        const initialProfile = await fetchUserProfile(initialSession.user);
        setProfile(initialProfile);
      }
      setLoading(false);
    });

  
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          const userProfile = await fetchUserProfile(newSession.user);
          setProfile(userProfile);
        } else {
          setProfile(null); 
        }
        setLoading(false);
      }
    );

    
    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]); 

  const signIn = useCallback((email, password) => supabase.auth.signInWithPassword({ email, password }), []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
  }, []);

 
  const value = useMemo(() => {
    const user = session?.user ?? null;
    needsPasswordSetup: profile?.user_type === 'vet' && profile?.is_setup_complete !== true;
    return { 
      loading, 
      session,
      profile,
      needsPasswordSetup,
      signIn,
      signOut,
      supabase,
    };
  }, [loading, session, profile, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
