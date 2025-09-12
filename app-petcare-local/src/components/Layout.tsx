// Copie todo este código e cole no seu arquivo Layout.tsx

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Home, PawPrint, Syringe, Calendar, Pill, Weight, Camera, Utensils, Settings, ChevronLeft, ChevronRight, UserCheck, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // CORREÇÃO: Inicializa com um valor seguro (false) e ajusta no cliente.
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuthContext();

  // CORREÇÃO: Lógica para verificar o tamanho da tela movida para dentro do useEffect.
  useEffect(() => {
    const checkScreenSize = () => {
      setIsExpanded(window.innerWidth >= 1024);
    };

    checkScreenSize(); // Executa na primeira vez que o componente monta no navegador
    window.addEventListener('resize', checkScreenSize); // Adiciona o listener para redimensionamento

    return () => window.removeEventListener('resize', checkScreenSize); // Limpa o listener
  }, []); // O array vazio [] garante que isso só rode uma vez, no lado do cliente.

  const tutorNav = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Meus Pets', href: '/pets', icon: PawPrint },
    { name: 'Vacinas', href: '/vacinas', icon: Syringe },
    { name: 'Consultas', href: '/consultas', icon: Stethoscope },
    { name: 'Medicamentos', href: '/medicamentos', icon: Pill },
    { name: 'Alimentação', href: '/alimentacao', icon: Utensils },
    { name: 'Peso', href: '/peso', icon: Weight },
    { name: 'Galeria', href: '/galeria', icon: Camera },
    { name: 'Acesso Veterinários', href: '/acesso-veterinarios', icon: UserCheck },
  ];
  const vetNav = [{ name: 'Painel Veterinário', href: '/painel-veterinario', icon: Stethoscope }];
  const commonNav = [{ name: 'Configurações', href: '/configuracoes', icon: Settings }];
  const navigation = profile?.role === 'veterinario' ? vetNav : tutorNav;
  const finalNav = [...navigation, ...commonNav];

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Logout realizado com sucesso!');
      navigate('/auth');
    } catch (error: any) {
      toast.error(`Erro ao fazer logout: ${error.message}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <TooltipProvider delayDuration={0}>
        <div className="flex h-screen bg-muted/20">
        <aside className={cn("flex flex-col bg-card border-r transition-all duration-300", isExpanded ? "w-64" : "w-[68px]")}>
            <div className="p-3 border-b flex items-center h-16 shrink-0">
                <div className={cn("flex items-center space-x-3 w-full", !isExpanded && "justify-center")}>
                    <div className="w-8 h-8 bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-white" />
                    </div>
                    <span className={cn("font-bold text-lg whitespace-nowrap transition-opacity duration-200", !isExpanded && "opacity-0 w-0")}>PetCare+</span>
                </div>
            </div>
            
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {finalNav.map(item => (
                    isExpanded ? (
                        <Link key={item.name} to={item.href} className={cn("flex items-center p-3 rounded-lg text-sm font-medium", isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                            <item.icon className="h-5 w-5 flex-shrink-0" /><span className="ml-3">{item.name}</span>
                        </Link>
                    ) : (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <Link to={item.href} className={cn("flex items-center justify-center p-3 rounded-lg", isActive(item.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                                    <item.icon className="h-5 w-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right"><p>{item.name}</p></TooltipContent>
                        </Tooltip>
                    )
                ))}
            </nav>

            <div className="p-3 border-t mt-auto shrink-0">
                <Button variant="ghost" onClick={() => setIsExpanded(!isExpanded)} className="w-full justify-center text-muted-foreground">
                    {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </Button>
                <div className={cn("flex items-center p-2 rounded-lg mt-2", !isExpanded && "justify-center")}>
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {profile?.nome?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className={cn("ml-3 flex-1 min-w-0 transition-opacity", !isExpanded && "opacity-0 w-0 pointer-events-none")}>
                        <p className="text-sm font-semibold truncate">{profile?.nome || 'Usuário'}</p>
                        <p className="text-xs text-muted-foreground truncate">{profile?.role === 'veterinario' ? 'Veterinário' : 'Tutor de Pets'}</p>
                    </div>
                </div>
                <Button variant="ghost" onClick={handleLogout} className={cn("w-full mt-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10", isExpanded ? "justify-start" : "justify-center")}>
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                    <span className={cn("ml-3 whitespace-nowrap transition-opacity", !isExpanded && "opacity-0 w-0")}>Sair</span>
                </Button>
            </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
            <div className="container mx-auto p-6">{children}</div>
        </main>
        </div>
    </TooltipProvider>
  );
};

export default Layout;