import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Syringe, Calendar, Edit, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function VacinacaoCard({ vacinacao, petName, onEdit }) {
  const statusInfo = {
    em_dia: { label: 'Em Dia', color: 'bg-green-100 text-green-800' },
    proximo_vencimento: { label: 'Venc. Próximo', color: 'bg-yellow-100 text-yellow-800' },
    atrasada: { label: 'Atrasada', color: 'bg-red-100 text-red-800' },
  }[vacinacao.status];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{vacinacao.nome_vacina}</CardTitle>
        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600 flex items-center gap-2"><PawPrint className="w-4 h-4"/>{petName}</div>
        <div className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/>Aplicada em: {format(new Date(vacinacao.data_aplicacao), 'dd/MM/yyyy', { locale: ptBR })}</div>
        {vacinacao.proxima_dose && (
          <div className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4 text-red-500"/>Próxima dose: {format(new Date(vacinacao.proxima_dose), 'dd/MM/yyyy', { locale: ptBR })}</div>
        )}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(vacinacao)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
        </div>
      </CardContent>
    </Card>
  );
}