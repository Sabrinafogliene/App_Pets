import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Bell, 
  Shield, 
  LogOut,
  Save,
  FileText
} from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const ConfiguracoesVet = () => {
  const { profile, signOut, updateProfile } = useAuthContext();
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: profile?.nome || "",
    email: profile?.email || "",
    telefone: profile?.telefone || "",
    endereco: profile?.endereco || "",
    crmv: "",
    especialidade: "",
    clinica: "",
    observacoes: ""
  });

  // Estados das configurações
  const [notifications, setNotifications] = useState({
    consultas: true,
    lembretes: true,
    emails: false,
    sms: false
  });

  const [privacy, setPrivacy] = useState({
    perfilPublico: true,
    compartilharDados: false
  });

  const handleSave = async () => {
    try {
      await updateProfile({
        nome: formData.nome,
        telefone: formData.telefone,
        endereco: formData.endereco
      });
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Logout realizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    }
  };

  return (
    <Layout>
      <div className="space-y-4 lg:space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-sm lg:text-base text-muted-foreground">
            Gerencie suas informações pessoais e preferências da conta.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Content - 2 columns em desktop */}
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            
            {/* Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
                  <User className="w-5 h-5 text-petcare-blue flex-shrink-0" />
                  <span>Informações Pessoais</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({...prev, nome: e.target.value}))}
                      placeholder="Dr. João Silva"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="bg-muted mt-1"
                      placeholder="joao@veterinario.com"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      O email não pode ser alterado
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({...prev, telefone: e.target.value}))}
                      placeholder="(11) 99999-9999"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="crmv">CRMV</Label>
                    <Input
                      id="crmv"
                      value={formData.crmv}
                      onChange={(e) => setFormData(prev => ({...prev, crmv: e.target.value}))}
                      placeholder="CRMV-SP 12345"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({...prev, endereco: e.target.value}))}
                    placeholder="Rua das Flores, 123 - São Paulo/SP"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="especialidade">Especialidade</Label>
                    <Input
                      id="especialidade"
                      value={formData.especialidade}
                      onChange={(e) => setFormData(prev => ({...prev, especialidade: e.target.value}))}
                      placeholder="Clínica Médica"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinica">Clínica/Hospital</Label>
                    <Input
                      id="clinica"
                      value={formData.clinica}
                      onChange={(e) => setFormData(prev => ({...prev, clinica: e.target.value}))}
                      placeholder="Centro Veterinário ABC"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({...prev, observacoes: e.target.value}))}
                    placeholder="Informações adicionais sobre sua prática veterinária..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <Button onClick={handleSave} className="w-full md:w-auto touch-manipulation">
                  <Save className="w-4 h-4 mr-2 flex-shrink-0" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>

            {/* Notificações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
                  <Bell className="w-5 h-5 text-petcare-green flex-shrink-0" />
                  <span>Notificações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Lembrete de Consultas</p>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações sobre consultas agendadas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.consultas}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({...prev, consultas: checked}))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Lembretes Gerais</p>
                    <p className="text-sm text-muted-foreground">
                      Notificações sobre vacinas vencendo e outros lembretes
                    </p>
                  </div>
                  <Switch
                    checked={notifications.lembretes}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({...prev, lembretes: checked}))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">
                      Receba resumos e atualizações por email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emails}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({...prev, emails: checked}))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Notificações por SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Alertas importantes via mensagem de texto
                    </p>
                  </div>
                  <Switch
                    checked={notifications.sms}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({...prev, sms: checked}))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacidade e Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg lg:text-xl">
                  <Shield className="w-5 h-5 text-petcare-purple flex-shrink-0" />
                  <span>Privacidade e Segurança</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Perfil Público</p>
                    <p className="text-sm text-muted-foreground">
                      Permitir que tutores encontrem seu perfil
                    </p>
                  </div>
                  <Switch
                    checked={privacy.perfilPublico}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, perfilPublico: checked}))
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium">Compartilhar Dados Estatísticos</p>
                    <p className="text-sm text-muted-foreground">
                      Ajudar a melhorar o sistema com dados anônimos
                    </p>
                  </div>
                  <Switch
                    checked={privacy.compartilharDados}
                    onCheckedChange={(checked) => 
                      setPrivacy(prev => ({...prev, compartilharDados: checked}))
                    }
                  />
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-2">Alterar Senha</p>
                  <div className="space-y-3">
                    <Input type="password" placeholder="Senha atual" />
                    <Input type="password" placeholder="Nova senha" />
                    <Input type="password" placeholder="Confirmar nova senha" />
                    <Button variant="outline" size="sm" className="touch-manipulation">
                      Alterar Senha
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info - 1 column em desktop */}
          <div className="space-y-4 lg:space-y-6">
            {/* Informações da Conta */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações da Conta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 lg:w-20 h-16 lg:h-20 bg-gradient-to-br from-petcare-blue to-blue-400 rounded-full flex items-center justify-center text-white text-xl lg:text-2xl font-bold mx-auto mb-3">
                    {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'V'}
                  </div>
                  <h3 className="font-semibold text-base lg:text-lg truncate">{profile?.nome || 'Dr. Veterinário'}</h3>
                  <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
                  <Badge variant="secondary" className="mt-2">
                    Veterinário
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Versão do App</span>
                    <span className="font-medium">2.1.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pacientes</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Cadastro</span>
                    <span className="font-medium">Hoje</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Backup e Dados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Backup e Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="font-medium">Último Backup</p>
                    <p className="text-sm text-muted-foreground">Nunca</p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 flex-shrink-0">
                    Pendente
                  </Badge>
                </div>

                <Button variant="outline" size="sm" className="w-full touch-manipulation">
                  <FileText className="w-4 h-4 mr-2" />
                  Fazer Backup
                </Button>

                <Separator />

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 touch-manipulation"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair da Conta
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConfiguracoesVet;