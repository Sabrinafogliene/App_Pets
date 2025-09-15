import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadFile } from "@/integrations/Core";
import { PawPrint, Upload, X, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const SPECIES_OPTIONS = [
  { value: "cao", label: "🐕 Cão", icon: "🐕" },
  { value: "gato", label: "🐱 Gato", icon: "🐱" },
  { value: "passaro", label: "🐦 Ave", icon: "🐦" },
  { value: "coelho", label: "🐰 Coelho", icon: "🐰" },
  { value: "peixe", label: "🐠 Peixe", icon: "🐠" },
  { value: "reptil", label: "🦎 Réptil", icon: "🦎" },
  { value: "outro", label: "🐾 Outro", icon: "🐾" }
];

export default function PetForm({ pet, onSave, onCancel }) {
  const [formData, setFormData] = useState(pet || {
    nome: "",
    especie: "",
    raca: "",
    data_nascimento: "",
    peso: "",
    sexo: "",
    url_foto: "",
    historico_medico: "",
    microchip: "",
    castrado: false
  });
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
    
    const processedData = {
      ...formData,
      peso: formData.peso ? parseFloat(formData.peso) : null
    };
    
    await onSave(processedData);
    setIsSaving(false);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-white/50 shadow-2xl max-w-4xl mx-auto">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <PawPrint className="w-6 h-6 text-pink-500" />
          {pet ? 'Editar Pet' : 'Novo Pet'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              {formData.url_foto ? (
                <div className="relative">
                  <img
                    src={formData.url_foto}
                    alt="Preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-pink-200 shadow-lg"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                    onClick={() => handleInputChange('url_foto', '')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center border-4 border-pink-200 shadow-lg">
                  <div className="text-4xl opacity-60">
                    {formData.especie ? SPECIES_OPTIONS.find(s => s.value === formData.especie)?.icon || "🐾" : "📷"}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="photo-upload"
                disabled={isUploading}
              />
              <Label htmlFor="photo-upload">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isUploading}
                  className="cursor-pointer border-pink-300 hover:bg-pink-50"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Enviando..." : "Upload Foto"}
                  </span>
                </Button>
              </Label>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome" className="font-semibold">Nome do Pet *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Ex: Buddy, Luna, Max..."
                required
                className="border-pink-200 focus:border-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especie" className="font-semibold">Espécie *</Label>
              <Select
                value={formData.especie}
                onValueChange={(value) => handleInputChange('especie', value)}
                required
              >
                <SelectTrigger className="border-pink-200 focus:border-pink-500">
                  <SelectValue placeholder="Selecione a espécie" />
                </SelectTrigger>
                <SelectContent>
                  {SPECIES_OPTIONS.map((species) => (
                    <SelectItem key={species.value} value={species.value}>
                      {species.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="raca" className="font-semibold">Raça</Label>
              <Input
                id="raca"
                value={formData.raca}
                onChange={(e) => handleInputChange('raca', e.target.value)}
                placeholder="Ex: Golden Retriever, Persa..."
                className="border-pink-200 focus:border-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sexo" className="font-semibold">Sexo</Label>
              <Select
                value={formData.sexo}
                onValueChange={(value) => handleInputChange('sexo', value)}
              >
                <SelectTrigger className="border-pink-200 focus:border-pink-500">
                  <SelectValue placeholder="Selecione o sexo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="macho">♂️ Macho</SelectItem>
                  <SelectItem value="femea">♀️ Fêmea</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_nascimento" className="font-semibold">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                className="border-pink-200 focus:border-pink-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso" className="font-semibold">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.1"
                min="0"
                value={formData.peso}
                onChange={(e) => handleInputChange('peso', e.target.value)}
                placeholder="Ex: 5.5"
                className="border-pink-200 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="microchip" className="font-semibold">Número do Microchip</Label>
              <Input
                id="microchip"
                value={formData.microchip}
                onChange={(e) => handleInputChange('microchip', e.target.value)}
                placeholder="Ex: 123456789012345"
                className="border-pink-200 focus:border-pink-500"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="castrado"
                checked={formData.castrado}
                onCheckedChange={(checked) => handleInputChange('castrado', checked)}
              />
              <Label htmlFor="castrado" className="font-semibold">
                Pet castrado/esterilizado
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="historico_medico" className="font-semibold">Histórico Médico</Label>
              <Textarea
                id="historico_medico"
                value={formData.historico_medico}
                onChange={(e) => handleInputChange('historico_medico', e.target.value)}
                placeholder="Descreva o histórico médico, alergias, condições especiais..."
                rows={4}
                className="border-pink-200 focus:border-pink-500 resize-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
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
              disabled={isSaving || !formData.nome || !formData.especie}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Salvando..." : pet ? "Atualizar Pet" : "Cadastrar Pet"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}