import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function RoleRedirect() {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (profile.role === 'veterinario') {
    return <Navigate to="/painel-veterinario" replace />;
  }

  if (profile.role === 'tutor') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
}