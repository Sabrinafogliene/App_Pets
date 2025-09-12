import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Smartphone, 
  Cloud,
  LogOut,
  Save
} from "lucide-react";

const Configuracoes = () => {
  const { profile, user, updateProfile, signOut } = useAuthContext();
  const [formData, setFormData] = useState({
    nome: profile?.nome || '',
    telefone: profile?.telefone || '',
    endereco: profile?.endereco || ''
  });

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground mt-1">Gerencie suas preferências e conta</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-petcare-blue" />
                  <CardTitle>Informações Pessoais</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input 
                      id="nome" 
                      value={formData.nome}
                      onChange={(e) => setFormData({...formData, nome: e.target.value})}
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      className="mt-1" 
                      disabled 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      placeholder="(11) 99999-9999" 
                      className="mt-1" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input 
                      id="endereco" 
                      value={formData.endereco}
                      onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                      placeholder="Seu endereço" 
                      className="mt-1" 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button 
                    className="bg-gradient-to-r from-petcare-blue to-blue-400 hover:opacity-90"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-petcare-orange" />
                  <CardTitle>Notificações</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lembretes de Vacinas</h4>
                    <p className="text-sm text-muted-foreground">Receba notificações sobre vacinas pendentes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lembretes de Medicamentos</h4>
                    <p className="text-sm text-muted-foreground">Notificações sobre horários de medicação</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Lembretes de Consultas</h4>
                    <p className="text-sm text-muted-foreground">Alertas sobre consultas agendadas</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações por E-mail</h4>
                    <p className="text-sm text-muted-foreground">Receber resumos semanais por e-mail</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-petcare-green" />
                  <CardTitle>Privacidade e Segurança</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                  </div>
                  <Switch />
                </div>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Alterar Senha</h4>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Senha atual" />
                    <Input type="password" placeholder="Nova senha" />
                    <Input type="password" placeholder="Confirmar nova senha" />
                    <Button variant="outline">
                      Atualizar Senha
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Minha Conta</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="w-20 h-20 bg-gradient-to-br from-petcare-pink to-petcare-purple rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                  U
                </div>
                <div>
                  <h3 className="font-semibold">{profile?.nome || 'Usuário'}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    {profile?.role === 'veterinario' ? 'Veterinário' : 'Tutor de Pets'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* App Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5 text-petcare-purple" />
                  <CardTitle>Sobre o App</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Versão:</span>
                  <span>1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pets Cadastrados:</span>
                  <span>4</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Desde:</span>
                  <span>Janeiro 2024</span>
                </div>
              </CardContent>
            </Card>

            {/* Backup */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Cloud className="w-5 h-5 text-petcare-blue" />
                  <CardTitle>Backup</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  Seus dados são automaticamente salvos na nuvem.
                </div>
                <div className="text-xs text-muted-foreground">
                  Último backup: Hoje às 14:32
                </div>
                <Button variant="outline" className="w-full">
                  <Cloud className="w-4 h-4 mr-2" />
                  Fazer Backup Manual
                </Button>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card>
              <CardContent className="p-6">
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair da Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Configuracoes;