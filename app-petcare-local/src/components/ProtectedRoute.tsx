import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'tutor' | 'veterinario';
  redirectTo?: string;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  redirectTo = '/auth' 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuthContext();

  console.log('ProtectedRoute - User:', !!user, 'Profile:', !!profile, 'Loading:', loading, 'RequiredRole:', requiredRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to:', redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // If user exists but profile is still loading, show loading state
  if (user && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2 text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (requiredRole && profile && profile.role !== requiredRole) {
    console.log('ProtectedRoute - Role mismatch. User role:', profile.role, 'Required:', requiredRole);
    
    // Redirecionar para dashboard correto baseado no role
    if (profile.role === 'veterinario' && requiredRole === 'tutor') {
      console.log('ProtectedRoute - Redirecting vet to vet dashboard');
      return <Navigate to="/painel-veterinario" replace />;
    }
    if (profile.role === 'tutor' && requiredRole === 'veterinario') {
      console.log('ProtectedRoute - Redirecting tutor to tutor dashboard');
      return <Navigate to="/dashboard" replace />;
    }
    console.log('ProtectedRoute - Redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute - Access granted');
  return <>{children}</>;
}