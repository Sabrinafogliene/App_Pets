import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Stethoscope, 
  PawPrint, 
  Calendar, 
  FileText, 
  Users, 
  LogOut,
  User,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/customSupabaseClient';

const VetDashboard = () => {
  const { user, signOut } = useAuth();
  const { pets, loading, fetchData } = useData();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (user) {
      const getProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(data);
      };
      getProfile();
      fetchData();
    }
  }, [user, fetchData]);

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login');
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até logo!",
      });
    }
  };

  const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/vet/dashboard', color: 'text-blue-500', bgColor: 'bg-blue-100' },
    { icon: Users, label: 'Pacientes', href: '#', color: 'text-pink-500', bgColor: 'bg-pink-100' },
    { icon: Calendar, label: 'Agenda', href: '#', color: 'text-green-500', bgColor: 'bg-green-100' },
    { icon: FileText, label: 'Prontuários', href: '#', color: 'text-purple-500', bgColor: 'bg-purple-100' },
  ];

  const handleSidebarClick = (href) => {
    if (href === '#') {
      toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
      });
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-64 sidebar p-4 lg:p-6 flex-shrink-0 flex flex-col"
      >
        <div>
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-gray-800 font-bold text-lg">PetCare+ Vet</h2>
            </div>
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSidebarClick(item.href)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                  item.href === '/vet/dashboard'
                    ? `${item.bgColor} ${item.color}`
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>

        <div className="mt-auto pt-8 hidden lg:block">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-gray-800 text-sm font-bold">{profile?.full_name}</p>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-gray-500 hover:text-red-500 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </motion.div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 relative">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-1">Portal do Veterinário</h1>
              <p className="text-gray-500">Bem-vindo(a), {profile?.full_name}!</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100" onClick={() => toast({ title: "🚧 Funcionalidade em breve!" })}>
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[
              { title: 'Pacientes com Acesso', value: pets.length, icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-100' },
              { title: 'Consultas Hoje', value: 0, icon: Calendar, color: 'text-green-500', bgColor: 'bg-green-100' },
              { title: 'Prontuários Ativos', value: 0, icon: FileText, color: 'text-purple-500', bgColor: 'bg-purple-100' },
            ].map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (index + 1) }}>
                <Card className="stat-card shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</p>
                      </div>
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <PawPrint className="w-6 h-6 mr-2" />
              Pacientes com Acesso Autorizado ({pets.length})
            </h2>

            {loading ? (
              <div className="text-center text-gray-500 py-10">Carregando pacientes...</div>
            ) : pets.length === 0 ? (
              <Card className="border-dashed border-2">
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum paciente autorizado</h3>
                  <p className="text-gray-500">Aguarde os tutores concederem acesso aos dados dos pets.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pets.map((pet, index) => (
                  <motion.div key={pet.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }}>
                    <Card className="pet-card cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                            <PawPrint className="w-8 h-8 text-blue-500 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                            <p className="text-gray-500">{pet.species} • {pet.breed}</p>
                            <p className="text-gray-400 text-sm">{pet.age} • {pet.weight}kg</p>
                          </div>
                        </div>
                        <div className="flex justify-end items-center">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => toast({ title: "🚧 Funcionalidade em breve!" })}>
                            Ver Prontuário
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default VetDashboard;