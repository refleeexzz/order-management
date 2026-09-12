import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { ordersApi, paymentsApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import type { Order, Payment } from "@/lib/types";
import {
  formatAddress,
  formatDateTime,
  formatMoney,
  paymentMethodLabel,
} from "@/lib/format";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { OrderTimeline } from "@/components/OrderTimeline";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { ErrorState, Skeleton } from "@/components/ui/States";
import {
  PaymentFields,
  buildCardToken,
  isCardMethod,
  validateCard,
  type PaymentSelection,
} from "@/components/payment/PaymentFields";
import { toast } from "@/stores/toast";

function CancelOrderModal({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");

  const cancel = useMutation({
    // Cancelamento é POST /{id}/cancel?reason= (SPEC §4.5) — nunca PATCH.
    mutationFn: () => ordersApi.cancel(order.id, reason.trim()),
    onSuccess: () => {
      toast.success("Pedido cancelado", "O estoque foi devolvido à loja.");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      onClose();
    },
    onError: (err) => {
      toast.error(
        "Não foi possível cancelar",
        err instanceof ApiError ? err.message : undefined,
      );
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Cancelar pedido"
      description={`Pedido ${order.orderNumber} — o estoque dos itens será devolvido à loja.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Manter pedido
          </Button>
          <Button
            variant="danger"
            loading={cancel.isPending}
            onClick={() => cancel.mutate()}
          >
            Confirmar cancelamento
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="cancel-reason" className="text-sm font-medium text-zinc-700">
          Motivo do cancelamento
        </label>
        <Textarea
          id="cancel-reason"
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ex.: comprei por engano"
        />
      </div>
    </Modal>
  );
}

function PayOrderModal({
  order,
  open,
  onClose,
}: {
  order: Order;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selection, setSelection] = useState<PaymentSelection>({
    method: "PIX",
    installments: 1,
    card: { number: "", holder: "", expiry: "", cvv: "" },
  });
  const [error, setError] = useState<string | null>(null);

  const pay = useMutation({
    mutationFn: (): Promise<Payment> =>
      paymentsApi.process({
        orderId: order.id,
        method: selection.method,
        installments: selection.method === "CREDIT_CARD" ? selection.installments : 1,
        cardToken: buildCardToken(selection),
      }),
    onSuccess: (payment) => {
      if (payment.status === "PAID") {
        toast.success("Pagamento aprovado", `${paymentMethodLabel[payment.method]} · ${formatMoney(payment.amount)}`);
      } else {
        toast.error("Pagamento recusado", "Fale com o suporte da loja.");
      }
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      onClose();
    },
    onError: (err) => {
      setError(err instanceof ApiError ? err.message : "Não foi possível processar o pagamento.");
    },
  });

  function submit() {
    setError(null);
    if (isCardMethod(selection.method)) {
      const cardError = validateCard(selection.card);
      if (cardError) {
        setError(cardError);
        return;
      }
    }
    pay.mutate();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pagar pedido"
      description={`Total de ${formatMoney(order.total)} · ${order.orderNumber}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button loading={pay.isPending} onClick={submit}>
            Pagar {formatMoney(order.total)}
          </Button>
        </>
      }
    >
      {error && (
        <div role="alert" className="mb-4 rounded-md border border-red-200 bg-error-subtle px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <PaymentFields value={selection} onChange={setSelection} />
    </Modal>
  );
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const order = useQuery({
    queryKey: ["orders", "detail", orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: Number.isFinite(orderId) && orderId > 0,
  });

  const payment = useQuery({
    queryKey: ["payments", "by-order", orderId],
    queryFn: () => paymentsApi.byOrder(orderId),
    enabled: order.isSuccess && order.data.status !== "PENDING_PAYMENT",
    retry: false,
  });

  if (order.isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </main>
    );
  }

  if (order.isError || !order.data) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <ErrorState
          title="Pedido não encontrado"
          message={
            order.error instanceof ApiError && order.error.status === 400
              ? order.error.message
              : "Este pedido não existe ou não pertence à sua conta."
          }
        />
        <div className="mt-4 text-center">
          <Link to="/conta/pedidos" className="text-sm font-medium text-brand">
            Ver meus pedidos
          </Link>
        </div>
      </main>
    );
  }

  const o = order.data;
  const canCancel = o.status !== "DELIVERED" && o.status !== "CANCELLED";
  const canPay = o.status === "PENDING_PAYMENT";

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <nav aria-label="Trilha de navegação" className="mb-4 flex items-center gap-1 text-sm text-zinc-600">
        <Link to="/conta/pedidos" className="hover:text-brand">Meus pedidos</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span aria-current="page" className="font-mono text-zinc-900">{o.orderNumber}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-zinc-900">
            Pedido {o.orderNumber}
            <OrderStatusBadge status={o.status} />
          </h1>
          <p className="mt-1 text-sm text-zinc-600">Realizado em {formatDateTime(o.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          {canPay && <Button onClick={() => setPayOpen(true)}>Pagar agora</Button>}
          {canCancel && (
            <Button variant="outline" onClick={() => setCancelOpen(true)}>
              Cancelar pedido
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Acompanhamento" />
            <CardBody>
              <OrderTimeline order={o} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Itens do pedido" />
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                    <th scope="col" className="px-4 py-2 font-medium">Produto</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Qtd.</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Unitário</th>
                    <th scope="col" className="px-4 py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((item) => (
                    <tr key={item.id} className="border-b border-zinc-100 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{item.productName}</p>
                        {item.productSku && (
                          <p className="text-xs text-zinc-500 font-mono">{item.productSku}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{formatMoney(item.unitPrice)}</td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums">{formatMoney(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardBody className="border-t border-zinc-200">
              <dl className="ml-auto flex w-full max-w-xs flex-col gap-1.5 text-base">
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(o.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Desconto</dt>
                  <dd className="tabular-nums text-success">
                    {o.discount > 0 ? `− ${formatMoney(o.discount)}` : formatMoney(0)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-600">Frete</dt>
                  <dd className="tabular-nums">{formatMoney(o.shippingCost)}</dd>
                </div>
                <div className="flex justify-between border-t border-zinc-200 pt-2 font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(o.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {payment.data && (
            <Card>
              <CardHeader title="Pagamento" />
              <CardBody className="flex flex-col gap-2 text-base">
                <div className="flex justify-between">
                  <span className="text-zinc-600">Método</span>
                  <span className="font-medium">{paymentMethodLabel[payment.data.method]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Status</span>
                  <PaymentStatusBadge status={payment.data.status} />
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Valor</span>
                  <span className="font-medium tabular-nums">{formatMoney(payment.data.amount)}</span>
                </div>
                {payment.data.installments > 1 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Parcelas</span>
                    <span className="tabular-nums">{payment.data.installments}x</span>
                  </div>
                )}
                {payment.data.transactionId && (
                  <div>
                    <span className="text-zinc-600">Transação</span>
                    <p className="mt-0.5 break-all font-mono text-sm text-zinc-700">
                      {payment.data.transactionId}
                    </p>
                  </div>
                )}
                {payment.data.paidAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Pago em</span>
                    <span>{formatDateTime(payment.data.paidAt)}</span>
                  </div>
                )}
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Entrega" />
            <CardBody className="text-base text-zinc-700">
              {o.shippingAddress ? (
                <p>{formatAddress(o.shippingAddress)}</p>
              ) : (
                <p className="text-zinc-500">Endereço não informado.</p>
              )}
              {o.notes && (
                <p className="mt-3 border-t border-zinc-100 pt-3 text-sm text-zinc-600">
                  <span className="font-medium text-zinc-700">Observações: </span>
                  {o.notes}
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      <CancelOrderModal order={o} open={cancelOpen} onClose={() => setCancelOpen(false)} />
      <PayOrderModal order={o} open={payOpen} onClose={() => setPayOpen(false)} />
    </main>
  );
}
