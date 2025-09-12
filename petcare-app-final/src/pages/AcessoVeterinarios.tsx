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

// ... (Componente AcessoForm que já temos)

const AcessoVeterinarios = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAcesso, setEditingAcesso] = useState<any>(null);
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = ['petAuthorizations', user?.id];

  const { data: pets = [] } = useQuery({ 
      queryKey: ['pets', user?.id], 
      queryFn: async () => { /* ... */ return []; }, 
      enabled: !!user 
  });

  const { data: acessos = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('pet_authorizations').select('*, pets(id, nome), profiles(nome, email)').eq('tutor_user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
  
  // ... (todas as suas 'mutations' - add, update, delete, toggle)

  return (
    <Layout>
      <div className="space-y-6">
        {/* ... (Seu JSX do Header) ... */}
        
        {isLoading && <p>Carregando...</p>}

        {!isLoading && acessos.length === 0 ? (
          <Card><CardContent className="p-12 text-center"><UserCheck className="w-16 h-16 mx-auto mb-4" /><h3 className="font-semibold">Nenhum acesso concedido</h3></CardContent></Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {acessos.map(acesso => (
              <Card key={acesso.id}>
                <CardContent className="p-6">
                  {/* Adicionamos verificações para evitar o erro 'toLowerCase' */}
                  <h3 className="font-semibold">{acesso.profiles?.nome || 'Convite Pendente'}</h3>
                  <p className="text-sm">{acesso.pets?.nome || 'Pet não encontrado'}</p>
                  <Badge variant={acesso.status === 'active' ? 'default' : 'secondary'}>{acesso.status}</Badge>
                  {/* ... Resto do card ... */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        
        {/* ... (Seu JSX do Dialog) ... */}
      </div>
    </Layout>
  );
};

export default AcessoVeterinarios;