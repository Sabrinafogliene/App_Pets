import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function FotoCard({ foto, pet, onEdit }) {
  const getCategoryInfo = (category) => {
    const categoryMap = {
      medica: { label: "Médica", color: "bg-red-100 text-red-800", icon: "🏥" },
      diversao: { label: "Diversão", color: "bg-yellow-100 text-yellow-800", icon: "🎉" },
      marco: { label: "Marco", color: "bg-purple-100 text-purple-800", icon: "🎂" },
      outra: { label: "Outra", color: "bg-gray-100 text-gray-800", icon: "📸" }
    };
    return categoryMap[category] || categoryMap.outra;
  };

  const categoryInfo = getCategoryInfo(foto.categoria);

  return (
    <Card className="group bg-white/90 backdrop-blur-sm border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="aspect-square relative">
        <img
          src={foto.url_foto}
          alt={foto.titulo || 'Foto do pet'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="ghost"
            className="bg-white/80 hover:bg-white text-black"
            onClick={() => onEdit(foto)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
        <Badge className={`absolute top-2 right-2 ${categoryInfo.color}`}>
          {categoryInfo.icon} {categoryInfo.label}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 truncate">{foto.titulo || "Sem título"}</h3>
        {pet && <p className="text-sm text-gray-600">Pet: {pet.nome}</p>}
        {foto.data_foto && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            <Calendar className="w-3 h-3" />
            {format(new Date(foto.data_foto), 'dd/MM/yyyy', { locale: ptBR })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}