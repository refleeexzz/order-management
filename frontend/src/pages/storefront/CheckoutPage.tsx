import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Tag, MapPin, CreditCard, UserRound } from "lucide-react";
import { customersApi, ordersApi, paymentsApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import type { Customer, Order, Payment } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCartStore, useCartSubtotal, SHIPPING_FLAT_RATE } from "@/stores/cart";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Field, Input, Textarea } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/States";
import { AddressFields, compactAddress, emptyAddress } from "@/components/AddressFields";
import {
  PaymentFields,
  buildCardToken,
  isCardMethod,
  validateCard,
  type PaymentSelection,
} from "@/components/payment/PaymentFields";

/** Pré-visualização local do desconto — o servidor aplica a mesma regra (FIRST10 = 10%). */
function previewDiscount(subtotal: number, coupon: string): number {
  return coupon.trim().toUpperCase() === "FIRST10"
    ? Math.round(subtotal * 0.1 * 100) / 100
    : 0;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);
  const subtotal = useCartSubtotal();

  const profile = useQuery({
    queryKey: ["customers", "me"],
    queryFn: customersApi.me,
    retry: (count, error) =>
      !(error instanceof ApiError && error.status === 404) && count < 1,
  });

  const [address, setAddress] = useState(emptyAddress);
  const [addressTouched, setAddressTouched] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState<PaymentSelection>({
    method: "PIX",
    installments: 1,
    card: { number: "", holder: "", expiry: "", cvv: "" },
  });
  // Quando o servidor responde 404 "Customer profile not found", abrimos esta seção.
  const [needsProfile, setNeedsProfile] = useState(false);
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const customer: Customer | null = profile.data ?? null;

  // Endereço efetivo: o que o usuário editou, ou o do perfil como ponto de partida.
  const effectiveAddress = addressTouched ? address : (customer?.address ?? address);

  const discount = useMemo(() => previewDiscount(subtotal, coupon), [subtotal, coupon]);
  const total = subtotal - discount + SHIPPING_FLAT_RATE;

  async function createOrderWithProfileRetry(): Promise<Order> {
    const body = {
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      shippingAddress: compactAddress(effectiveAddress),
      notes: notes.trim() || undefined,
      couponCode: coupon.trim() || undefined,
    };
    try {
      return await ordersApi.create(body);
    } catch (err) {
      if (
        err instanceof ApiError &&
        err.status === 404 &&
        err.message.includes("Customer profile not found")
      ) {
        // SPEC §5: checkout exige perfil de cliente — completar e tentar de novo.
        setNeedsProfile(true);
        throw new ApiError({
          status: 404,
          message: "Precisamos do seu CPF e telefone para emitir o pedido. Complete os dados abaixo.",
        });
      }
      throw err;
    }
  }

  async function ensureProfile(): Promise<void> {
    if (!needsProfile) return;
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      throw new ApiError({ status: 400, message: "Informe um CPF válido com 11 dígitos." });
    }
    await customersApi.create({
      cpf: cpf.trim(),
      phone: phone.trim() || undefined,
      address: compactAddress(effectiveAddress),
    });
    setNeedsProfile(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (isCardMethod(payment.method)) {
      const cardError = validateCard(payment.card);
      if (cardError) {
        setFormError(cardError);
        return;
      }
    }

    setSubmitting(true);
    try {
      await ensureProfile();
      const order = await createOrderWithProfileRetry();
      const processed: Payment = await paymentsApi.process({
        orderId: order.id,
        method: payment.method,
        installments: payment.method === "CREDIT_CARD" ? payment.installments : 1,
        cardToken: buildCardToken(payment),
      });
      clearCart();
      navigate(`/pedido/${order.id}/sucesso`, { state: { payment: processed } });
    } catch (err) {
      if (!(err instanceof ApiError && err.message.includes("Precisamos do seu CPF"))) {
        setFormError(
          err instanceof ApiError
            ? err.message
            : "Não foi possível concluir o pedido. Tente novamente.",
        );
      } else {
        setFormError(err.message);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Adicione produtos ao carrinho antes de finalizar a compra."
          action={
            <Link to="/produtos">
              <Button>Ver produtos</Button>
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        Finalizar compra
      </h1>

      <form onSubmit={onSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          {formError && (
            <div role="alert" className="rounded-md border border-red-200 bg-error-subtle px-4 py-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {needsProfile && (
            <Card className="border-amber-300">
              <CardHeader
                title={
                  <span className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-warning" aria-hidden />
                    Complete seu cadastro
                  </span>
                }
                description="CPF e telefone são obrigatórios para emitir o pedido. Salvo uma única vez."
              />
              <CardBody className="grid gap-4 sm:grid-cols-2">
                <Field label="CPF" htmlFor="checkout-cpf" required hint="Somente números ou 000.000.000-00">
                  <Input
                    id="checkout-cpf"
                    inputMode="numeric"
                    required
                    maxLength={14}
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="123.456.789-01"
                  />
                </Field>
                <Field label="Telefone" htmlFor="checkout-phone" hint="Com DDD">
                  <Input
                    id="checkout-phone"
                    inputMode="tel"
                    maxLength={15}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                  />
                </Field>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand" aria-hidden />
                  Endereço de entrega
                </span>
              }
              description={
                customer?.address && !addressTouched
                  ? "Usando o endereço do seu perfil. Edite se necessário."
                  : "Onde devemos entregar seu pedido."
              }
            />
            <CardBody>
              <AddressFields
                idPrefix="checkout-addr"
                value={effectiveAddress}
                onChange={(next) => {
                  setAddress(next);
                  setAddressTouched(true);
                }}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-brand" aria-hidden />
                  Pagamento
                </span>
              }
            />
            <CardBody>
              <PaymentFields value={payment} onChange={setPayment} />
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Observações" description="Opcional — instruções para a entrega ou o vendedor." />
            <CardBody>
              <Textarea
                aria-label="Observações do pedido"
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex.: entregar na portaria"
              />
            </CardBody>
          </Card>
        </div>

        <Card className="lg:sticky lg:top-24">
          <CardHeader title="Resumo" />
          <CardBody className="flex flex-col gap-4">
            <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto" aria-label="Itens do pedido">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-zinc-700">
                    {i.quantity} × {i.name}
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatMoney(i.price * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <Field
              label={
                <span className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5" aria-hidden />
                  Cupom de desconto
                </span>
              }
              htmlFor="checkout-coupon"
              hint={
                coupon.trim() && discount === 0
                  ? "Cupom não reconhecido — nenhum desconto aplicado."
                  : "Use FIRST10 para 10% de desconto."
              }
            >
              <Input
                id="checkout-coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="FIRST10"
                maxLength={30}
              />
            </Field>

            <dl className="flex flex-col gap-2 border-t border-zinc-200 pt-4 text-base">
              <div className="flex justify-between">
                <dt className="text-zinc-600">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-600">Desconto</dt>
                <dd className="font-medium tabular-nums text-success">
                  {discount > 0 ? `− ${formatMoney(discount)}` : formatMoney(0)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-600">Frete (fixo)</dt>
                <dd className="font-medium tabular-nums">{formatMoney(SHIPPING_FLAT_RATE)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatMoney(total)}</dd>
              </div>
            </dl>

            <Button type="submit" size="lg" loading={submitting} className="w-full">
              {submitting ? "Processando…" : `Pagar ${formatMoney(total)}`}
            </Button>
            <p className="text-center text-xs text-zinc-500">
              Ao confirmar, o estoque é reservado imediatamente e o pagamento é processado.
            </p>
          </CardBody>
        </Card>
      </form>
    </main>
  );
}
