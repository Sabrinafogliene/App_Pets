import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Users, Save, X } from 'lucide-react';

export default function AcessoForm({ pets, acesso, onSave, onCancel }) {
  const [formData, setFormData] = useState(acesso || {
    pet_id: "",
    email_veterinario: "",
    nome_veterinario: "",
    data_concessao: new Date().toISOString().split('T')[0],
    permissoes: ["vacinacoes", "consultas"],
    ativo: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  const permissoesDisponiveis = [
    { id: 'vacinacoes', label: 'Vacinas' },
    { id: 'consultas', label: 'Consultas' },
    { id: 'medicamentos', label: 'Medicamentos' },
    { id: 'peso', label: 'Controle de Peso' },
    { id: 'fotos', label: 'Galeria de Fotos' },
    { id: 'historico_medico', label: 'Histórico Médico' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permissao, checked) => {
    setFormData(prev => ({
      ...prev,
      permissoes: checked 
        ? [...prev.permissoes, permissao]
        : prev.permissoes.filter(p => p !== permissao)
    }));
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
          <Users className="w-6 h-6 text-cyan-500" />
          {acesso ? 'Editar Acesso' : 'Conceder Acesso'}
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
              <Label htmlFor="nome_veterinario">Nome do Veterinário *</Label>
              <Input id="nome_veterinario" value={formData.nome_veterinario} onChange={(e) => handleInputChange('nome_veterinario', e.target.value)} required />
            </div>
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="email_veterinario">Email do Veterinário *</Label>
              <Input id="email_veterinario" type="email" value={formData.email_veterinario} onChange={(e) => handleInputChange('email_veterinario', e.target.value)} required />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Permissões Concedidas</Label>
            <div className="grid grid-cols-2 gap-3">
              {permissoesDisponiveis.map(perm => (
                <div key={perm.id} className="flex items-center space-x-2">
                  <Checkbox 
                    id={perm.id}
                    checked={formData.permissoes.includes(perm.id)}
                    onCheckedChange={(checked) => handlePermissionChange(perm.id, checked)}
                  />
                  <Label htmlFor={perm.id} className="text-sm">{perm.label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}><X className="w-4 h-4 mr-2" />Cancelar</Button>
            <Button type="submit" disabled={isSaving} className="bg-gradient-to-r from-cyan-500 to-sky-500"><Save className="w-4 h-4 mr-2" />{isSaving ? "Salvando..." : "Salvar"}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}