import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Bell, Shield, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function Configuracoes() {
  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
          Configurações
        </h1>

        {/* Perfil do Usuário */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-5 h-5 text-purple-600" />
              <span>Perfil do Usuário</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" defaultValue="Tutor do Pet" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="tutor@exemplo.com" disabled />
              </div>
            </div>
            <div className="flex justify-end">
              <Button className="bg-gradient-to-r from-pink-500 to-purple-500">Salvar Alterações</Button>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-yellow-500" />
              <span>Notificações</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              As configurações de notificação push são gerenciadas diretamente no seu dispositivo.
            </p>
            <p className="text-sm text-gray-500">
              Para ativá-las ou desativá-las, vá para as configurações do seu celular, encontre o app PetCare+ e ajuste as permissões de notificação.
            </p>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Segurança</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Alterar Senha</Button>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="font-medium">Sair da Conta</h4>
                <p className="text-sm text-gray-500">Desconectar sua conta deste dispositivo.</p>
              </div>
              <Button variant="destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}