
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, UserCheck, PawPrint, Mail, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import NewVetAccessDialog from '@/components/NewVetAccessDialog';
import EditVetAccessDialog from '@/components/EditVetAccessDialog';

const AcessoVeterinarios = () => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [accessList, setAccessList] = useState([]);
  const [myPets, setMyPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isGrantAccessOpen, setIsGrantAccessOpen] = useState(false);
  const [isEditAccessOpen, setIsEditAccessOpen] = useState(false);
  const [selectedAccess, setSelectedAccess] = useState(null);

  const fetchAccessList = async () => {
    if (!user) return;
    setLoading(true);

    const { data: petsData, error: petsError } = await supabase
      .from('pets')
      .select('id, name')
      .eq('user_id', user.id);

    if (petsError) {
      toast({ variant: 'destructive', title: 'Erro ao buscar pets.' });
    } else {
      setMyPets(petsData || []);
    }

    const { data, error } = await supabase
      .from('vet_access')
      .select(`
        id,
        created_at,
        permissions,
        is_active,
        vet_id, 
        pet:pets(name, species, file_path)
        vet:profiles(full_name, email)
      `)
      .eq('tutor_id', user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao buscar acessos",
        description: error.message,
      });
      console.error("Erro na busca principal:", error);
      setAccessList([]);
    } else {
      // Busca os nomes dos veterinários pelo email
      const formattedAccessList = (data || []).map(item => {
        const vetProfile = item.vet;
        
        return {
          id: item.id,
          name: item.vet?.full_name || 'Veterinário (Perfil Pendente)',
          pet: item.pet?.name || 'Pet não encontrado',
          email: item.vet?.email || 'E-mail não disponível',
          grantedDate: new Date(item.created_at).toLocaleDateString('pt-BR'),
          permissions: item.permissions || [],
          isActive: item.is_active,
          vet_id: item.vet_id
        };
      });
      setAccessList(formattedAccessList);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && supabase) {
      fetchAccessList();
    }
  }, [supabase, user]);

  const handleEdit = (vetAccess) => {
    setSelectedAccess(vetAccess);
    setIsEditAccessOpen(true);
  };
  
  const handleToggleActive = async (accessId, currentStatus) => {
    const newStatus = !currentStatus;
    
    setAccessList(prev => prev.map(item => item.id === accessId ? { ...item, isActive: newStatus } : item));

    const { error } = await supabase
      .from('vet_access')
      .update({ is_active: newStatus })
      .eq('id', accessId);

    if (error) {
      
      setAccessList(prev => prev.map(item => item.id === accessId ? { ...item, isActive: currentStatus } : item));
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar status',
        description: error.message,
      });
    } else {
      toast({
        title: `Acesso ${newStatus ? 'habilitado' : 'desabilitado'}!`,
      });
    }
  };


  const getPermissionLabel = (permission) => {
    const labels = {
      vacinacoes: 'Vacinações',
      consultas: 'Consultas',
      medicamentos: 'Medicamentos',
      alimentacao: 'Alimentação',
      peso: 'Peso',
      galeria: 'Galeria de Fotos',
    };
    return labels[permission] || permission;
  };

  return (
    <div className="space-y-6 vet-theme">
      <NewVetAccessDialog
        open={isGrantAccessOpen}
        onOpenChange={setIsGrantAccessOpen}
        onAccessGranted={fetchAccessList}
        pets={myPets}
        className="vet-theme"
        
      />
      <EditVetAccessDialog
        open={isEditAccessOpen}
        onOpenChange={setIsEditAccessOpen}
        onAccessUpdated={fetchAccessList}
        accessDetails={selectedAccess}
        className="vet-theme"
        
      />
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl md:text-3xl font-bold text-cyan-600 mb-2">Acesso de Veterinários</h1>
          <p className="text-gray-600">Compartilhe o histórico do seu pet com profissionais</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex justify-end"
        >
          <Button onClick={() => setIsGrantAccessOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Conceder Acesso
          </Button>
        </motion.div>

        {loading ? (
          <div className="text-center py-8">Carregando lista de acessos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accessList.map((vet, index) => (
              <motion.div
                key={vet.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                      <UserCheck className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{vet.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Switch checked={vet.isActive} onCheckedChange={() => handleToggleActive(vet.id, vet.isActive)} />
                        <span className="text-xs text-gray-500">{vet.isActive ? 'Ativo' : 'Inativo'}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(vet)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <PawPrint className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{vet.pet}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 truncate">{vet.email}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Concedido em: {vet.grantedDate}
                  </div>
                  
                  <div className="mt-4">
                     <h4 className="text-sm font-medium text-gray-800 mb-2">Permissões</h4>
                     <div className="flex flex-wrap gap-1">
                        {(vet.permissions && vet.permissions.length > 0) ? vet.permissions.map((permission, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full"
                          >
                            {getPermissionLabel(permission)}
                          </span>
                        )) : (
                          <span className="text-xs text-gray-500">Nenhuma permissão específica.</span>
                        )}
                      </div>
                  </div>

                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcessoVeterinarios;
