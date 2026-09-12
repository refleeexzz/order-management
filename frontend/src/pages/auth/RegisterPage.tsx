import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { authApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type AccountKind = "CUSTOMER" | "SELLER";

export function RegisterPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [kind, setKind] = useState<AccountKind>("CUSTOMER");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const auth = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        role: kind,
      });
      setSession(auth);
      // Após o registro, oferecemos a criação do perfil de cliente
      // (necessário para comprar — SPEC §5: checkout exige customer profile).
      navigate("/conta/perfil?boas-vindas=1", { replace: true });
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Não foi possível criar a conta. Tente novamente.",
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
            Criar sua conta
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Compre com PIX, cartão ou boleto em poucos minutos.
          </p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4">
          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div role="group" aria-label="Tipo de conta" className="grid grid-cols-2 gap-1 rounded-md bg-zinc-100 p-1">
            {(
              [
                { value: "CUSTOMER", label: "Quero comprar" },
                { value: "SELLER", label: "Quero vender" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={kind === option.value}
                onClick={() => setKind(option.value)}
                className={cn(
                  "h-8 rounded-sm text-sm font-medium transition-colors",
                  kind === option.value
                    ? "bg-white text-zinc-900 shadow-sm"
                    : "text-zinc-600 hover:text-zinc-900",
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
          {kind === "SELLER" && (
            <p className="text-xs text-zinc-500">
              Contas de vendedor são criadas imediatamente. O painel de vendas está em
              liberação gradual — por enquanto você pode comprar normalmente.
            </p>
          )}

          <Field label="Nome completo" htmlFor="reg-name" required>
            <Input
              id="reg-name"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Maria da Silva"
            />
          </Field>
          <Field label="E-mail" htmlFor="reg-email" required>
            <Input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Field
            label="Senha"
            htmlFor="reg-password"
            required
            hint="Mínimo de 6 caracteres."
          >
            <Input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              maxLength={50}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Crie uma senha"
            />
          </Field>
          <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
            Criar conta
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-600">
          Já tem conta?{" "}
          <Link to="/login" className="font-medium text-brand hover:text-brand-hover">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
