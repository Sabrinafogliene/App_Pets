// Copie e cole este código em: src/pages/AcessoVeterinarios.tsx
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { Plus, UserCheck, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AcessoForm = ({ pets, initialData, isEdit = false, onSubmit, onCancel }: { pets: any[], initialData?: any, isEdit?: boolean, onSubmit: (data: any) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState({
        email: initialData?.profiles?.email || '',
        pet_id: initialData?.pets?.id || '',
        permissoes: initialData?.authorized_data || [],
        expires_at: initialData?.expires_at?.split('T')[0] || ''
    });

    const availablePermissions = ['vacinas', 'consultas', 'medicamentos', 'peso', 'alimentacao', 'galeria'];
    const getPermissaoLabel = (p: string) => ({'vacinas':'Vacinas','consultas':'Consultas','medicamentos':'Medicamentos','peso':'Peso','alimentacao':'Alimentação','galeria':'Galeria'}[p]||p);

    const handlePermissaoChange = (permissao: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, permissoes: checked ? [...prev.permissoes, permissao] : prev.permissoes.filter(p => p !== permissao) }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && (<div><Label htmlFor="email">Email do Veterinário *</Label><Input id="email" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value.trim() }))} placeholder="veterinario@exemplo.com" required /><p className="text-xs text-muted-foreground mt-1">Se não for cadastrado, um convite será enviado.</p></div>)}
            <div><Label htmlFor="pet_id">Pet *</Label><Select value={formData.pet_id} onValueChange={(v) => setFormData(p => ({ ...p, pet_id: v }))} disabled={isEdit} required><SelectTrigger><SelectValue placeholder="Selecionar pet" /></SelectTrigger><SelectContent>{pets.map((pet) => (<SelectItem key={pet.id} value={pet.id}>{pet.nome}</SelectItem>))}</SelectContent></Select></div>
            <div><Label>Permissões</Label><div className="grid grid-cols-2 gap-2 mt-2">{availablePermissions.map(p => (<div key={p} className="flex items-center space-x-2"><Checkbox id={p} checked={formData.permissoes.includes(p)} onCheckedChange={(c)=>handlePermissaoChange(p,c as boolean)} /><Label htmlFor={p} className="text-sm font-normal">{getPermissaoLabel(p)}</Label></div>))}</div></div>
            <div><Label htmlFor="expires_at">Data de Expiração (opcional)</Label><Input id="expires_at" type="date" value={formData.expires_at} onChange={(e) => setFormData(p => ({ ...p, expires_at: e.target.value }))} /></div>
            <div className="flex space-x-2 pt-2"><Button type="button" variant="outline" className="w-full" onClick={onCancel}>Cancelar</Button><Button type="submit" className="w-full">{isEdit ? 'Atualizar' : 'Conceder Acesso'}</Button></div>
        </form>
    );
};

const AcessoVeterinarios = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAcesso, setEditingAcesso] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = ['petAuthorizations', user?.id];

  const { data: pets = [] } = useQuery({ queryKey: ['pets', user?.id], queryFn: async () => { const { data, error } = await supabase.from('pets').select('id, nome').eq('user_id', user!.id); if (error) throw error; return data; }, enabled: !!user });

  const { data: acessos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase.from('pet_authorizations').select('*, pets(id, nome), profiles(nome, email)').eq('tutor_user_id', user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  const mutationOptions = {
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey });
          setIsDialogOpen(false);
          setEditingAcesso(null);
      },
      onError: (error: any) => toast.error(`Erro: ${error.message}`)
  };

  const addAcessoMutation = useMutation({
      ...mutationOptions,
      mutationFn: async (data: any) => {
        const { data: vetProfileId, error: rpcError } = await supabase.rpc('get_vet_profile_id_by_email', { vet_email: data.email });
        if (rpcError) throw rpcError;

        if (vetProfileId) {
            const { error } = await supabase.from('pet_authorizations').insert({ tutor_user_id: user?.id, veterinario_profile_id: vetProfileId, pet_id: data.pet_id, authorized_data: data.permissoes, status: 'active', expires_at: data.expires_at || null });
            if (error) throw error;
            toast.success('Acesso concedido com sucesso!');
        } else {
            const { error } = await supabase.from('convites_pendentes').insert({ tutor_user_id: user?.id, pet_id: data.pet_id, veterinario_email: data.email, authorized_data: data.permissoes, expires_at: data.expires_at || null });
            if (error) throw error;
            toast.info('Veterinário não cadastrado. Um convite será enviado por email.');
        }
      }
  });
  
  // As outras mutações (update, delete, toggle) continuam aqui...
  
  return (
    <Layout>
      {/* O resto do seu JSX para a página... */}
    </Layout>
  );
};

export default AcessoVeterinarios;