import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Save, X } from 'lucide-react';

export default function ConsultaForm({ pets, consulta, onSave, onCancel }) {
  const [formData, setFormData] = useState(consulta || {
    pet_id: "",
    data: new Date().toISOString().slice(0, 16),
    veterinario: "",
    nome_clinica: "",
    motivo: "",
    diagnostico: "",
    tratamento: "",
    status: "agendada",
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
    <Card className="bg-white/90 backdrop-blur-sm shadow-2xl max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calendar className="w-6 h-6 text-purple-500" />
          {consulta ? 'Editar Consulta' : 'Nova Consulta'}
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
              <Label htmlFor="data">Data e Hora *</Label>
              <Input id="data" type="datetime-local" value={formData.data} onChange={(e) => handleInputChange('data', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="veterinario">Veterinário *</Label>
              <Input id="veterinario" value={formData.veterinario} onChange={(e) => handleInputChange('veterinario', e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="nome_clinica">Clínica</Label>
              <Input id="nome_clinica" value={formData.nome_clinica} onChange={(e) => handleInputChange('nome_clinica', e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="motivo">Motivo</Label>
              <Input id="motivo" value={formData.motivo} onChange={(e) => handleInputChange('motivo', e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="diagnostico">Diagnóstico</Label>
              <Textarea id="diagnostico" value={formData.diagnostico} onChange={(e) => handleInputChange('diagnostico', e.target.value)} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="tratamento">Tratamento</Label>
              <Textarea id="tratamento" value={formData.tratamento} onChange={(e) => handleInputChange('tratamento', e.target.value)} />
            </div>
             <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(v) => handleInputChange('status', v)}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}><X className="w-4 h-4 mr-2" />Cancelar</Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-purple-500 to-indigo-500"><Save className="w-4 h-4 mr-2" />{isSaving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}