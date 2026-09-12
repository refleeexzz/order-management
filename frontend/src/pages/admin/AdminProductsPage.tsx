import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { Plus, Search, Package, Pencil, Ban } from "lucide-react";
import { productsApi } from "@/lib/endpoints";
import { ApiError } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { ProductImage } from "@/components/ProductCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/ui/States";
import { ProductFormModal } from "./ProductFormModal";
import { toast } from "@/stores/toast";

const PAGE_SIZE = 10;

function DeactivateModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const deactivate = useMutation({
    // Soft delete: DELETE → 204, produto fica inativo (SPEC §4.3).
    mutationFn: () => productsApi.deactivate(product.id),
    onSuccess: () => {
      toast.success("Produto desativado", product.name);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    },
    onError: (err) => {
      toast.error(
        "Não foi possível desativar",
        err instanceof ApiError ? err.message : undefined,
      );
    },
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Desativar produto"
      description="O produto sai da vitrine, mas continua no histórico de pedidos."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button variant="danger" loading={deactivate.isPending} onClick={() => deactivate.mutate()}>
            Desativar
          </Button>
        </>
      }
    >
      <p className="text-base text-zinc-700">
        Desativar <strong>{product.name}</strong>? Ele deixará de aparecer na loja
        imediatamente.
      </p>
    </Modal>
  );
}

export function AdminProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(0, Number(searchParams.get("pagina") ?? 0) || 0);
  const query = searchParams.get("busca") ?? "";
  const [searchInput, setSearchInput] = useState(query);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deactivating, setDeactivating] = useState<Product | null>(null);

  // Busca usa /api/products/search?query= (§4.3) — nunca um parâmetro "name".
  const products = useQuery({
    queryKey: ["products", "admin", { query, page }],
    queryFn: () =>
      query.trim()
        ? productsApi.search(query.trim(), page, PAGE_SIZE)
        : productsApi.list(page, PAGE_SIZE),
    placeholderData: keepPreviousData,
  });

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchInput.trim()) params.set("busca", searchInput.trim());
    setSearchParams(params);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Catálogo ativo da loja, ordenado por nome.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" aria-hidden />
          Novo produto
        </Button>
      </div>

      <form onSubmit={onSearch} role="search" className="flex gap-2">
        <div className="relative w-full max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <Input
            type="search"
            aria-label="Buscar produtos"
            placeholder="Buscar por nome…"
            className="pl-9"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" variant="outline">
          Buscar
        </Button>
        {query && (
          <Button
            variant="ghost"
            onClick={() => {
              setSearchInput("");
              setSearchParams({});
            }}
          >
            Limpar
          </Button>
        )}
      </form>

      {products.isLoading ? (
        <SkeletonRows rows={6} height="h-14" />
      ) : products.isError || !products.data ? (
        <ErrorState
          message="Não foi possível carregar os produtos."
          onRetry={() => products.refetch()}
        />
      ) : products.data.content.length === 0 ? (
        <EmptyState
          icon={Package}
          title={query ? `Nada encontrado para "${query}"` : "Nenhum produto cadastrado"}
          description={
            query
              ? "Tente outro termo de busca."
              : "Cadastre o primeiro produto para começar a vender."
          }
          action={
            !query && (
              <Button
                onClick={() => {
                  setEditing(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Criar produto
              </Button>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500">
                  <th scope="col" className="px-4 py-2 font-medium">Produto</th>
                  <th scope="col" className="px-4 py-2 font-medium">Categoria</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Preço</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Estoque</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.data.content.map((p) => (
                  <tr key={p.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={p.imageUrl}
                          alt=""
                          className="h-10 w-10 shrink-0 rounded-md border border-zinc-100"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-zinc-900">{p.name}</p>
                          {p.sku && (
                            <p className="font-mono text-xs text-zinc-500">{p.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant="neutral">{p.categoryName}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatMoney(p.price)}</td>
                    <td className="px-4 py-2.5 text-right">
                      {p.stockQuantity === 0 ? (
                        <Badge variant="error">Esgotado</Badge>
                      ) : p.stockQuantity <= 5 ? (
                        <span className="font-medium text-warning tabular-nums">
                          {p.stockQuantity}
                        </span>
                      ) : (
                        <span className="tabular-nums">{p.stockQuantity}</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Editar ${p.name}`}
                          onClick={() => {
                            setEditing(p);
                            setFormOpen(true);
                          }}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                        >
                          <Pencil className="h-4 w-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          aria-label={`Desativar ${p.name}`}
                          onClick={() => setDeactivating(p)}
                          className="rounded-md p-2 text-zinc-500 transition-colors hover:bg-error-subtle hover:text-error"
                        >
                          <Ban className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={products.data.page}
            totalPages={products.data.totalPages}
            totalElements={products.data.totalElements}
            onPageChange={(p) => {
              const params = new URLSearchParams(searchParams);
              if (p > 0) params.set("pagina", String(p));
              else params.delete("pagina");
              setSearchParams(params);
            }}
          />
        </Card>
      )}

      <ProductFormModal
        product={editing}
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
      {deactivating && (
        <DeactivateModal
          product={deactivating}
          open={Boolean(deactivating)}
          onClose={() => setDeactivating(null)}
        />
      )}
    </div>
  );
}
