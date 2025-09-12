// src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { UserProfile } from "@/types";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, nome, email, role")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      setProfile(data || null);
      console.log("Perfil carregado:", data);
    } catch (error) {
      console.error("Erro ao buscar perfil:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error("Erro na autenticação:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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

  // 🔹 Corrigido: cria perfil junto com o usuário
  const signUp = async (
    email: string,
    password: string,
    userData: { nome: string; role: "tutor" | "veterinario" }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      await supabase.from("profiles").insert({
        user_id: data.user.id,
        nome: userData.nome,
        email,
        role: userData.role,
      });
    }

    return { data, error };
  };

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { user, session, profile, loading, signUp, signIn, signOut };
}
