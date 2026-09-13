import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore, useCartSubtotal, SHIPPING_FLAT_RATE } from "@/stores/cart";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/States";

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartSubtotal();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <EmptyState
          icon={ShoppingCart}
          title="Seu carrinho está vazio"
          description="Navegue pelo catálogo e adicione produtos para começar seu pedido."
          action={
            <Link to="/produtos">
              <Button>Ver produtos</Button>
            </Link>
          }
        />
      </main>
    );
  }

  const total = subtotal + SHIPPING_FLAT_RATE;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Carrinho</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {items.length} {items.length === 1 ? "produto" : "produtos"} no carrinho
      </p>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_360px]">
        <ul className="flex flex-col gap-4" aria-label="Itens do carrinho">
          {items.map((item) => (
            <li
              key={item.productId}
              className="flex gap-4 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <Link to={`/produtos/${item.productId}`} className="shrink-0">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 rounded-md border border-zinc-100"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  to={`/produtos/${item.productId}`}
                  className="truncate text-base font-medium text-zinc-900 hover:text-brand"
                >
                  {item.name}
                </Link>
                <p className="mt-0.5 text-sm text-zinc-600 tabular-nums">
                  {formatMoney(item.price)} cada
                </p>
                {item.quantity >= item.stockQuantity && (
                  <p className="mt-1 text-xs font-medium text-warning">
                    Limite de estoque: {item.stockQuantity} unidades
                  </p>
                )}
                <div className="mt-auto flex items-center justify-between gap-4 pt-3">
                  <div className="flex items-center rounded-md border border-zinc-300">
                    <button
                      type="button"
                      aria-label={`Diminuir quantidade de ${item.name}`}
                      onClick={() => setQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100"
                    >
                      <Minus className="h-4 w-4" aria-hidden />
                    </button>
                    <span className="w-9 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label={`Aumentar quantidade de ${item.name}`}
                      disabled={item.quantity >= item.stockQuantity}
                      onClick={() => setQuantity(item.productId, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
                    >
                      <Plus className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-base font-semibold text-zinc-900 tabular-nums">
                      {formatMoney(item.price * item.quantity)}
                    </p>
                    <button
                      type="button"
                      aria-label={`Remover ${item.name} do carrinho`}
                      onClick={() => removeItem(item.productId)}
                      className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-error-subtle hover:text-error"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <Card className="lg:sticky lg:top-24">
          <CardHeader title="Resumo do pedido" />
          <CardBody className="flex flex-col gap-3">
            <dl className="flex flex-col gap-2 text-base">
              <div className="flex justify-between">
                <dt className="text-zinc-600">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-600">Frete (fixo)</dt>
                <dd className="font-medium tabular-nums">{formatMoney(SHIPPING_FLAT_RATE)}</dd>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-3 text-lg font-semibold">
                <dt>Total estimado</dt>
                <dd className="tabular-nums">{formatMoney(total)}</dd>
              </div>
            </dl>
            <p className="text-xs text-zinc-500">
              Cupons de desconto são aplicados na próxima etapa, antes do pagamento.
            </p>
            <Button size="lg" onClick={() => navigate("/checkout")}>
              Finalizar compra
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Button>
            <Link
              to="/produtos"
              className="text-center text-sm font-medium text-brand hover:text-brand-hover"
            >
              Continuar comprando
            </Link>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
