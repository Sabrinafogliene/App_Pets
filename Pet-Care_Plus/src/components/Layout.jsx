
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Menu, PawPrint } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Layout = ({ children }) => {
  const { session, profile, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Verificando acesso...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (!profile) {
    return <div className="flex justify-center items-center h-screen">Carregando perfil...</div>;
  }

  const userType = profile.user_type;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        userType={userType} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <div className="flex-1 flex flex-col">
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white/80 backdrop-blur-sm p-4 border-b">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-6 h-6 text-pink-600" />
            <span className="font-bold text-lg">PetCare+</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>
        <motion.main 
          className="flex-1 p-4 sm:p-6 md:ml-64"
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default Layout;
