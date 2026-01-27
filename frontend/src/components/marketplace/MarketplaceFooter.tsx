import { Link } from 'react-router-dom';
import { Sparkles, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export function MarketplaceFooter() {
  return (
    <footer className="bg-surface-900 text-surface-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-700">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-1">Receba ofertas exclusivas</h3>
              <p className="text-brand-200">Cadastre-se e ganhe 10% de desconto na primeira compra</p>
            </div>
            <form className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-4 py-3 rounded-l-xl bg-white/10 border-2 border-r-0 border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-r-xl transition-colors flex items-center gap-2"
              >
                Assinar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-brand-400" />
              </div>
              <span className="text-xl font-bold text-white font-display">
                Nova<span className="text-accent-400">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 mb-6 leading-relaxed">
              Sua loja online completa. Milhares de produtos selecionados 
              com os melhores preços e entrega rápida.
            </p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 bg-surface-800 hover:bg-brand-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Navegação</h3>
            <ul className="space-y-3">
              {[
                { label: 'Produtos', to: '/products' },
                { label: 'Categorias', to: '/products' },
                { label: 'Ofertas', to: '/products' },
                { label: 'Novidades', to: '/products' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-surface-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-4">Minha Conta</h3>
            <ul className="space-y-3">
              {[
                { label: 'Minha Loja', to: '/seller' },
                { label: 'Meus Pedidos', to: '/seller/orders' },
                { label: 'Carrinho', to: '/cart' },
                { label: 'Lista de Desejos', to: '/cart' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-surface-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-surface-400">
                <MapPin className="h-5 w-5 text-brand-400 shrink-0 mt-0.5" />
                <span className="text-sm">Av. Paulista, 1000<br />São Paulo - SP</span>
              </li>
              <li className="flex items-center gap-3 text-surface-400">
                <Phone className="h-5 w-5 text-brand-400" />
                <span className="text-sm">(11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-3 text-surface-400">
                <Mail className="h-5 w-5 text-brand-400" />
                <span className="text-sm">contato@novashop.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-surface-500">
              © 2026 NovaShop. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-surface-500">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
