import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { Sparkles, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setSubmitError(null);
    clearError();
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      setSubmitError('Erro ao criar conta. Tente novamente.');
    }
  };

  const benefits = [
    'Acesso a ofertas exclusivas',
    'Acompanhe seus pedidos',
    'Lista de desejos personalizada',
    'Histórico de compras',
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-white">
              Nova<span className="text-accent-400">Shop</span>
            </span>
          </Link>

          <h2 className="text-4xl font-bold text-white mb-4 font-display">
            Junte-se a milhares de compradores
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-md">
            Crie sua conta gratuitamente e tenha acesso a benefícios exclusivos.
          </p>
          
          <ul className="space-y-4">
            {benefits.map((benefit, i) => (
              <li key={i} className="flex items-center gap-3 text-white">
                <div className="w-6 h-6 bg-accent-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4" />
                </div>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-surface-900">
              Nova<span className="text-brand-600">Shop</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-surface-900 mb-2 font-display">
              Criar sua conta
            </h1>
            <p className="text-surface-500">
              Preencha os dados abaixo para começar
            </p>
          </div>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-surface-900 mb-2">Conta criada!</h3>
                  <p className="text-surface-500">Redirecionando para login...</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
                  {(submitError || error) && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                      {submitError || error}
                    </div>
                  )}

                  <Input
                    id="name"
                    type="text"
                    label="Nome completo"
                    placeholder="Seu nome"
                    icon={<User className="h-5 w-5" />}
                    error={errors.name?.message}
                    {...register('name')}
                  />

                  <Input
                    id="email"
                    type="email"
                    label="Email"
                    placeholder="seu@email.com"
                    icon={<Mail className="h-5 w-5" />}
                    error={errors.email?.message}
                    {...register('email')}
                  />

                  <Input
                    id="password"
                    type="password"
                    label="Senha"
                    placeholder="Mínimo 6 caracteres"
                    icon={<Lock className="h-5 w-5" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />

                  <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirmar senha"
                    placeholder="Digite a senha novamente"
                    icon={<Lock className="h-5 w-5" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />

                  <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                    Criar Conta
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>

                  <p className="text-center text-sm text-surface-500 mt-4">
                    Ao criar sua conta, você concorda com nossos{' '}
                    <a href="#" className="text-brand-600 hover:underline">Termos de Uso</a>
                    {' '}e{' '}
                    <a href="#" className="text-brand-600 hover:underline">Política de Privacidade</a>
                  </p>
                </form>
              )}
            </CardContent>
          </Card>

          <p className="text-center text-surface-600 mt-6">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-700 font-semibold">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
