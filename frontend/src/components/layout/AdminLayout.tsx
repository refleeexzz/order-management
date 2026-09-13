import { NavLink, Link, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Tags,
  ClipboardList,
  Users,
  Store,
  LogOut,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/admin", label: "Visão geral", icon: LayoutDashboard, end: true },
  { to: "/admin/produtos", label: "Produtos", icon: Package, end: false },
  { to: "/admin/categorias", label: "Categorias", icon: Tags, end: false },
  { to: "/admin/pedidos", label: "Pedidos", icon: ClipboardList, end: false },
  { to: "/admin/clientes", label: "Clientes", icon: Users, end: false },
];

/**
 * Shell do painel administrativo — denso, contido (Linear/Shopify):
 * sidebar fixa, hairlines no lugar de sombras, linhas compactas.
 */
export function AdminLayout() {
  const navigate = useNavigate();
  const name = useAuthStore((s) => s.name);
  const email = useAuthStore((s) => s.email);
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-zinc-200 bg-white max-lg:hidden">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand text-white">
            <Store className="h-4 w-4" aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-zinc-900">Loja Verde</p>
            <p className="text-xs text-zinc-500">Administração</p>
          </div>
        </div>
        <nav aria-label="Painel administrativo" className="flex-1 px-2 py-3">
          <ul className="flex flex-col gap-0.5">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-brand-subtle text-brand-active"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                    )
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <div className="flex items-center gap-3 px-1">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-sm font-medium text-zinc-600">
              {name?.slice(0, 1).toUpperCase() ?? "A"}
            </span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium text-zinc-900">{name}</p>
              <p className="truncate text-xs text-zinc-500">{email}</p>
            </div>
            <button
              type="button"
              aria-label="Sair do painel"
              onClick={() => {
                clearSession();
                navigate("/");
              }}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              <LogOut className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </div>
      </aside>

      {/* Navegação mobile do admin */}
      <div className="flex w-full flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 overflow-x-auto border-b border-zinc-200 bg-white px-4 lg:hidden">
          <Link to="/admin" className="flex shrink-0 items-center gap-2 text-sm font-semibold text-zinc-900">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand text-white">
              <Store className="h-3.5 w-3.5" aria-hidden />
            </span>
            Admin
          </Link>
          <nav aria-label="Painel administrativo" className="flex gap-1">
            {navItems.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
                    isActive ? "bg-brand-subtle text-brand-active" : "text-zinc-600",
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <div className="mx-auto max-w-[1400px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
