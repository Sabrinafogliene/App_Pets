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
            navigate('/', { replace: true });
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg"
            >
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Heart className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao PetCare+</h1>
                    <p className="text-gray-600">Faça login para cuidar do seu melhor amigo.</p>
                </div>

                <form className="space-y-6" onSubmit={handleLogin}>
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

                    <Button type="submit" className="w-full bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
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
                <p className="text-center text-sm text-gray-600">
                    Não tem uma conta?{' '}
                    <Link to="/signup" className="font-medium text-pink-600 hover:text-pink-500">
                        Cadastre-se
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;