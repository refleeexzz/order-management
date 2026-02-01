import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sparkles, LogOut, Store, ChevronDown, User, Package } from 'lucide-react';
import { useAuthStore } from '../../store';
import { useCartStore } from '../../store/cartStore';
import { useState, useRef, useEffect } from 'react';

export function MarketplaceHeader() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const categories = [
    { name: 'Eletrônicos', href: '/products?category=eletronicos' },
    { name: 'Moda', href: '/products?category=moda' },
    { name: 'Casa & Jardim', href: '/products?category=casa' },
    { name: 'Esportes', href: '/products?category=esportes' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      {/* Main Header */}
      <div className="w-full">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="flex h-16 items-center justify-between gap-4 lg:gap-8">
            {/* Logo */}
            <Link to="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="hidden text-xl font-bold text-gray-900 sm:block">
                Nova<span className="text-violet-600">Shop</span>
              </span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden flex-1 md:flex md:max-w-2xl">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="O que você está procurando?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-5 pr-14 text-gray-900 placeholder-gray-500 transition-all focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 flex h-8 w-10 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-600 transition-colors hover:bg-violet-700"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
            </form>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart */}
              <Link
                to="/cart"
                className="relative rounded-xl p-2.5 text-gray-600 transition-colors hover:bg-violet-50 hover:text-violet-600"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-violet-600 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-purple-600 text-sm font-bold text-white shadow-sm">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium lg:block">
                      {user?.name?.split(' ')[0] || 'Usuário'}
                    </span>
                    <ChevronDown className={`hidden h-4 w-4 text-gray-400 transition-transform lg:block ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-2xl">
                      <div className="border-b border-gray-100 px-4 py-3">
                        <p className="truncate font-semibold text-gray-900">{user?.name}</p>
                        <p className="truncate text-sm text-gray-500">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Package className="h-4 w-4 text-gray-400" />
                          Meus Pedidos
                        </Link>
                        <Link
                          to="/seller"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                        >
                          <Store className="h-4 w-4 text-gray-400" />
                          Painel do Vendedor
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Sair da conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="hidden items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-600 sm:flex"
                  >
                    <User className="h-4 w-4" />
                    Entrar
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-violet-600/25 transition-colors hover:bg-violet-700"
                  >
                    Cadastrar
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-xl p-2.5 text-gray-600 transition-colors hover:bg-gray-100 md:hidden"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden w-full border-t border-gray-100 bg-gray-50/50 md:block">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="flex items-center justify-center gap-1">
            <Link
              to="/products"
              className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-600"
            >
              Todos os Produtos
            </Link>
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-600 transition-colors hover:bg-violet-50 hover:text-violet-600"
              >
                {category.name}
              </Link>
            ))}
            <Link
              to="/seller"
              className="rounded-lg px-4 py-3 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50"
            >
              Vender no NovaShop
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="w-full border-t border-gray-100 bg-white md:hidden">
          <div className="space-y-4 px-4 py-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-4 pr-12 text-gray-900 placeholder-gray-500 transition-all focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-violet-600 transition-colors hover:bg-violet-700"
                >
                  <Search className="h-4 w-4 text-white" />
                </button>
              </div>
            </form>

            <div className="space-y-1">
              <Link
                to="/products"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Todos os Produtos
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center rounded-xl px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/seller"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 font-semibold text-violet-600 transition-colors hover:bg-violet-50"
              >
                <Store className="mr-2 h-4 w-4" />
                Vender no NovaShop
              </Link>
            </div>

            {!isAuthenticated && (
              <div className="flex gap-3 border-t border-gray-100 pt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-gray-100 py-3 text-center font-medium text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 rounded-xl bg-violet-600 py-3 text-center font-semibold text-white transition-colors hover:bg-violet-700"
                >
                  Cadastrar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
