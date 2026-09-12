import { Link, useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ClipboardList, ChevronRight } from "lucide-react";
import { ordersApi } from "@/lib/endpoints";
import { formatDateTime, formatMoney } from "@/lib/format";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";

export function MyOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("pagina") ?? 0) || 0);

  const orders = useQuery({
    queryKey: ["orders", "my-orders", page],
    queryFn: () => ordersApi.myOrders(page, 10),
    placeholderData: keepPreviousData,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Meus pedidos</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Acompanhe o status, pague pedidos pendentes ou cancele quando necessário.
      </p>

      <div className="mt-8">
        {orders.isLoading ? (
          <SkeletonRows rows={4} height="h-20" />
        ) : orders.isError || !orders.data ? (
          <ErrorState
            message="Não foi possível carregar seus pedidos."
            onRetry={() => orders.refetch()}
          />
        ) : orders.data.content.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não fez nenhum pedido"
            description="Quando você comprar, seus pedidos aparecem aqui com o acompanhamento completo."
            action={
              <Link to="/produtos">
                <Button>Começar a comprar</Button>
              </Link>
            }
          />
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {orders.data.content.map((o) => (
                <li key={o.id}>
                  <Link to={`/conta/pedidos/${o.id}`} className="block rounded-lg">
                    <Card className="transition-shadow duration-150 hover:shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-mono text-base font-medium text-zinc-900">
                            {o.orderNumber}
                          </p>
                          <p className="mt-0.5 text-sm text-zinc-600">
                            {formatDateTime(o.createdAt)} ·{" "}
                            {o.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                            {o.items.reduce((sum, i) => sum + i.quantity, 0) === 1
                              ? "item"
                              : "itens"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <OrderStatusBadge status={o.status} />
                          <p className="text-base font-semibold tabular-nums">
                            {formatMoney(o.total)}
                          </p>
                          <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden />
                        </div>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg border border-zinc-200 bg-white">
              <Pagination
                page={orders.data.page}
                totalPages={orders.data.totalPages}
                totalElements={orders.data.totalElements}
                onPageChange={(p) => setSearchParams(p > 0 ? { pagina: String(p) } : {})}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
