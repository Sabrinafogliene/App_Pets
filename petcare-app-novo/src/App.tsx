// Copie e cole este código em: src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Importe todas as suas páginas
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Pets from "@/pages/Pets";
import PetProfile from "@/pages/PetProfile";
import Vacinas from "@/pages/Vacinas";
import Consultas from "@/pages/Consultas";
import Medicamentos from "@/pages/Medicamentos";
import Alimentacao from "@/pages/Alimentacao";
import Peso from "@/pages/Peso";
import Galeria from "@/pages/Galeria";
import AcessoVeterinarios from "@/pages/AcessoVeterinarios";
import Configuracoes from "@/pages/Configuracoes";
import PainelVeterinario from "@/pages/PainelVeterinario";
import PacienteDetalhes from "@/pages/PacienteDetalhes";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            
            <Route path="/pets" element={<ProtectedRoute><Pets /></ProtectedRoute>} />
            <Route path="/pets/:id" element={<ProtectedRoute><PetProfile /></ProtectedRoute>} />
            <Route path="/vacinas" element={<ProtectedRoute><Vacinas /></ProtectedRoute>} />
            <Route path="/consultas" element={<ProtectedRoute><Consultas /></ProtectedRoute>} />
            <Route path="/medicamentos" element={<ProtectedRoute><Medicamentos /></ProtectedRoute>} />
            <Route path="/alimentacao" element={<ProtectedRoute><Alimentacao /></ProtectedRoute>} />
            <Route path="/peso" element={<ProtectedRoute><Peso /></ProtectedRoute>} />
            <Route path="/galeria" element={<ProtectedRoute><Galeria /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            
            <Route path="/acesso-veterinarios" element={<ProtectedRoute requiredRole="tutor"><AcessoVeterinarios /></ProtectedRoute>} />
            
            <Route path="/painel-veterinario" element={<ProtectedRoute requiredRole="veterinario"><PainelVeterinario /></ProtectedRoute>} />
            <Route path="/paciente/:id" element={<ProtectedRoute requiredRole="veterinario"><PacienteDetalhes /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;