import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PawPrint, Syringe, Calendar, Pill, Weight, Bone, Camera, UserPlus, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useData } from '@/contexts/DataContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/tutor/dashboard', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  { icon: PawPrint, label: 'Meus Pets', href: '/meus-pets', color: 'text-pink-500', bgColor: 'bg-pink-100' },
  { icon: Syringe, label: 'Vacinas', href: '/vacinas', color: 'text-green-500', bgColor: 'bg-green-100' },
  { icon: Calendar, label: 'Consultas', href: '/consultas', color: 'text-blue-500', bgColor: 'bg-blue-100' },
  { icon: Pill, label: 'Medicamentos', href: '/medicamentos', color: 'text-red-500', bgColor: 'bg-red-100' },
  { icon: Weight, label: 'Peso', href: '/peso', color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  { icon: Bone, label: 'Alimentação', href: '/alimentacao', color: 'text-orange-500', bgColor: 'bg-orange-100' },
  { icon: Camera, label: 'Galeria', href: '/galeria', color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
  { icon: UserPlus, label: 'Conceder Acesso', href: '/grant-access', color: 'text-teal-500', bgColor: 'bg-teal-100' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { pets } = useData();

  const handleSidebarClick = (href) => {
    navigate(href);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-white/80 backdrop-blur-md border-r border-gray-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center space-x-3 mb-8 px-2">
          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-gray-800 font-bold text-lg">PetCare+</h2>
            <p className="text-xs text-gray-500">Cuidando do seu melhor amigo</p>
          </div>
        </div>
        <nav className="space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleSidebarClick(item.href)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold transition-all text-gray-500 hover:bg-gray-100 hover:text-gray-800`}
            >
              <item.icon className={`w-5 h-5 ${item.color}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="mt-8">
        <div className="flex items-center space-x-3 mb-4 px-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-gray-800 text-sm font-bold">{user?.user_metadata?.full_name || user?.email}</p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>
        </div>
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50">
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
