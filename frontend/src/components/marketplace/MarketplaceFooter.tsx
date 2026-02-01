import { Link } from 'react-router-dom';
import { Sparkles, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, ArrowRight, Shield, CreditCard, Truck } from 'lucide-react';

export function MarketplaceFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Receba ofertas exclusivas</h3>
              <p className="text-violet-200">Cadastre-se e ganhe 10% de desconto na primeira compra</p>
            </div>
            <form className="flex w-full max-w-md">
              <input
                type="email"
                placeholder="Seu melhor e-mail"
                className="flex-1 px-5 py-3.5 rounded-l-xl bg-white/10 border-2 border-r-0 border-white/20 text-white placeholder-white/60 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3.5 bg-white text-violet-600 font-bold rounded-r-xl hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                Assinar
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-violet-600/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <span className="text-xl font-bold text-white">
                Nova<span className="text-violet-400">Shop</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
              Sua loja online completa. Milhares de produtos selecionados 
              com os melhores preços e entrega rápida para todo o Brasil.
            </p>
            <div className="flex gap-3">
              {[
                { Icon: Facebook, href: '#', label: 'Facebook' },
                { Icon: Instagram, href: '#', label: 'Instagram' },
                { Icon: Twitter, href: '#', label: 'Twitter' },
                { Icon: Youtube, href: '#', label: 'Youtube' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-10 h-10 bg-gray-800 hover:bg-violet-600 rounded-xl flex items-center justify-center transition-colors"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5">Navegação</h3>
            <ul className="space-y-3">
              {[
                { label: 'Início', to: '/' },
                { label: 'Produtos', to: '/products' },
                { label: 'Categorias', to: '/products' },
                { label: 'Ofertas', to: '/products' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-white font-semibold mb-5">Minha Conta</h3>
            <ul className="space-y-3">
              {[
                { label: 'Meus Pedidos', to: '/orders' },
                { label: 'Carrinho', to: '/cart' },
                { label: 'Painel do Vendedor', to: '/seller' },
                { label: 'Começar a Vender', to: '/seller' },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5">Contato</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">contato@novashop.com.br</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">(11) 99999-9999</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-400">São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Compra 100% Segura</p>
                <p className="text-gray-500 text-xs">Seus dados protegidos</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Parcele em até 12x</p>
                <p className="text-gray-500 text-xs">Sem juros no cartão</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center">
                <Truck className="h-6 w-6 text-violet-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium text-sm">Entrega Expressa</p>
                <p className="text-gray-500 text-xs">Para todo o Brasil</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-sm text-gray-500">
              © {currentYear} NovaShop. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Ajuda</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
