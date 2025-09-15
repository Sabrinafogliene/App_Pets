import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/integrations/Core";
import { Camera, Upload, Save, X } from "lucide-react";

export default function FotoForm({ pets, foto, onSave, onCancel }) {
  const [formData, setFormData] = useState(foto || {
    pet_id: "",
    url_foto: "",
    titulo: "",
    data_foto: new Date().toISOString().split('T')[0],
    categoria: "diversao"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      handleInputChange('url_foto', file_url);
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-2xl max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Camera className="w-6 h-6 text-teal-500" />
          {foto ? 'Editar Foto' : 'Nova Foto'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center">
              {isUploading ? (
                <p>Enviando...</p>
              ) : formData.url_foto ? (
                <img src={formData.url_foto} alt="Preview" className="w-full h-full object-contain rounded-lg" />
              ) : (
                <Camera className="w-12 h-12 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="foto-upload">Upload da Foto *</Label>
            <Input
              id="foto-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              required={!formData.url_foto}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pet_id">Pet *</Label>
              <Select
                value={formData.pet_id}
                onValueChange={(value) => handleInputChange('pet_id', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id}>
                      {pet.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => handleInputChange('categoria', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diversao">🎉 Diversão</SelectItem>
                  <SelectItem value="medica">🏥 Médica</SelectItem>
                  <SelectItem value="marco">🎂 Marco</SelectItem>
                  <SelectItem value="outra">📸 Outra</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => handleInputChange('titulo', e.target.value)}
              placeholder="Ex: Primeiro dia na praia!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_foto">Data da Foto</Label>
            <Input
              id="data_foto"
              type="date"
              value={formData.data_foto}
              onChange={(e) => handleInputChange('data_foto', e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isUploading || !formData.url_foto || !formData.pet_id}
              className="bg-gradient-to-r from-teal-500 to-cyan-500"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : foto ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}