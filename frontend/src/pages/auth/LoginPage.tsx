import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../store';
import { Button, Input, Card, CardContent } from '../../components/ui';
import { Sparkles, Mail, Lock, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setSubmitError(null);
    clearError();
    try {
      await login(data);
      navigate('/');
    } catch {
      setSubmitError('Email ou senha inválidos');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold font-display text-surface-900">
              Nova<span className="text-brand-600">Shop</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-surface-900 mb-2 font-display">
              Bem-vindo de volta!
            </h1>
            <p className="text-surface-500">
              Entre com sua conta para continuar
            </p>
          </div>

          <Card className="border-0 shadow-soft">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {(submitError || error) && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-lg">⚠️</span>
                    </div>
                    <p>{submitError || error}</p>
                  </div>
                )}

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
                  placeholder="••••••••"
                  icon={<Lock className="h-5 w-5" />}
                  error={errors.password?.message}
                  {...register('password')}
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500" />
                    <span className="text-sm text-surface-600">Lembrar de mim</span>
                  </label>
                  <span className="text-sm text-surface-500">
                    Recuperação de senha em breve
                  </span>
                </div>

                <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                  Entrar
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-surface-600 mt-6">
            Não tem uma conta?{' '}
            <Link to="/register" className="text-brand-600 hover:text-brand-700 font-semibold">
              Cadastre-se grátis
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image/Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-8">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 font-display">
            Sua jornada começa aqui
          </h2>
          <p className="text-lg text-brand-100 max-w-md">
            Milhares de produtos esperando por você. 
            Entre agora e aproveite ofertas exclusivas.
          </p>
          
          <div className="mt-12 grid gap-4 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <p className="text-sm text-brand-100">Compra segura com proteção ao cliente</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <p className="text-sm text-brand-100">Entrega rápida e acompanhamento em tempo real</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-left">
              <p className="text-sm text-brand-100">Atendimento dedicado quando precisar</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
