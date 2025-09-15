import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Stethoscope, Edit, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ConsultaCard({ consulta, petName, onEdit }) {
  const statusInfo = {
    agendada: { label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
    concluida: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
    cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-800' },
  }[consulta.status];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div>
            <CardTitle className="text-lg flex items-center gap-2"><Stethoscope className="w-5 h-5"/>{consulta.veterinario}</CardTitle>
            <p className="text-sm text-gray-500">{consulta.nome_clinica}</p>
        </div>
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm font-medium">{consulta.motivo}</p>
        <div className="text-sm text-gray-600 flex items-center gap-2"><PawPrint className="w-4 h-4"/>{petName}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/>{format(new Date(consulta.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</div>
        {consulta.diagnostico && <p className="text-sm text-gray-500 border-t pt-2 mt-2"><strong>Diagnóstico:</strong> {consulta.diagnostico}</p>}
        {consulta.tratamento && <p className="text-sm text-gray-500"><strong>Tratamento:</strong> {consulta.tratamento}</p>}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onEdit(consulta)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
        </div>
      </CardContent>
    </Card>
  );
}