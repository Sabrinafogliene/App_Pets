import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PawPrint, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet';

const SignUp = () => {
	const { supabase } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [fullName, setFullName] = useState('');
	const [userType, setUserType] = useState('tutor');
	const [crmv, setCrmv] = useState('');
	const [clinic, setClinic] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordError, setPasswordError] = useState('');

	const queryParams = new URLSearchParams(location.search);
	const invitationToken = queryParams.get('invitation_token');
	const isInvited = !!invitationToken;

	useEffect(() => {
		if (isInvited) {
			setUserType('veterinario');
		}
	}, [isInvited]);

	const validatePassword = (pass) => {
		if (pass.length < 6) {
			setPasswordError('A senha deve ter no mínimo 6 caracteres.');
			return false;
		}
		setPasswordError('');
		return true;
	};

	const handlePasswordChange = (e) => {
		const newPassword = e.target.value;
		setPassword(newPassword);
		validatePassword(newPassword);
	};

	const handleSignUp = async (e) => {
		e.preventDefault();
		if (!validatePassword(password)) {
			return;
		}
		setLoading(true);

		console.log('Tentando criar usuário no Supabase Auth:', { email, userType });
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					full_name: fullName,
					user_type: userType,
					...(userType === 'veterinario' && { crmv, clinic }),
				},
			},
		});
		console.log('Resultado do signUp:', { data, error });

		// Só insere no profiles se o usuário estiver autenticado (session presente)
		let profileInsertError = null;
		if (data.user && data.session) {
			console.log('ID do usuário para insert:', data.user.id);
			console.log('Usuário autenticado:', data.user);
			const sessionResult = await supabase.auth.getSession();
			console.log('Token JWT da sessão:', sessionResult?.data?.session?.access_token);
			console.log('Usuário criado, tentando inserir no profiles:', data.user.id);
			const { error: insertError } = await supabase
				.from('profiles')
				.insert([
					{
						id: data.user.id,
						full_name: fullName,
						user_type: userType,
						email,
						...(userType === 'veterinario' && { crmv, clinic }),
					},
				]);
			console.log('Resultado do insert no profiles:', { insertError });
			if (insertError) {
				profileInsertError = insertError;
			}
		} else if (data.user && !data.session) {
			console.log('Usuário criado, mas não autenticado. Perfil será criado após login.');
		}

		setLoading(false);

		if (error || profileInsertError) {
			let errorMessage = 'Ocorreu um erro ao criar sua conta. Tente novamente.';
			if (error?.message?.includes('weak_password')) {
				errorMessage = 'Senha muito fraca. Por favor, escolha uma senha mais forte e segura.';
			} else if (error?.message?.includes('User already registered')) {
				errorMessage = 'Este e-mail já está cadastrado. Tente fazer login.';
			} else if (profileInsertError) {
				errorMessage = 'Erro ao salvar perfil. Tente novamente ou contate o suporte.';
			}
			console.error('Erro no cadastro:', { error, profileInsertError });
			toast({
				title: 'Erro no Cadastro',
				description: errorMessage,
				variant: 'destructive',
			});
		} else if (data.user && data.session) {
			console.log('Cadastro realizado com sucesso! Redirecionando para painel.');
			toast({
				title: 'Cadastro realizado com sucesso!',
				description: 'Redirecionando para o seu painel...',
				className: 'bg-green-500 text-white',
			});
			navigate('/', { replace: true });
		} else if (data.user && !data.session) {
			console.log('Cadastro realizado, mas precisa confirmar e-mail.');
			toast({
				title: 'Confirme seu E-mail',
				description: 'Cadastro realizado! Enviamos um link de confirmação para o seu e-mail.',
			});
			navigate('/login', { replace: true });
		} else {
			console.error('Falha inesperada no cadastro:', { data, error });
			toast({
				title: 'Falha no Cadastro',
				description: 'Não foi possível criar sua conta. Verifique os dados e tente novamente.',
				variant: 'destructive',
			});
		}
	};

	return (
		<>
			<Helmet>
				<title>Crie sua Conta - PetCare+</title>
				<meta name="description" content="Crie sua conta no PetCare+ e comece a cuidar do seu pet." />
			</Helmet>
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-blue-100 p-4">
				<motion.div
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="w-full max-w-md p-8 space-y-6 bg-white rounded-2xl shadow-lg"
				>
					<div className="text-center">
						<PawPrint className="mx-auto h-12 w-12 text-pink-600" />
						<h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">
							Crie sua conta
						</h1>
						<p className="mt-2 text-sm text-gray-600">
							Já tem uma conta?{' '}
							<Link to="/login" className="font-medium text-pink-600 hover:text-pink-500">
								Faça login
							</Link>
						</p>
					</div>
					<form className="space-y-6" onSubmit={handleSignUp}>
						<div>
							<Label htmlFor="user-type">Eu sou</Label>
							<Select onValueChange={setUserType} value={userType} disabled={isInvited}>
								<SelectTrigger id="user-type" className="w-full mt-1">
									<SelectValue placeholder="Selecione o tipo de usuário" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="tutor">Tutor de Pet</SelectItem>
									<SelectItem value="veterinario">Veterinário</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label htmlFor="full-name">Nome Completo</Label>
							<Input id="full-name" type="text" required className="mt-1" value={fullName} onChange={(e) => setFullName(e.target.value)} />
						</div>

						<div>
							<Label htmlFor="email">E-mail</Label>
							<Input id="email" type="email" autoComplete="email" required className="mt-1" value={email} onChange={(e) => setEmail(e.target.value)} />
						</div>

						<div className="relative">
							<Label htmlFor="password">Senha</Label>
							<Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required className="mt-1" value={password} onChange={handlePasswordChange} />
							<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
								{showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
							</button>
						</div>
						{passwordError && <p className="text-xs text-red-500 mt-1">{passwordError}</p>}

						{userType === 'veterinario' && (
							<>
								<div>
									<Label htmlFor="crmv">CRMV</Label>
									<Input id="crmv" type="text" required className="mt-1" value={crmv} onChange={(e) => setCrmv(e.target.value)} />
								</div>
								<div>
									<Label htmlFor="clinic">Clínica/Hospital</Label>
									<Input id="clinic" type="text" required className="mt-1" value={clinic} onChange={(e) => setClinic(e.target.value)} />
								</div>
							</>
						)}

						<div>
							<Button type="submit" className="w-full" disabled={loading}>
								{loading ? 'Criando conta...' : 'Criar Conta'}
							</Button>
						</div>
					</form>
				</motion.div>
			</div>
		</>
	);
};

export default SignUp;