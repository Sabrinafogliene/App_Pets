import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Plus, 
  PawPrint, 
  Syringe, 
  Calendar, 
  Pill, 
  Weight, 
  Camera, 
  LogOut,
  User,
  Bone,
  UserPlus,
  Activity,
  Bell,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/components/ui/use-toast';
import AddPetDialog from '@/components/AddPetDialog';
import { supabase } from '@/lib/customSupabaseClient';

const TutorDashboard = () => {
  const [showAddPet, setShowAddPet] = useState(false);
  const { user, signOut } = useAuth();
  const { pets, vaccines, consultations, medications, loading, fetchData } = useData();
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

  const getRecentActivities = () => {
    const allActivities = [
      ...vaccines.map(v => ({...v, type: 'Vacina', icon: Syringe, color: 'text-green-500'})),
      ...consultations.map(c => ({...c, name: c.type, type: 'Consulta', icon: Calendar, color: 'text-blue-500'})),
      ...medications.map(m => ({...m, date: m.created_at, type: 'Medicamento', icon: Pill, color: 'text-red-500'})),
    ];
    return allActivities.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  }

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

  const handleSidebarClick = (href, label) => {
    if (href === '#') {
      toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
      });
    } else {
      navigate(href);
    }
  };
  
  const handleQuickAction = (action) => {
    if (action === 'pet') {
      setShowAddPet(true);
    } else {
       toast({
        title: "🚧 Esta funcionalidade ainda não foi implementada—mas não se preocupe! Você pode solicitá-la no seu próximo prompt! 🚀"
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full lg:w-64 sidebar p-4 lg:p-6 flex-shrink-0 flex flex-col"
      >
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
            {sidebarItems.map((item, index) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSidebarClick(item.href, item.label)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                  item.href === '/tutor/dashboard'
                    ? `${item.bgColor} ${item.color}`
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                }`}
              >
                <item.icon className={`w-5 h-5`} />
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 relative overflow-y-auto">
        <div className="color-blob w-96 h-96 bg-purple-500 top-[-100px] left-[-100px]"></div>
        <div className="color-blob w-96 h-96 bg-pink-500 bottom-[-150px] right-[-150px] animation-delay-2000"></div>
        <div className="color-blob w-72 h-72 bg-yellow-400 top-[50%] left-[50%] animation-delay-4000"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard PetCare+</h1>
            <p className="text-gray-500">Acompanhe a saúde e bem-estar dos seus pets em um só lugar</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { title: 'Pets Cadastrados', value: pets.length, icon: PawPrint, color: 'text-pink-500', circleColor: 'bg-pink-100' },
              { title: 'Vacinas em Dia', value: vaccines.length, icon: Syringe, color: 'text-green-500', circleColor: 'bg-green-100' },
              { title: 'Consultas Agendadas', value: consultations.length, icon: Calendar, color: 'text-blue-500', circleColor: 'bg-blue-100' },
              { title: 'Tratamentos Ativos', value: medications.filter(m=>m.active).length, icon: Pill, color: 'text-red-500', circleColor: 'bg-red-100' },
            ].map((stat, index) => (
              <motion.div key={stat.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * (index + 1) }}>
                <Card className="stat-card-new">
                  <CardContent className="p-0 flex items-center space-x-4">
                    <div className={`w-16 h-16 ${stat.circleColor} rounded-full flex items-center justify-center`}>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-gray-800">{loading ? '...' : stat.value}</p>
                      <p className="text-gray-500 text-sm">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                 <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center"><PawPrint className="w-6 h-6 mr-3" />Meus Pets ({pets.length})</h2>
                  <Button onClick={() => setShowAddPet(true)} className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" />Novo Pet</Button>
                </div>
                {loading ? (
                  <div className="text-center text-gray-500 py-10">Carregando pets...</div>
                ) : pets.length === 0 ? (
                  <Card className="border-dashed border-2 bg-white/50 backdrop-blur-sm"><CardContent className="p-12 text-center"><PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" /><h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum pet cadastrado</h3><p className="text-gray-500 mb-6">Comece adicionando seu primeiro pet!</p><Button onClick={() => setShowAddPet(true)} className="bg-purple-600 hover:bg-purple-700 text-white"><Plus className="w-4 h-4 mr-2" />Adicionar Pet</Button></CardContent></Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pets.map((pet, index) => (
                      <motion.div key={pet.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} onClick={() => navigate(`/pet/${pet.id}`)} className="cursor-pointer group">
                        <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
                          <CardContent className="p-4 flex items-center space-x-4">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0"><PawPrint className="w-8 h-8 text-purple-500"/></div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-800">{pet.name}</h3>
                              <p className="text-gray-500 text-sm">{pet.breed}</p>
                              <div className="flex space-x-2 mt-1">
                                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">{pet.age}</span>
                                <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">{pet.weight}kg</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <Card className="bg-white/50 backdrop-blur-sm shadow-sm h-full">
                  <CardHeader><CardTitle className="flex items-center"><Clock className="w-5 h-5 mr-3"/>Próximos Lembretes</CardTitle></CardHeader>
                  <CardContent><div className="text-center text-gray-500 py-6"><Bell className="w-8 h-8 mx-auto text-gray-400 mb-2"/><p>Nenhum lembrete próximo.</p></div></CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                  <CardHeader><CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-3"/>Atividades Recentes</CardTitle></CardHeader>
                  <CardContent>
                    {getRecentActivities().length === 0 ? (
                      <div className="text-center text-gray-500 py-6"><Activity className="w-8 h-8 mx-auto text-gray-400 mb-2"/><p>Nenhuma atividade recente.</p></div>
                    ) : (
                      <div className="space-y-4">
                        {getRecentActivities().map(activity => (
                          <div key={activity.id} className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-500', '-100')}`}>
                              <activity.icon className={`w-5 h-5 ${activity.color}`}/>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">{activity.type}: {activity.name}</p>
                                <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                 <Card className="bg-white/50 backdrop-blur-sm shadow-sm">
                  <CardHeader><CardTitle className="flex items-center"><Plus className="w-5 h-5 mr-3"/>Ações Rápidas</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                      <Button onClick={() => handleQuickAction('pet')} className="quick-action-button text-gray-700 h-20 flex-col gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"><Plus className="w-5 h-5 mb-1"/>Novo Pet</Button>
                      <Button onClick={() => handleQuickAction('vaccine')} className="quick-action-button text-gray-700 h-20 flex-col gap-1 text-green-600 border-green-200 hover:bg-green-50"><Syringe className="w-5 h-5 mb-1"/>Vacina</Button>
                      <Button onClick={() => handleQuickAction('consultation')} className="quick-action-button text-gray-700 h-20 flex-col gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"><Calendar className="w-5 h-5 mb-1"/>Consulta</Button>
                      <Button onClick={() => handleQuickAction('weight')} className="quick-action-button text-gray-700 h-20 flex-col gap-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"><Weight className="w-5 h-5 mb-1"/>Peso</Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
      <AddPetDialog open={showAddPet} onOpenChange={setShowAddPet} />
    </div>
  );
};

export default TutorDashboard;