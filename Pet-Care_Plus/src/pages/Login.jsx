import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signIn(email, password);

        setIsLoading(false);

        if (error) {
            toast({
                title: "Erro no Login",
                description: "Credenciais inválidas. Por favor, verifique seu e-mail e senha.",
                variant: "destructive",
            });
        } else {
            toast({
                title: "Login bem-sucedido!",
                description: "Redirecionando para o seu painel...",
                className: 'bg-green-500 text-white',
            });
            // O redirecionamento agora é tratado pelo App.jsx e AuthRedirect
            navigate('/app/dashboard', { replace: true });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden"
            >
                <div className="px-6 py-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-700 mb-0">
                        Bem-vindo ao
                    </h1>
                    <img
                        src="logotipo.png"
                        alt="Logotipo MyPetOn"
                        className="mx-auto h-32 w-auto my-0"
                    />
                    <p className="text-gray-600">
                        Faça login para cuidar do seu melhor amigo.
                    </p>
                </div>
                <div className="px-6 pb-8 pt-0">
                    
                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu.email@exemplo.com"
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700">Senha</label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Sua senha"
                                className="mt-1"
                            />
                        </div>

                        <Button type="submit" className="w-full bg-teal-500 py-2.5 text-base mt-2" disabled={isLoading}>
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                             ) : (
                                <>
                                    <LogIn className="w-4 h-4 mr-2" />
                                    Entrar
                                </>
                            )}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-gray-600 mt-6">
                        Não tem uma conta?{' '}
                        <Link to="/signup" className="font-medium">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;