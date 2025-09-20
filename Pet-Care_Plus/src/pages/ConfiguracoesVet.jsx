
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ConfiguracoesVet = () => {
  const { user, supabase } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    crmv: '',
    clinic: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, crmv, clinic')
        .eq('id', user.id)
        .single();

      if (error) {
        toast({ variant: 'destructive', title: 'Erro ao buscar perfil', description: error.message });
      } else if (data) {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, supabase, toast]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        crmv: profile.crmv,
        clinic: profile.clinic,
      })
      .eq('id', user.id);
    
    const { error: userError } = await supabase.auth.updateUser({
        data: { full_name: profile.full_name }
    })

    if (error || userError) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error?.message || userError?.message });
    } else {
      toast({ title: 'Sucesso!', description: 'Seu perfil foi atualizado.' });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-blue-600 mb-2">Configurações</h1>
        <p className="text-gray-600">Gerencie suas informações de perfil e preferências.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-xl p-6 card-shadow max-w-2xl mx-auto"
      >
        {loading ? (
          <p>Carregando perfil...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input id="full_name" value={profile.full_name} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="crmv">CRMV</Label>
              <Input id="crmv" value={profile.crmv} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="clinic">Clínica/Hospital</Label>
              <Input id="clinic" value={profile.clinic || ''} onChange={handleInputChange} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ConfiguracoesVet;
