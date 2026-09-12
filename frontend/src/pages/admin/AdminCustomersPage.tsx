import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { customersApi } from "@/lib/endpoints";
import { formatAddress, formatCpf, formatDateTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";

const PAGE_SIZE = 10;

/**
 * Clientes — a listagem usa Spring Page (number/totalElements/totalPages,
 * §4.4), diferente do PageResponse de produtos/pedidos. Não há busca por
 * nome nem DELETE de cliente na API (§8 — o app antigo chamava endpoints
 * inexistentes).
 */
export function AdminCustomersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("pagina") ?? 0) || 0);

  const customers = useQuery({
    queryKey: ["customers", "admin", page],
    queryFn: () => customersApi.list(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Clientes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Perfis de cliente cadastrados, do mais recente ao mais antigo.
        </p>
      </div>

      {customers.isLoading ? (
        <SkeletonRows rows={8} height="h-12" />
      ) : customers.isError || !customers.data ? (
        <ErrorState
          message="Não foi possível carregar os clientes."
          onRetry={() => customers.refetch()}
        />
      ) : customers.data.content.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum cliente cadastrado"
          description="Os perfis são criados pelos próprios clientes no primeiro pedido."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-2 font-medium">CPF</th>
                  <th scope="col" className="px-4 py-2 font-medium">Telefone</th>
                  <th scope="col" className="px-4 py-2 font-medium">Cidade/UF</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Pedidos</th>
                  <th scope="col" className="px-4 py-2 font-medium">Desde</th>
                </tr>
              </thead>
              <tbody>
                {customers.data.content.map((c) => (
                  <tr key={c.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-zinc-900">{c.name}</p>
                      <p className="text-sm text-zinc-500">{c.email}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-sm">{formatCpf(c.cpf)}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600">{c.phone ?? "—"}</td>
                    <td
                      className="max-w-56 truncate px-4 py-2.5 text-sm text-zinc-600"
                      title={formatAddress(c.address)}
                    >
                      {c.address?.city
                        ? `${c.address.city}${c.address.state ? `/${c.address.state}` : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{c.totalOrders}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600">
                      {formatDateTime(c.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={customers.data.number}
            totalPages={customers.data.totalPages}
            totalElements={customers.data.totalElements}
            onPageChange={(p) => setSearchParams(p > 0 ? { pagina: String(p) } : {})}
          />
        </Card>
      )}
    </div>
  );
}
