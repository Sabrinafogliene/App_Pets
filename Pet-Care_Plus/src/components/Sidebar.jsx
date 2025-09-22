
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
    if (isOpen) {
      setIsOpen(false);
    }
  }, [location.pathname]);


  const tutorMenuItems = [
    { icon: Home, label: 'Dashboard', path: '/app/dashboard', color: 'text-pink-600' },
    { icon: PawPrint, label: 'Meus Pets', path: '/app/meus-pets', color: 'text-blue-600' },
    { icon: Syringe, label: 'Vacinas', path: '/app/vacinas', color: 'text-green-600' },
    { icon: Calendar, label: 'Consultas', path: '/app/consultas', color: 'text-purple-600' },
    { icon: Pill, label: 'Medicamentos', path: '/app/medicamentos', color: 'text-orange-600' },
    { icon: Utensils, label: 'Alimentação', path: '/app/alimentacao', color: 'text-yellow-600' },
    { icon: Scale, label: 'Peso', path: '/app/peso', color: 'text-indigo-600' },
    { icon: Camera, label: 'Galeria', path: '/app/galeria', color: 'text-teal-600' },
    { icon: UserCheck, label: 'Acesso de Veterinários', path: '/app/acesso-veterinarios', color: 'text-cyan-600' },
  ];

  const veterinarioMenuItems = [
    { icon: Users, label: 'Pacientes', path: '/vet/painel', color: 'text-blue-600' },
    { icon: BookOpen, label: 'Prontuário', path: '/vet/prontuario', color: 'text-purple-600' },
    { icon: Calendar, label: 'Agenda', path: '/vet/agenda', color: 'text-green-600' },
    { icon: Settings, label: 'Configurações', path: '/vet/configuracoes', color: 'text-gray-600' },
  ];

  // Aceita tanto 'vet' quanto 'veterinario' para o menu de veterinário
  const isVet = userType === 'veterinario' || userType === 'vet';
  const menuItems = isVet ? veterinarioMenuItems : tutorMenuItems;

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' },
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">PetCare+</h1>
                <p className="text-sm text-gray-600">
                  {isVet ? 'Portal do Veterinário' : 'Cuidando do seu melhor amigo'}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          <nav className="space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              NAVEGAÇÃO
            </div>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                    isActive 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-700 hover:bg-white/50 hover:text-gray-900'
                  )}
                >
                  <Icon 
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive ? item.color : 'text-gray-500 group-hover:text-gray-700'
                    )} 
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      <div className="p-6 border-t border-gray-200 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", profile.avatarBg)}>
            <span className="text-white text-sm font-medium">{profile.avatar}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
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
              className="fixed left-0 top-0 h-full w-64 flex flex-col sidebar-gradient border-r border-gray-200 z-50 md:hidden"
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
      <aside className="fixed left-0 top-0 h-full w-64 flex-col sidebar-gradient border-r border-gray-200 z-30 hidden md:flex">
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;
