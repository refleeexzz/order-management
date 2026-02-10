import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, Users, ShoppingCart } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '../../store';

const mobileNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produtos', path: '/admin/products' },
  { icon: FolderTree, label: 'Categorias', path: '/admin/categories' },
  { icon: Users, label: 'Clientes', path: '/admin/customers' },
  { icon: ShoppingCart, label: 'Pedidos', path: '/admin/orders' },
];

export function MainLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100 flex-col lg:flex-row">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Admin Nav */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-3">
          <p className="text-sm font-semibold text-gray-900">Painel Admin</p>
        </div>
        <div className="flex gap-2 overflow-x-auto px-4 pb-3">
          {mobileNav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
