import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { cn } from "@/lib/utils";

const NewVetAccessDialog = ({ open, onOpenChange, onAccessGranted, pets, className }) => {
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [vetEmail, setVetEmail] = useState('');
  const [petId, setPetId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !petId || !vetEmail) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todos os campos.' });
      return;
    }
    setIsLoading(true);

    try {
      // 1. Check if user exists
      const { data: vetUserData, error: rpcError } = await supabase.rpc('get_user_by_email', { p_email: vetEmail });

      if (rpcError) throw rpcError;

      // 2. If user does NOT exist, send an invitation
      if (!vetUserData) {
        const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(vetEmail, {
          data: {
            user_type: 'veterinario',
            initial_pet_access: petId,
            tutor_id: user.id
          },
          redirectTo: `${window.location.origin}/signup`
        });

        if (inviteError) {
          if (inviteError.message.includes('User already registered')) {
            toast({ variant: 'destructive', title: 'Erro', description: 'Este e-mail já está cadastrado, mas pode não ser um veterinário. Peça para ele verificar.' });
          } else {
            throw inviteError;
          }
        } else {
          toast({
            title: 'Convite Enviado!',
            description: `Um e-mail de convite foi enviado para ${vetEmail}. O acesso será concedido após o cadastro.`,
            className: 'bg-green-500 text-white'
          });
        }
      } else {
        // 3. If user EXISTS, grant access directly via RPC
        const userType = vetUserData.raw_user_meta_data?.user_type;
        if (userType !== 'veterinario') {
          toast({ variant: 'destructive', title: 'Erro', description: 'O e-mail informado não pertence a um veterinário cadastrado.' });
          setIsLoading(false);
          return;
        }

        const { error: grantError } = await supabase.rpc('grant_vet_access', {
          p_vet_email: vetEmail,
          p_pet_id: petId,
          p_tutor_id: user.id
        });

        if (grantError) throw grantError;

        toast({
          title: 'Acesso Concedido!',
          description: `O veterinário ${vetEmail} agora tem acesso ao seu pet.`,
          className: 'bg-green-500 text-white'
        });
      }

      onAccessGranted();
      onOpenChange(false);
      setVetEmail('');
      setPetId('');

    } catch (error) {
      console.error("Error granting access:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Conceder Acesso',
        description: error.message || 'Ocorreu um erro inesperado. Tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-[425px]", className)}>
        <DialogHeader>
          <DialogTitle className="text-primary">Conceder Acesso ao Veterinário</DialogTitle>
          <DialogDescription>
            Digite o e-mail do veterinário e selecione o pet para compartilhar as informações.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pet_id" className="text-right">Pet</Label>
              <Select onValueChange={setPetId} value={petId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map(pet => <SelectItem key={pet.id} value={pet.id}>{pet.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vet_email" className="text-right">E-mail do Vet</Label>
              <Input id="vet_email" type="email" value={vetEmail} onChange={(e) => setVetEmail(e.target.value)} className="col-span-3" placeholder="email@vet.com" required />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Processando...' : 'Conceder Acesso'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewVetAccessDialog;