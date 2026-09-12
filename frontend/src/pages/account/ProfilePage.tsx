import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customersApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import { formatAddress, formatCpf, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input } from "@/components/ui/Input";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { AddressFields, compactAddress, emptyAddress } from "@/components/AddressFields";
import { toast } from "@/stores/toast";

/**
 * Perfil do cliente (CPF, telefone, endereço).
 * GET /me 404 → formulário de criação (POST /api/customers).
 * Existente → edição (PUT /me — CPF não é editável, SPEC §5.4).
 */
export function ProfilePage() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const welcome = searchParams.get("boas-vindas") === "1";

  const profile = useQuery({
    queryKey: ["customers", "me"],
    queryFn: customersApi.me,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
  });

  const notFound = profile.error instanceof ApiError && profile.error.status === 404;

  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(emptyAddress);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (profile.data && !initialized) {
      setPhone(profile.data.phone ?? "");
      setAddress({ ...emptyAddress, ...profile.data.address });
      setInitialized(true);
    }
  }, [profile.data, initialized]);

  const save = useMutation({
    mutationFn: async () => {
      const cpfDigits = cpf.replace(/\D/g, "");
      const body = {
        cpf: cpf.trim(),
        phone: phone.trim() || undefined,
        address: compactAddress(address),
      };
      if (notFound) {
        if (cpfDigits.length !== 11) {
          throw new ApiError({ status: 400, message: "Informe um CPF válido com 11 dígitos." });
        }
        return customersApi.create(body);
      }
      // CPF não é atualizável — o backend ignora o campo no PUT /me.
      return customersApi.updateMe(body);
    },
    onSuccess: () => {
      toast.success(notFound ? "Perfil criado" : "Perfil atualizado", "Seus dados foram salvos.");
      queryClient.invalidateQueries({ queryKey: ["customers", "me"] });
      setError(null);
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar o perfil.");
    },
  });

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    save.mutate();
  }

  if (profile.isLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-6 h-96 w-full" />
      </main>
    );
  }

  if (profile.isError && !notFound) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <ErrorState
          message="Não foi possível carregar seu perfil."
          onRetry={() => profile.refetch()}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        {notFound ? "Complete seu perfil" : "Meu perfil"}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        {notFound
          ? welcome
            ? "Conta criada! Falta pouco: informe seu CPF e endereço para poder comprar."
            : "Precisamos do seu CPF e endereço para emitir pedidos."
          : "Seus dados de entrega e contato. O CPF não pode ser alterado."}
      </p>

      {profile.data && (
        <Card className="mt-6">
          <CardBody className="grid gap-2 text-base sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Nome</p>
              <p className="mt-0.5 text-zinc-900">{profile.data.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">E-mail</p>
              <p className="mt-0.5 text-zinc-900">{profile.data.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">CPF</p>
              <p className="mt-0.5 text-zinc-900">{formatCpf(profile.data.cpf)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Cliente desde</p>
              <p className="mt-0.5 text-zinc-900">{formatDateTime(profile.data.createdAt)}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Endereço atual</p>
              <p className="mt-0.5 text-zinc-900">{formatAddress(profile.data.address)}</p>
            </div>
          </CardBody>
        </Card>
      )}

      <form onSubmit={onSubmit} className="mt-6">
        <Card>
          <CardHeader
            title={notFound ? "Dados do perfil" : "Atualizar dados"}
            description={notFound ? "CPF é obrigatório e só pode ser definido uma vez." : undefined}
          />
          <CardBody className="flex flex-col gap-4">
            {error && (
              <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {notFound && (
                <Field label="CPF" htmlFor="profile-cpf" required hint="Somente números ou 000.000.000-00">
                  <Input
                    id="profile-cpf"
                    inputMode="numeric"
                    required
                    maxLength={14}
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="123.456.789-01"
                  />
                </Field>
              )}
              <Field label="Telefone" htmlFor="profile-phone" hint="Com DDD, ex.: (11) 98765-4321">
                <Input
                  id="profile-phone"
                  inputMode="tel"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 98765-4321"
                />
              </Field>
            </div>
            <fieldset>
              <legend className="mb-4 text-sm font-medium text-zinc-700">Endereço de entrega</legend>
              <AddressFields idPrefix="profile-addr" value={address} onChange={setAddress} />
            </fieldset>
            <div>
              <Button type="submit" loading={save.isPending}>
                {notFound ? "Criar perfil" : "Salvar alterações"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </main>
  );
}
