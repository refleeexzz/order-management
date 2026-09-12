import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { productsApi } from "@/lib/endpoints";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ProductCard";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton, ErrorState } from "@/components/ui/States";
import { useCartStore } from "@/stores/cart";
import { toast } from "@/stores/toast";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = Number(id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  const product = useQuery({
    queryKey: ["products", "detail", productId],
    queryFn: () => productsApi.get(productId),
    enabled: Number.isFinite(productId) && productId > 0,
  });

  if (product.isLoading) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-2">
          <Skeleton className="aspect-square w-full" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (product.isError || !product.data) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <ErrorState
          title="Produto não encontrado"
          message="Este produto não existe ou foi removido da loja."
        />
        <div className="mt-4 text-center">
          <Link to="/produtos" className="text-sm font-medium text-brand hover:text-brand-hover">
            Voltar para o catálogo
          </Link>
        </div>
      </main>
    );
  }

  const p = product.data;
  const outOfStock = p.stockQuantity <= 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <nav aria-label="Trilha de navegação" className="mb-6 flex items-center gap-1 text-sm text-zinc-600">
        <Link to="/" className="hover:text-brand">Início</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link to="/produtos" className="hover:text-brand">Produtos</Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <Link to={`/produtos?categoria=${p.categoryId}`} className="hover:text-brand">
          {p.categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
        <span aria-current="page" className="truncate text-zinc-900">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductImage
          src={p.imageUrl}
          alt={p.name}
          className="aspect-square w-full rounded-lg border border-zinc-200"
        />

        <div className="flex flex-col">
          <Badge variant="brand" className="w-fit">{p.categoryName}</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
            {p.name}
          </h1>
          {p.sku && (
            <p className="mt-1 text-xs text-zinc-500">
              SKU <span className="font-mono">{p.sku}</span>
            </p>
          )}

          <p className="mt-4 text-4xl font-semibold text-zinc-900 tabular-nums">
            {formatMoney(p.price)}
          </p>

          <div className="mt-2">
            {outOfStock ? (
              <p className="text-base font-medium text-error">Produto esgotado</p>
            ) : p.stockQuantity <= 5 ? (
              <p className="text-base font-medium text-warning">
                Restam apenas {p.stockQuantity} unidades
              </p>
            ) : (
              <p className="text-base text-success">
                {p.stockQuantity} unidades em estoque
              </p>
            )}
          </div>

          {p.description && (
            <p className="mt-6 whitespace-pre-line text-base leading-relaxed text-zinc-700">
              {p.description}
            </p>
          )}

          <div className="mt-8 flex items-center gap-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <Truck className="h-5 w-5 shrink-0 text-brand" aria-hidden />
            <p className="text-sm text-zinc-700">
              Frete fixo de <strong>{formatMoney(15)}</strong> para todo o Brasil,
              calculado no checkout.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-md border border-zinc-300">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <span aria-live="polite" className="w-10 text-center text-base font-medium tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Aumentar quantidade"
                disabled={quantity >= p.stockQuantity}
                onClick={() => setQuantity((q) => Math.min(p.stockQuantity, q + 1))}
                className="flex h-9 w-9 items-center justify-center text-zinc-700 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-300"
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <Button
              size="lg"
              disabled={outOfStock}
              onClick={() => {
                addItem(p, quantity);
                toast.success("Adicionado ao carrinho", `${quantity} × ${p.name}`);
              }}
            >
              <ShoppingCart className="h-5 w-5" aria-hidden />
              {outOfStock ? "Indisponível" : "Adicionar ao carrinho"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
