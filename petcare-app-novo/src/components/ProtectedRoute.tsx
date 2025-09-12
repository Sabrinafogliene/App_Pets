import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'tutor' | 'veterinario' }) => {
  const { user, profile, loading } = useAuthContext();
  const location = useLocation();

  // Se ainda está carregando sessão inicial -> mostra loader
  if (loading && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4">Verificando autenticação...</span>
      </div>
    );
  }

  // Se não tem usuário -> manda pro login
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Se a rota pede role específica mas ainda não temos profile -> espera
  if (requiredRole && !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-4">Carregando permissões...</span>
      </div>
    );
  }

  // Se já temos profile e a role não bate -> manda pro unauthorized
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};
