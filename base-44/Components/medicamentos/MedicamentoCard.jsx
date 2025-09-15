import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pill, Calendar, Edit, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MedicamentoCard({ medicamento, petName, onEdit }) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <CardTitle className="text-lg font-semibold">{medicamento.nome}</CardTitle>
        <Badge variant={medicamento.ativo ? "default" : "outline"}>{medicamento.ativo ? 'Ativo' : 'Finalizado'}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-gray-600 flex items-center gap-2"><PawPrint className="w-4 h-4"/>{petName}</div>
        <p><strong>Dosagem:</strong> {medicamento.dosagem}</p>
        <p><strong>Frequência:</strong> {medicamento.frequencia}</p>
        <div className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/>Início: {format(new Date(medicamento.data_inicio), 'dd/MM/yyyy', { locale: ptBR })}</div>
        {medicamento.data_fim && <div className="text-sm text-gray-600 flex items-center gap-2"><Calendar className="w-4 h-4"/>Fim: {format(new Date(medicamento.data_fim), 'dd/MM/yyyy', { locale: ptBR })}</div>}
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(medicamento)}><Edit className="w-4 h-4 mr-2" />Editar</Button>
        </div>
      </CardContent>
    </Card>
  );
}