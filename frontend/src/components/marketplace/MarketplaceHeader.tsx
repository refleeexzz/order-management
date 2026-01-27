import { Link, NavLink } from 'react-router-dom';
import { ShoppingCart, Search, User, Menu, X, Sparkles, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';

export function MarketplaceHeader() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const categories = [
    { label: 'Todos os Produtos', to: '/products' },
    { label: 'Eletrônicos', to: '/products?category=1' },
    { label: 'Moda', to: '/products?category=2' },
    { label: 'Casa & Jardim', to: '/products?category=3' },
    { label: 'Esportes', to: '/products?category=4' },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                <Sparkles className="h-5 w-5 text-accent-400" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold font-display tracking-tight">
                  Nova<span className="text-accent-400">Shop</span>
                </span>
                <p className="text-[10px] text-brand-200 -mt-1">Sua loja completa</p>
              </div>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-5 py-3 pr-14 rounded-xl border-2 border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/60 
                    focus:bg-white focus:text-surface-900 focus:placeholder-surface-400 focus:border-brand-400 focus:outline-none
                    transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-500 hover:bg-accent-600 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5 text-white" />
                </button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* User Menu - Desktop */}
              <div className="hidden md:block relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div className="w-8 h-8 bg-accent-500 rounded-full flex items-center justify-center text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-brand-200">Olá,</p>
                      <p className="text-sm font-medium">{user?.name?.split(' ')[0]}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-brand-200" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded-xl transition-colors"
                    >
                      Entrar
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 text-sm font-medium bg-accent-500 hover:bg-accent-600 rounded-xl transition-colors"
                    >
                      Cadastrar
                    </Link>
                  </div>
                )}

                {/* User Dropdown */}
                {userMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-soft border border-surface-100 py-2 animate-fade-in">
                    <Link
                      to="/seller"
                      className="flex items-center gap-3 px-4 py-2.5 text-surface-700 hover:bg-surface-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Minha Loja</p>
                        <p className="text-xs text-surface-500">Painel do vendedor</p>
                      </div>
                    </Link>
                    {user?.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-2.5 text-surface-700 hover:bg-surface-50"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Admin</p>
                          <p className="text-xs text-surface-500">Painel administrativo</p>
                        </div>
                      </Link>
                    )}
                    <hr className="my-2 border-surface-100" />
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      Sair da conta
                    </button>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-3 rounded-xl hover:bg-white/10 transition-colors group"
              >
                <ShoppingCart className="h-6 w-6 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-md animate-pulse-soft">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 rounded-xl hover:bg-white/10 transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Bar */}
      <nav className="hidden md:block bg-white border-b border-surface-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 py-1">
            {categories.map((cat) => (
              <NavLink
                key={cat.to}
                to={cat.to}
                className={({ isActive }) =>
                  `px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-surface-600 hover:bg-surface-50 hover:text-brand-600'
                  }`
                }
              >
                {cat.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink
                to="/seller"
                className="ml-auto px-4 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Vender
              </NavLink>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white z-40 animate-fade-in">
          <div className="p-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl text-white mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-brand-200">{user?.email}</p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Link
                  to="/login"
                  className="flex-1 py-3 text-center font-medium text-brand-600 bg-brand-50 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="flex-1 py-3 text-center font-medium text-white bg-brand-600 rounded-xl"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Cadastrar
                </Link>
              </div>
            )}

            <div className="space-y-1">
              {categories.map((cat) => (
                <Link
                  key={cat.to}
                  to={cat.to}
                  className="block px-4 py-3 text-surface-700 hover:bg-surface-50 rounded-xl font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.label}
                </Link>
              ))}
            </div>

            {isAuthenticated && (
              <>
                <hr className="my-4 border-surface-100" />
                <Link
                  to="/seller"
                  className="flex items-center gap-3 px-4 py-3 text-brand-600 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Sparkles className="h-5 w-5" />
                  Minha Loja
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-3 px-4 py-3 text-purple-600 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5" />
                    Painel Admin
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full text-left px-4 py-3 text-red-600 font-medium"
                >
                  Sair da conta
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
