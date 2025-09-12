import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PawPrint, Plus, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { usePets } from "@/hooks/usePets";

// ALTERAÇÃO 1: Adicionamos a nossa lista de espécies aqui também
const especies = [
    { value: 'cão', label: 'Cão', emoji: '🐶' },
    { value: 'gato', label: 'Gato', emoji: '🐱' },
    { value: 'pássaro', label: 'Pássaro', emoji: '🐦' },
    { value: 'peixe', label: 'Peixe', emoji: '🐠' },
    { value: 'roedor', label: 'Roedor', emoji: '🐹' },
    { value: 'réptil', label: 'Réptil', emoji: '🐢' },
    { value: 'bovino', label: 'Bovino', emoji: '🐄' },
    { value: 'lhama', label: 'Lhama', emoji: '🦙' },
    { value: 'cabra', label: 'Cabra', emoji: '🐐' },
    { value: 'outro', label: 'Outro', emoji: '🐾' }
];

export const MeusPets = () => {
  const { pets, loading } = usePets();

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PawPrint className="w-5 h-5 text-petcare-pink" />
            <CardTitle className="text-lg">Meus Pets ({loading ? '...' : pets?.length || 0})</CardTitle>
          </div>
          <Link to="/pets?action=add">
            <Button size="sm" className="bg-gradient-to-r from-petcare-pink to-pink-400 hover:from-petcare-pink/90 hover:to-pink-400/90 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Novo Pet
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.slice(0, 6).map((pet) => {
              
              // ALTERAÇÃO 2: Lógica para encontrar e formatar a espécie
              const especieInfo = especies.find(e => e.value.toLowerCase() === pet.especie.toLowerCase());
              const displayEspecie = especieInfo
                ? `${especieInfo.emoji} ${especieInfo.label}`
                : pet.especie.charAt(0).toUpperCase() + pet.especie.slice(1);

              return (
                <Link key={pet.id} to={`/pets/${pet.id}`} className="block">
                  <div className="flex items-center space-x-3 p-4 rounded-xl border border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 bg-card/50 hover:bg-card group">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-petcare-pink/20 to-petcare-purple/20 flex items-center justify-center overflow-hidden">
                        {pet.foto_url ? (
                          <img
                            src={pet.foto_url}
                            alt={pet.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PawPrint className="w-6 h-6 text-petcare-pink" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-card-foreground group-hover:text-petcare-pink transition-colors">
                        {pet.nome}
                      </h3>
                      
                      {/* ALTERAÇÃO 3: Adicionamos o Badge da espécie */}
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <Badge variant="secondary" className="text-xs">{displayEspecie}</Badge>
                        <p className="line-clamp-1">{pet.raca}</p>
                      </div>

                      <div className="flex items-center space-x-2 mt-2">
                        {pet.idade != null && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                          >
                            {pet.idade} anos
                          </Badge>
                        )}
                        {pet.peso != null && (
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 hover:bg-blue-100"
                          >
                            {pet.peso}kg
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-petcare-pink/20 to-petcare-purple/20 rounded-full mx-auto mb-4 flex items-center justify-center">
              <PawPrint className="w-8 h-8 text-petcare-pink opacity-50" />
            </div>
            <h3 className="text-sm font-medium text-card-foreground mb-2">
              Nenhum pet cadastrado
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Adicione seu primeiro pet para começar
            </p>
            <Link to="/pets?action=add">
              <Button size="sm" className="bg-gradient-to-r from-petcare-pink to-pink-400 hover:from-petcare-pink/90 hover:to-pink-400/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Cadastrar Pet
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};