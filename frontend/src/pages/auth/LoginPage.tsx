import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { authApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? "/";

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await authApi.login({ email: email.trim(), password });
      setSession(auth);
      navigate(auth.role === "ADMIN" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível entrar. Tente novamente.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white">
            <Store className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
            Entrar na sua conta
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Acompanhe pedidos e finalize suas compras.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4" noValidate={false}>
          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <Field label="E-mail" htmlFor="login-email" required>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Field label="Senha" htmlFor="login-password" required>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Ainda não tem conta?{" "}
          <Link to="/registro" className="font-medium text-brand hover:text-brand-hover">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </main>
  );
}
