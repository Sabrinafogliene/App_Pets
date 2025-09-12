// Copie este código e substitua TODO o conteúdo do seu arquivo App.tsx

import { AuthProvider, useAuthContext } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/sonner";

// Um componente de teste para verificar o estado da autenticação
const AuthStatusChecker = () => {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', textAlign: 'center' }}>
      {user ? (
        <div>
          <p>✅ Login realizado com sucesso!</p>
          <p style={{ fontSize: '18px', marginTop: '10px' }}>Email do Usuário: {user.email}</p>
          <p style={{ fontSize: '18px' }}>Perfil Carregado: {profile ? profile.nome : 'Não encontrado'}</p>
        </div>
      ) : (
        <div>
            <p>❌ Sem sessão ativa.</p>
            <p style={{ fontSize: '18px', marginTop: '10px' }}>
                Por favor, navegue manualmente para <a href="/auth" style={{color: 'blue'}}>/auth</a> para fazer login.
            </p>
        </div>
      )}
    </div>
  );
};


// O App agora só renderiza o nosso provedor de autenticação e o verificador
const App = () => {
    return (
        <AuthProvider>
            <Toaster />
            <AuthStatusChecker />
        </AuthProvider>
    )
}

export default App;