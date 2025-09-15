import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Users, Mail, Edit, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AcessoCard({ acesso, pet, onEdit, onToggleAccess }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{acesso.nome_veterinario}</CardTitle>
        <Switch checked={acesso.ativo} onCheckedChange={onToggleAccess} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600 flex items-center gap-2"><PawPrint className="w-4 h-4"/>{pet?.nome || 'Pet não encontrado'}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2"><Mail className="w-4 h-4"/>{acesso.email_veterinario}</div>
        <div className="text-sm text-gray-600">Concedido em: {format(new Date(acesso.data_concessao), 'dd/MM/yyyy', { locale: ptBR })}</div>
        <div className="flex flex-wrap gap-1 mt-2">
          {acesso.permissoes?.map(perm => (
            <Badge key={perm} variant="outline" className="text-xs">{perm}</Badge>
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(acesso)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
        </div>
      </CardContent>
    </Card>
  );
}