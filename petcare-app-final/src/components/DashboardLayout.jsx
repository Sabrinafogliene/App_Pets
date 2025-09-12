import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';

const DashboardLayout = ({ children }) => {
  // Pode customizar para esconder o sidebar em rotas específicas se necessário
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <Sidebar />
      <main className="flex-1 p-8 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
