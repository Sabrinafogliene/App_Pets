import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PawPrint, User, Mail } from "lucide-react";
import { useVetDashboardData } from "@/hooks/useVetDashboardData";

export const VetPacientesList = () => {
  const { authorizedPets, loading } = useVetDashboardData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PawPrint className="w-5 h-5 text-petcare-blue" />
            <span>Meus Pacientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-muted-foreground">
              Carregando pacientes...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authorizedPets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PawPrint className="w-5 h-5 text-petcare-blue" />
            <span>Meus Pacientes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <PawPrint className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nenhum paciente autorizado
            </h3>
            <p className="text-sm text-muted-foreground">
              Aguarde os tutores concederem acesso aos históricos dos pets.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <PawPrint className="w-5 h-5 text-petcare-blue" />
          <span>Meus Pacientes ({authorizedPets.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {authorizedPets.map((pet) => (
            <Link 
              key={pet.id} 
              to={`/paciente/${pet.id}`}
              className="group"
            >
              <Card className="transition-all duration-200 hover:shadow-md cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* Avatar do Pet */}
                    <div className="w-12 h-12 bg-gradient-to-br from-petcare-blue to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {pet.nome.charAt(0).toUpperCase()}
                    </div>
                    
                    {/* Informações do Pet */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-card-foreground group-hover:text-petcare-blue transition-colors">
                          {pet.nome}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                          {pet.especie}
                        </Badge>
                      </div>
                      
                      {pet.raca && (
                        <p className="text-sm text-muted-foreground mb-1">{pet.raca}</p>
                      )}
                      
                      <div className="flex items-center text-xs text-muted-foreground mb-2">
                        {pet.idade && <span>{pet.idade} anos</span>}
                        {pet.idade && pet.sexo && <span className="mx-1">•</span>}
                        {pet.sexo && <span>{pet.sexo}</span>}
                      </div>
                      
                      {/* Tutor */}
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User className="w-3 h-3 mr-1" />
                        <span className="truncate">{pet.tutor_nome}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Permissões */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Acesso autorizado:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {pet.authorized_data.map((permission) => (
                        <Badge 
                          key={permission} 
                          variant="outline" 
                          className="text-xs capitalize"
                        >
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};