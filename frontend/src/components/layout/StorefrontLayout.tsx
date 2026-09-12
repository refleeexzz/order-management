import { useState, type FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Store, Search, ShoppingCart, User, LogOut, LayoutDashboard, Package, ClipboardList } from "lucide-react";
import { useAuthStore, useIsAdmin, useIsAuthenticated } from "@/stores/auth";
import { useCartCount } from "@/stores/cart";

function Header() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const cartCount = useCartCount();
  const isAuthenticated = useIsAuthenticated();
  const isAdmin = useIsAdmin();
  const name = useAuthStore((s) => s.name);
  const clearSession = useAuthStore((s) => s.clearSession);

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2 text-lg font-semibold tracking-tight text-zinc-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-white">
            <Store className="h-5 w-5" aria-hidden />
          </span>
          Loja Verde
        </Link>

        <form onSubmit={onSearch} role="search" className="hidden flex-1 md:flex">
          <div className="relative w-full max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar produtos…"
              aria-label="Buscar produtos"
              className="h-9 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-base placeholder:text-zinc-400 hover:border-zinc-400 focus:border-brand"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1 sm:gap-2" aria-label="Navegação principal">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:inline-flex"
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
              Painel
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link
                to="/conta/pedidos"
                className="hidden items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 sm:inline-flex"
              >
                <Package className="h-4 w-4" aria-hidden />
                Meus pedidos
              </Link>
              <div className="relative hidden sm:block">
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 [&::-webkit-details-marker]:hidden">
                    <User className="h-4 w-4" aria-hidden />
                    <span className="max-w-28 truncate">{name}</span>
                  </summary>
                  <div className="absolute right-0 mt-1 w-48 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    <Link
                      to="/conta/perfil"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      <User className="h-4 w-4" aria-hidden />
                      Meu perfil
                    </Link>
                    <Link
                      to="/conta/pedidos"
                      className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      <ClipboardList className="h-4 w-4" aria-hidden />
                      Meus pedidos
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        clearSession();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                    >
                      <LogOut className="h-4 w-4" aria-hidden />
                      Sair
                    </button>
                  </div>
                </details>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
            >
              <User className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
          <Link
            to="/carrinho"
            aria-label={`Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
            className="relative inline-flex items-center justify-center rounded-md p-2 text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-sm bg-brand px-1 text-xs font-medium text-white tabular-nums">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>

      <form onSubmit={onSearch} role="search" className="border-t border-zinc-100 px-4 py-2 md:hidden">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar produtos…"
            aria-label="Buscar produtos"
            className="h-9 w-full rounded-md border border-zinc-300 bg-white pl-9 pr-3 text-base placeholder:text-zinc-400"
          />
        </div>
      </form>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-900">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
              <Store className="h-4 w-4" aria-hidden />
            </span>
            Loja Verde
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Marketplace brasileiro com entrega para todo o país. Frete fixo de R$ 15,00
            em qualquer pedido.
          </p>
        </div>
        <nav aria-label="Pagamento">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Pagamento
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            <li>PIX com aprovação imediata</li>
            <li>Cartão de crédito e débito</li>
            <li>Boleto bancário e TED</li>
          </ul>
        </nav>
        <nav aria-label="Sua conta">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Sua conta
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <NavLink to="/conta/pedidos" className="text-zinc-600 hover:text-brand">
                Acompanhar pedidos
              </NavLink>
            </li>
            <li>
              <NavLink to="/conta/perfil" className="text-zinc-600 hover:text-brand">
                Dados e endereço
              </NavLink>
            </li>
            <li>
              <NavLink to="/registro" className="text-zinc-600 hover:text-brand">
                Criar conta
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500">
        Loja Verde · Cupom de boas-vindas: FIRST10 (10% de desconto no primeiro pedido)
      </div>
    </footer>
  );
}

export function StorefrontLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}
