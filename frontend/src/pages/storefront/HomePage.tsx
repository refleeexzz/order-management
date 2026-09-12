import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Truck, ShieldCheck, Tag } from "lucide-react";
import { productsApi, categoriesApi } from "@/lib/endpoints";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import { ErrorState } from "@/components/ui/States";

export function HomePage() {
  const categories = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.listActive,
  });
  const featured = useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => productsApi.list(0, 8),
  });

  return (
    <main>
      {/* Hero — superfície plana, conteúdo concreto, sem gradientes decorativos */}
      <section className="border-b border-zinc-200 bg-brand-subtle">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-900">
            Compre de pequenos lojistas do Brasil inteiro
          </h1>
          <p className="mt-4 max-w-xl text-lg text-zinc-600">
            Frete fixo de R$ 15,00 para qualquer pedido, pagamento por PIX com
            aprovação na hora e 10% de desconto no primeiro pedido com o cupom
            FIRST10.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/produtos"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-md font-medium text-white transition-colors hover:bg-brand-hover"
            >
              Ver todos os produtos
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <dl className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Frete fixo R$ 15,00", text: "Para todo o Brasil, em qualquer pedido." },
              { icon: ShieldCheck, title: "Compra protegida", text: "Acompanhe cada etapa do pedido na sua conta." },
              { icon: Tag, title: "Cupom FIRST10", text: "10% de desconto no subtotal do primeiro pedido." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden />
                <div>
                  <dt className="text-base font-medium text-zinc-900">{title}</dt>
                  <dd className="mt-0.5 text-sm text-zinc-600">{text}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Categorias */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="home-categorias">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="home-categorias" className="text-2xl font-semibold tracking-tight text-zinc-900">
            Categorias
          </h2>
        </div>
        {categories.isLoading ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-9 w-28 animate-pulse rounded-md bg-zinc-200 motion-reduce:animate-none" />
            ))}
          </div>
        ) : categories.isError || !categories.data ? (
          <p className="mt-6 text-sm text-zinc-600">Não foi possível carregar as categorias.</p>
        ) : categories.data.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">Nenhuma categoria disponível no momento.</p>
        ) : (
          <ul className="mt-6 flex flex-wrap gap-2">
            {categories.data.map((c) => (
              <li key={c.id}>
                <Link
                  to={`/produtos?categoria=${c.id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:border-brand hover:text-brand"
                >
                  {c.name}
                  <span className="text-xs text-zinc-400 tabular-nums">{c.productCount}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Produtos em destaque */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6" aria-labelledby="home-destaques">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="home-destaques" className="text-2xl font-semibold tracking-tight text-zinc-900">
            Produtos em destaque
          </h2>
          <Link to="/produtos" className="text-sm font-medium text-brand hover:text-brand-hover">
            Ver todos
          </Link>
        </div>
        {featured.isLoading ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : featured.isError || !featured.data ? (
          <div className="mt-6">
            <ErrorState
              message="Não foi possível carregar os produtos em destaque."
              onRetry={() => featured.refetch()}
            />
          </div>
        ) : featured.data.content.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-600">
            Ainda não há produtos cadastrados. Volte em breve.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.data.content.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
