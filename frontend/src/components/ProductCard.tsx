import { Link } from "react-router-dom";
import { ImageOff, ShoppingCart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/stores/cart";
import { toast } from "@/stores/toast";
import { cn } from "@/lib/utils";

export function ProductImage({
  src,
  alt,
  className,
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          "flex items-center justify-center bg-zinc-100 text-zinc-300",
          className,
        )}
      >
        <ImageOff className="h-10 w-10" aria-hidden />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={cn("bg-zinc-100 object-cover", className)}
      onError={(e) => {
        // Imagem quebrada → placeholder neutro, nunca o glifo de imagem quebrada
        e.currentTarget.style.display = "none";
        e.currentTarget.parentElement?.classList.add("bg-zinc-100");
      }}
    />
  );
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const outOfStock = product.stockQuantity <= 0;
  const lowStock = !outOfStock && product.stockQuantity <= 5;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition-shadow duration-150 hover:shadow-md">
      <Link
        to={`/produtos/${product.id}`}
        className="block overflow-hidden rounded-none"
        aria-label={`Ver detalhes de ${product.name}`}
      >
        <ProductImage
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full transition-transform duration-200 group-hover:scale-[1.02]"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs text-zinc-500">{product.categoryName}</p>
        <Link
          to={`/produtos/${product.id}`}
          className="line-clamp-2 text-base font-medium text-zinc-900 hover:text-brand"
        >
          {product.name}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            <p className="text-lg font-semibold text-zinc-900 tabular-nums">
              {formatMoney(product.price)}
            </p>
            {outOfStock ? (
              <p className="text-xs font-medium text-error">Esgotado</p>
            ) : lowStock ? (
              <p className="text-xs font-medium text-warning">
                Restam {product.stockQuantity} unidades
              </p>
            ) : (
              <p className="text-xs text-zinc-500">Em estoque</p>
            )}
          </div>
          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              addItem(product);
              toast.success("Adicionado ao carrinho", product.name);
            }}
            aria-label={outOfStock ? `${product.name} esgotado` : `Adicionar ${product.name} ao carrinho`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="aspect-square w-full animate-pulse bg-zinc-200 motion-reduce:animate-none" />
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded-sm bg-zinc-200 motion-reduce:animate-none" />
        <div className="h-4 w-full animate-pulse rounded-sm bg-zinc-200 motion-reduce:animate-none" />
        <div className="h-6 w-24 animate-pulse rounded-sm bg-zinc-200 motion-reduce:animate-none" />
      </div>
    </div>
  );
}
