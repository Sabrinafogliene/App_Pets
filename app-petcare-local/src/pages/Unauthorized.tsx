import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Acesso Negado
          </CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-6">
            Esta área é restrita. Verifique se você está logado com o tipo de conta correto.
          </p>
          <Button asChild className="w-full">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Início
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}