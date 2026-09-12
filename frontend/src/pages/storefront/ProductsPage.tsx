import { useSearchParams } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { SearchX } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/endpoints";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

export function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const categoryId = Number(searchParams.get("categoria") ?? 0) || 0;
  const page = Math.max(0, Number(searchParams.get("pagina") ?? 0) || 0);

  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.listActive,
  });

  const products = useQuery({
    queryKey: ["products", "catalog", { query, categoryId, page }],
    queryFn: () => {
      if (query) return productsApi.search(query, page, PAGE_SIZE);
      if (categoryId) return productsApi.byCategory(categoryId, page, PAGE_SIZE);
      return productsApi.list(page, PAGE_SIZE);
    },
    placeholderData: keepPreviousData,
  });

  function setParams(next: { q?: string; categoria?: number; pagina?: number }) {
    const params = new URLSearchParams();
    const q = next.q ?? query;
    const cat = next.categoria ?? categoryId;
    const pg = next.pagina ?? 0;
    if (q) params.set("q", q);
    if (cat) params.set("categoria", String(cat));
    if (pg > 0) params.set("pagina", String(pg));
    setSearchParams(params);
  }

  const activeCategory = categories.data?.find((c) => c.id === categoryId);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        {query
          ? `Resultados para "${query}"`
          : activeCategory
            ? activeCategory.name
            : "Todos os produtos"}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        {products.data
          ? `${products.data.totalElements} ${products.data.totalElements === 1 ? "produto encontrado" : "produtos encontrados"}`
          : "Carregando catálogo…"}
      </p>

      {/* Filtro de categoria */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          onClick={() => setParams({ categoria: 0, pagina: 0 })}
          aria-pressed={categoryId === 0}
          className={cn(
            "inline-flex h-9 items-center rounded-md border px-4 text-sm font-medium transition-colors",
            categoryId === 0
              ? "border-brand bg-brand-subtle text-brand-active"
              : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
          )}
        >
          Todas
        </button>
        {categories.data?.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setParams({ categoria: c.id, pagina: 0 })}
            aria-pressed={categoryId === c.id}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
              categoryId === c.id
                ? "border-brand bg-brand-subtle text-brand-active"
                : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Resultados */}
      <div className="mt-8">
        {products.isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.isError || !products.data ? (
          <ErrorState
            message="Não foi possível carregar os produtos."
            onRetry={() => products.refetch()}
          />
        ) : products.data.content.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Nenhum produto encontrado"
            description={
              query
                ? `Não encontramos nada para "${query}". Tente outro termo ou navegue pelas categorias.`
                : "Esta categoria ainda não tem produtos ativos."
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.data.content.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-zinc-200 bg-white">
              <Pagination
                page={products.data.page}
                totalPages={products.data.totalPages}
                totalElements={products.data.totalElements}
                onPageChange={(p) => setParams({ pagina: p })}
              />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
