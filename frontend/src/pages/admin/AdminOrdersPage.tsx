import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { ClipboardList } from "lucide-react";
import { ordersApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import type { Order, OrderStatus } from "@/lib/types";
import {
  ORDER_STATUSES,
  formatAddress,
  formatDateTime,
  formatMoney,
  orderStatusLabel,
} from "@/lib/format";
import { OrderStatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, Skeleton, SkeletonRows } from "@/components/ui/States";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

/** Próximas transições válidas (SPEC §5.5) — inválidas voltam 400/500 e viram toast. */
const nextTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "SHIPPED", "CANCELLED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};

const actionLabel: Partial<Record<OrderStatus, string>> = {
  PAID: "Confirmar pagamento",
  PROCESSING: "Iniciar preparação",
  SHIPPED: "Marcar como enviado",
  DELIVERED: "Marcar como entregue",
  CANCELLED: "Cancelar pedido",
};

function OrderDetailDrawer({
  orderId,
  onClose,
}: {
  orderId: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const order = useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => ordersApi.get(orderId),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: number; status: OrderStatus }) =>
      ordersApi.updateStatus(id, { status }),
    onSuccess: (_, { status }) => {
      toast.success(
        status === "CANCELLED" ? "Pedido cancelado" : "Status atualizado",
        status === "CANCELLED" ? "O estoque foi devolvido à loja." : undefined,
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      toast.error(
        "Transição não permitida",
        err instanceof ApiError ? err.message : "Tente novamente.",
      );
    },
  });

  return (
    <Drawer
      open
      onClose={onClose}
      title={order.data ? `Pedido ${order.data.orderNumber}` : "Pedido"}
      description={order.data ? formatDateTime(order.data.createdAt) : undefined}
    >
      {order.isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : order.isError || !order.data ? (
        <ErrorState
          message="Não foi possível carregar o pedido."
          onRetry={() => order.refetch()}
        />
      ) : (
        <OrderDrawerBody
          order={order.data}
          busy={updateStatus.isPending}
          onTransition={(status) => updateStatus.mutate({ id: order.data.id, status })}
        />
      )}
    </Drawer>
  );
}

function OrderDrawerBody({
  order,
  busy,
  onTransition,
}: {
  order: Order;
  busy: boolean;
  onTransition: (status: OrderStatus) => void;
}) {
  const transitions = nextTransitions[order.status];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">Cliente</p>
          <p className="mt-0.5 text-base font-medium text-zinc-900">{order.customerName}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {transitions.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Ações</p>
          <div className="flex flex-wrap gap-2">
            {transitions.map((status) => (
              <Button
                key={status}
                size="sm"
                variant={status === "CANCELLED" ? "danger" : "primary"}
                disabled={busy}
                onClick={() => onTransition(status)}
              >
                {actionLabel[status]}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Itens</h3>
        <ul className="mt-2 flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-zinc-900">
                  {item.productName}
                </p>
                <p className="text-xs text-zinc-500">
                  {item.quantity} × {formatMoney(item.unitPrice)}
                  {item.productSku ? ` · ${item.productSku}` : ""}
                </p>
              </div>
              <p className="shrink-0 text-base font-medium tabular-nums">
                {formatMoney(item.total)}
              </p>
            </li>
          ))}
        </ul>
        <dl className="mt-3 flex flex-col gap-1.5 text-base">
          <div className="flex justify-between">
            <dt className="text-zinc-600">Subtotal</dt>
            <dd className="tabular-nums">{formatMoney(order.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-600">Desconto</dt>
            <dd className="tabular-nums text-success">
              {order.discount > 0 ? `− ${formatMoney(order.discount)}` : formatMoney(0)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-zinc-600">Frete</dt>
            <dd className="tabular-nums">{formatMoney(order.shippingCost)}</dd>
          </div>
          <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold">
            <dt>Total</dt>
            <dd className="tabular-nums">{formatMoney(order.total)}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Entrega</h3>
        <p className="mt-2 text-base text-zinc-700">{formatAddress(order.shippingAddress)}</p>
        {order.notes && (
          <p className="mt-2 text-sm text-zinc-600">
            <span className="font-medium text-zinc-700">Observações: </span>
            {order.notes}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Datas</h3>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {(
            [
              ["Criado", order.createdAt],
              ["Pago", order.paidAt],
              ["Enviado", order.shippedAt],
              ["Entregue", order.deliveredAt],
              ["Cancelado", order.cancelledAt],
            ] as const
          ).map(([label, at]) => (
            <div key={label}>
              <dt className="text-zinc-500">{label}</dt>
              <dd className="text-zinc-900">{formatDateTime(at)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

export function AdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("pagina") ?? 0) || 0);
  const status = (searchParams.get("status") ?? "") as OrderStatus | "";
  const [selected, setSelected] = useState<number | null>(null);

  // Filtro por status usa /api/orders/status/{status} (§4.5) — nunca query param.
  const orders = useQuery({
    queryKey: ["orders", "admin", { status, page }],
    queryFn: () =>
      status
        ? ordersApi.byStatus(status, page, PAGE_SIZE)
        : ordersApi.list(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  function setFilter(next: { status?: string; pagina?: number }) {
    const params = new URLSearchParams();
    const s = next.status ?? status;
    const p = next.pagina ?? 0;
    if (s) params.set("status", s);
    if (p > 0) params.set("pagina", String(p));
    setSearchParams(params);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Todos os pedidos da loja, do mais recente ao mais antigo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="orders-status-filter" className="text-sm font-medium text-zinc-700">
            Status
          </label>
          <Select
            id="orders-status-filter"
            value={status}
            onChange={(e) => setFilter({ status: e.target.value, pagina: 0 })}
            className="w-52"
          >
            <option value="">Todos</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {orderStatusLabel[s]}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Chips de status (acesso rápido) */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtro rápido por status">
        <button
          type="button"
          aria-pressed={status === ""}
          onClick={() => setFilter({ status: "", pagina: 0 })}
          className={cn(
            "h-8 rounded-md border px-3 text-sm font-medium transition-colors",
            status === ""
              ? "border-brand bg-brand-subtle text-brand-active"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
          )}
        >
          Todos
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={status === s}
            onClick={() => setFilter({ status: s, pagina: 0 })}
            className={cn(
              "h-8 rounded-md border px-3 text-sm font-medium transition-colors",
              status === s
                ? "border-brand bg-brand-subtle text-brand-active"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            )}
          >
            {orderStatusLabel[s]}
          </button>
        ))}
      </div>

      {orders.isLoading ? (
        <SkeletonRows rows={8} height="h-12" />
      ) : orders.isError || !orders.data ? (
        <ErrorState
          message="Não foi possível carregar os pedidos."
          onRetry={() => orders.refetch()}
        />
      ) : orders.data.content.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum pedido encontrado"
          description={
            status
              ? `Não há pedidos com status "${orderStatusLabel[status]}".`
              : "Os pedidos aparecem aqui assim que os clientes compram."
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">Pedido</th>
                  <th scope="col" className="px-4 py-2 font-medium">Cliente</th>
                  <th scope="col" className="px-4 py-2 font-medium">Data</th>
                  <th scope="col" className="px-4 py-2 font-medium">Status</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.content.map((o) => (
                  <tr
                    key={o.id}
                    tabIndex={0}
                    role="button"
                    aria-label={`Abrir detalhes do pedido ${o.orderNumber}`}
                    onClick={() => setSelected(o.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelected(o.id);
                      }
                    }}
                    className="cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50"
                  >
                    <td className="px-4 py-2.5 font-mono text-sm">{o.orderNumber}</td>
                    <td className="px-4 py-2.5">{o.customerName}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-600">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-4 py-2.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                      {formatMoney(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={orders.data.page}
            totalPages={orders.data.totalPages}
            totalElements={orders.data.totalElements}
            onPageChange={(p) => setFilter({ pagina: p })}
          />
        </Card>
      )}

      {selected !== null && (
        <OrderDetailDrawer orderId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
