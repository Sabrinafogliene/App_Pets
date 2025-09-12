import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, User, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    crmv: '',
    clinic: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState('tutor');
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await signIn(form.email, form.password);
    if (!error) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo(a) de volta ao PetCare+",
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { error } = await signUp(registerForm.email, registerForm.password, {
      data: {
        full_name: registerForm.name,
        user_type: activeTab,
        crmv: activeTab === 'vet' ? registerForm.crmv : undefined,
        clinic: activeTab === 'vet' ? registerForm.clinic : undefined,
      }
    });

    if (!error) {
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta.",
      });
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 relative overflow-hidden">
       <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg"
          >
            <Heart className="w-8 h-8 text-purple-500" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">PetCare+</h1>
          <p className="text-gray-500">Cuidando do seu melhor amigo</p>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-xl">
          <CardHeader>
            <CardTitle className="text-center text-gray-800">
              {isRegistering ? 'Cadastre-se no PetCare+' : 'Entrar no PetCare+'}
            </CardTitle>
            <CardDescription className="text-center text-gray-500">
              {isRegistering ? 'Crie sua conta para começar' : 'Escolha seu tipo de acesso'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100">
                <TabsTrigger value="tutor" className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm">
                  <User className="w-4 h-4 mr-2" />
                  Tutor
                </TabsTrigger>
                <TabsTrigger value="vet" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  <Stethoscope className="w-4 h-4 mr-2" />
                  Veterinário
                </TabsTrigger>
              </TabsList>

              <TabsContent value="tutor" forceMount className={activeTab !== 'tutor' ? 'hidden' : ''}>
                {isRegistering ? (
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name-tutor">Nome Completo</Label>
                      <Input id="register-name-tutor" placeholder="Seu nome" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email-tutor">Email</Label>
                      <Input id="register-email-tutor" type="email" placeholder="seu@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password-tutor">Senha</Label>
                      <Input id="register-password-tutor" type="password" placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Cadastrar como Tutor</Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="tutor-email">Email</Label>
                      <Input id="tutor-email" type="email" placeholder="seu@email.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tutor-password">Senha</Label>
                      <Input id="tutor-password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white">Entrar como Tutor</Button>
                  </form>
                )}
              </TabsContent>

              <TabsContent value="vet" forceMount className={activeTab !== 'vet' ? 'hidden' : ''}>
                {isRegistering ? (
                  <form onSubmit={handleRegister} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name-vet">Nome Completo</Label>
                      <Input id="register-name-vet" placeholder="Seu nome" value={registerForm.name} onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email-vet">Email</Label>
                      <Input id="register-email-vet" type="email" placeholder="seu@email.com" value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-crmv">CRMV</Label>
                      <Input id="register-crmv" placeholder="Seu CRMV" value={registerForm.crmv} onChange={(e) => setRegisterForm({...registerForm, crmv: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password-vet">Senha</Label>
                      <Input id="register-password-vet" type="password" placeholder="••••••••" value={registerForm.password} onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Cadastrar como Veterinário</Button>
                  </form>
                ) : (
                  <form onSubmit={handleLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="vet-email">Email</Label>
                      <Input id="vet-email" type="email" placeholder="veterinario@clinica.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vet-password">Senha</Label>
                      <Input id="vet-password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
                    </div>
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">Entrar como Veterinário</Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center">
              <Button
                variant="link"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-gray-500 hover:text-gray-700"
              >
                {isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;