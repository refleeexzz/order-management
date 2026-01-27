import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  BarChart3,
  Settings,
  Store,
  ChevronRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { MarketplaceHeader } from '../../components/marketplace';

const sellerNavItems = [
  { to: '/seller', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/seller/products', icon: Package, label: 'Meus Produtos' },
  { to: '/seller/orders', icon: ShoppingCart, label: 'Vendas' },
  { to: '/seller/analytics', icon: BarChart3, label: 'Relatórios' },
  { to: '/seller/settings', icon: Settings, label: 'Configurações' },
];

export function SellerLayout() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface-50">
      <MarketplaceHeader />
      
      {/* Seller Header */}
      <div className="bg-white border-b border-surface-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-4 text-sm text-surface-500">
            <Store className="h-4 w-4" />
            <span>Painel do Vendedor</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-surface-900 font-medium">Minha Loja</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-card overflow-hidden sticky top-24">
              {/* Store Info */}
              <div className="p-6 bg-gradient-to-br from-brand-600 via-brand-700 to-purple-700 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Sparkles className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-bold text-lg">{user?.name?.split(' ')[0]}'s Store</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-accent-500 rounded-full text-xs font-medium">
                        PRO
                      </span>
                      <span className="text-sm text-brand-200">Vendedor verificado</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-300" />
                      <span className="text-xs text-white/80">Hoje</span>
                    </div>
                    <p className="text-xl font-bold mt-1">12</p>
                    <p className="text-xs text-white/70">vendas</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-accent-300" />
                      <span className="text-xs text-white/80">Hoje</span>
                    </div>
                    <p className="text-xl font-bold mt-1">R$ 1.2k</p>
                    <p className="text-xs text-white/70">faturado</p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-3">
                {sellerNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'
                      }`
                    }
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Help Card */}
              <div className="p-4 m-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <p className="text-sm font-medium text-amber-800 mb-1">Precisa de ajuda?</p>
                <p className="text-xs text-amber-600 mb-3">Acesse nossa central de suporte</p>
                <a 
                  href="#" 
                  className="text-xs font-semibold text-amber-700 hover:text-amber-800"
                >
                  Ver tutoriais →
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
