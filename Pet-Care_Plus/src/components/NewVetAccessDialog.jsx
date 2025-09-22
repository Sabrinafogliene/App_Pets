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
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [vetEmail, setVetEmail] = useState('');
  const [petId, setPetId] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !session?.access_token || !petId || !vetEmail) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Por favor, preencha todos os campos e faça login novamente.' });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch('https://axavdsrihemzsamnwgcf.supabase.co/functions/v1/invite-vet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          vet_email: vetEmail,
          pet_id: petId,
          tutor_id: user.id
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro desconhecido.');
      }
      toast({
        title: data.status === 'invitation_sent' ? 'Convite Enviado!' : 'Acesso Concedido!',
        description: data.message,
        className: 'bg-green-500 text-white'
      });
       
      onAccessGranted();
      onOpenChange(false);
      setVetEmail('');
      setPetId('');

    } catch (error) {
      console.error("Error granting access:", error);
      toast({
        variant: 'destructive',
        title: 'Erro ao Conceder Acesso',
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