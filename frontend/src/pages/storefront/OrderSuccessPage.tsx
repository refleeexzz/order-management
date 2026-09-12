import { useLocation, useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Copy } from "lucide-react";
import { ordersApi, paymentsApi } from "@/lib/endpoints";
import type { Payment } from "@/lib/types";
import { formatMoney, paymentMethodLabel, formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/States";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { toast } from "@/stores/toast";

export function OrderSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const location = useLocation();
  const paymentFromState = (location.state as { payment?: Payment } | null)?.payment;

  const order = useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: Number.isFinite(orderId) && orderId > 0,
  });

  const paymentQuery = useQuery({
    queryKey: ["payments", "by-order", orderId],
    queryFn: () => paymentsApi.byOrder(orderId),
    enabled: !paymentFromState && Number.isFinite(orderId) && orderId > 0,
    retry: false,
  });

  const payment = paymentFromState ?? paymentQuery.data ?? null;

  if (order.isLoading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-48 w-full" />
      </main>
    );
  }

  if (order.isError || !order.data) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Pedido não encontrado</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Não conseguimos localizar este pedido na sua conta.
        </p>
        <Link to="/conta/pedidos" className="mt-4 inline-block text-sm font-medium text-brand">
          Ver meus pedidos
        </Link>
      </main>
    );
  }

  const o = order.data;
  const approved = payment?.status === "PAID";

  return (
    <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-success-subtle text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden />
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-900">
          {approved ? "Pedido confirmado!" : "Pedido criado!"}
        </h1>
        <p className="mt-2 text-md text-zinc-600">
          {approved
            ? "Seu pagamento foi aprovado e o pedido já está sendo preparado."
            : "Recebemos seu pedido. Assim que o pagamento for confirmado, começamos a preparar."}
        </p>
      </div>

      <Card className="mt-8">
        <CardBody className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-500">Número do pedido</p>
              <p className="mt-0.5 flex items-center gap-2 font-mono text-base font-medium text-zinc-900">
                {o.orderNumber}
                <button
                  type="button"
                  aria-label="Copiar número do pedido"
                  onClick={() => {
                    navigator.clipboard?.writeText(o.orderNumber);
                    toast.success("Número copiado");
                  }}
                  className="rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  <Copy className="h-4 w-4" aria-hidden />
                </button>
              </p>
            </div>
            <OrderStatusBadge status={o.status} />
          </div>

          <dl className="grid gap-3 border-t border-zinc-200 pt-4 text-base sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Total</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatMoney(o.total)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Pagamento</dt>
              <dd className="mt-0.5 flex items-center gap-2">
                {payment ? (
                  <>
                    <span>{paymentMethodLabel[payment.method]}</span>
                    <PaymentStatusBadge status={payment.status} />
                  </>
                ) : (
                  <span className="text-zinc-600">—</span>
                )}
              </dd>
            </div>
            {payment?.transactionId && (
              <div className="sm:col-span-2">
                <dt className="text-xs uppercase tracking-wide text-zinc-500">Transação</dt>
                <dd className="mt-0.5 font-mono text-sm text-zinc-700">{payment.transactionId}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Realizado em</dt>
              <dd className="mt-0.5 text-zinc-700">{formatDateTime(o.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">Itens</dt>
              <dd className="mt-0.5 text-zinc-700">
                {o.items.reduce((sum, i) => sum + i.quantity, 0)}{" "}
                {o.items.reduce((sum, i) => sum + i.quantity, 0) === 1 ? "item" : "itens"}
              </dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/conta/pedidos/${o.id}`}>
          <Button>Acompanhar pedido</Button>
        </Link>
        <Link to="/produtos">
          <Button variant="outline">Continuar comprando</Button>
        </Link>
      </div>
    </main>
  );
}
