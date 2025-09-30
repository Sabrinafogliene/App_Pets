
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Home, 
  PawPrint, 
  Syringe, 
  Calendar, 
  Pill, 
  Utensils, 
  Scale, 
  Camera, 
  UserCheck,
  Users,
  Settings,
  LogOut,
  X,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils';

const Sidebar = ({ userType, isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState({ name: "Carregando...", email: "...", avatar: "?", avatarBg: "bg-gray-400" });

  useEffect(() => {
    if (user) {
      const name = user.user_metadata?.full_name || "Usuário";
      const avatar = name.split(' ').map(n => n[0]).slice(0, 2).join('');
      setProfile({
        name: name,
        email: user.email,
        avatar: avatar,
        avatarBg: userType === 'tutor' ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gradient-to-br from-blue-500 to-cyan-500"
      });
    }
  }, [user, userType]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 786) {
      setIsOpen(false);
    }
  }, [location.pathname]);


  const tutorMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/app/dashboard', color: 'text-indigo-600' },
    { icon: PawPrint, label: 'Meus Pets', path: '/app/meus-pets', color: 'text-pink-600' },
    { icon: Syringe, label: 'Vacinas', path: '/app/vacinas', color: 'text-green-600' },
    { icon: Calendar, label: 'Consultas', path: '/app/consultas', color: 'text-purple-600' },
    { icon: Pill, label: 'Medicamentos', path: '/app/medicamentos', color: 'text-blue-600' },
    { icon: Utensils, label: 'Alimentação', path: '/app/alimentacao', color: 'text-orange-600' },
    { icon: Scale, label: 'Peso', path: '/app/peso', color: 'text-yellow-600' },
    { icon: Camera, label: 'Galeria', path: '/app/galeria', color: 'text-cyan-600' },
    { icon: UserCheck, label: 'Acesso de Veterinários', path: '/app/acesso-veterinarios', color: 'text-cyan-600' },
  ];

  const veterinarioMenuItems = [
    { icon: Users, label: 'Pacientes', path: '/vet/painel', color: 'text-cyan-600' },
    { icon: BookOpen, label: 'Prontuário', path: '/vet/prontuario', color: 'text-cyan-600' },
    { icon: Calendar, label: 'Agenda', path: '/vet/agenda', color: 'text-cyan-600' },
    { icon: Settings, label: 'Configurações', path: '/vet/configuracoes', color: 'text-cyan-600' },
  ];

  // Aceita tanto 'vet' quanto 'veterinario' para o menu de veterinário
  const isVet = userType === 'veterinario' || userType === 'vet';
  const menuItems = isVet ? veterinarioMenuItems : tutorMenuItems;

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <img
                src="/logotipo.png"
                alt="Logotipo MyPetOn"
                className="h-32 w-auto"
              />
              
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
            </div>
          </div>

          <nav className="space-y-1.5">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
              NAVEGAÇÃO
            </div>
            {menuItems.map((item) => {
              const isActive = location.pathname.startsWith(item.path);
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive 
                      ? 'bg-teal-500 shadow-md text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                  )}
                >
                  <Icon 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'
                    )} 
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center space-x-3 mb-4">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", profile.avatarBg)}>
            <span className="text-white text-xs font-medium">{profile.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-500 hover:text-red-600 hover:bg-red-100"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 h-full w-64 flex flex-col siday-200 z-50 md:hidden"
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 flex-col bg-white border-r border-gray-200 z-30 hidden md:flex">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
