import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from '@/lib/utils'; 

const ALL_PERMISSIONS = [
    { id: 'consultas', label: 'Consultas' },
    { id: 'vacinas', label: 'Vacinas' },
    { id: 'medicamentos', label: 'Medicamentos' },
    { id: 'alimentacao', label: 'Alimentação' },
    { id: 'peso', label: 'Peso' },
    { id: 'galeria', label: 'Galeria de Fotos' },
];

const EditVetAccessDialog = ({ open, onOpenChange, onAccessUpdated, accessDetails, className }) => {
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (accessDetails) {
      setSelectedPermissions(accessDetails.permissions || []);
    }
  }, [accessDetails]);

  if (!accessDetails) return null;

  const handlePermissionChange = (permissionId) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const { error } = await supabase
            .from('vet_access')
            .update({ permissions: selectedPermissions })
            .eq('id', accessDetails.id);

        if (error) throw error;

        toast({
            title: 'Permissões atualizadas!',
            description: 'As permissões de acesso do veterinário foram salvas.',
        });
        onAccessUpdated();
        onOpenChange(false);
    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Erro ao atualizar permissões',
            description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Editar Acesso de {accessDetails.name}</DialogTitle>
          <DialogDescription>
            Gerencie as permissões de acesso para o pet {accessDetails.pet}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <Label>Permissões</Label>
            <div className="space-y-2">
                {ALL_PERMISSIONS.map(permission => (
                    <div key={permission.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={`perm-${permission.id}`}
                            checked={selectedPermissions.includes(permission.id)}
                            onCheckedChange={() => handlePermissionChange(permission.id)}
                        />
                        <label
                            htmlFor={`perm-${permission.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            {permission.label}
                        </label>
                    </div>
                ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVetAccessDialog;