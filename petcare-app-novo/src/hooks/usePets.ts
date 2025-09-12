import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export function usePets() {
  const { user } = useAuthContext();

  const { data: pets, isLoading: loading, error } = useQuery({
    queryKey: ['pets', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching pets:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
  });

  return {
    pets,
    loading,
    error
  };
}