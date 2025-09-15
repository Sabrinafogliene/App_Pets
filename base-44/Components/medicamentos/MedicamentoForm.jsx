import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pill, Save, X } from 'lucide-react';
import { Switch } from "@/components/ui/switch";

export default function MedicamentoForm({ pets, medicamento, onSave, onCancel }) {
  const [formData, setFormData] = useState(medicamento || {
    pet_id: "",
    nome: "",
    dosagem: "",
    frequencia: "",
    data_inicio: new Date().toISOString().split('T')[0],
    data_fim: "",
    instrucoes: "",
    ativo: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Pill className="w-6 h-6 text-orange-500" />
          {medicamento ? 'Editar Medicamento' : 'Novo Medicamento'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select value={formData.pet_id} onValueChange={(v) => handleInputChange('pet_id', v)} required>
                <SelectTrigger><SelectValue placeholder="Selecione o pet" /></SelectTrigger>
                <SelectContent>{pets.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nome">Nome do Medicamento *</Label>
              <Input id="nome" value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dosagem">Dosagem</Label>
              <Input id="dosagem" value={formData.dosagem} onChange={(e) => handleInputChange('dosagem', e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="frequencia">Frequência</Label>
              <Input id="frequencia" value={formData.frequencia} onChange={(e) => handleInputChange('frequencia', e.target.value)} placeholder="Ex: A cada 12 horas" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="data_inicio">Data de Início *</Label>
              <Input id="data_inicio" type="date" value={formData.data_inicio} onChange={(e) => handleInputChange('data_inicio', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="data_fim">Data de Fim</Label>
              <Input id="data_fim" type="date" value={formData.data_fim} onChange={(e) => handleInputChange('data_fim', e.target.value)} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="instrucoes">Instruções</Label>
            <Textarea id="instrucoes" value={formData.instrucoes} onChange={(e) => handleInputChange('instrucoes', e.target.value)} />
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="ativo" checked={formData.ativo} onCheckedChange={(c) => handleInputChange('ativo', c)} />
            <Label htmlFor="ativo">Tratamento Ativo</Label>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}><X className="w-4 h-4 mr-2" />Cancelar</Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-orange-500 to-amber-500"><Save className="w-4 h-4 mr-2" />{isSaving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}