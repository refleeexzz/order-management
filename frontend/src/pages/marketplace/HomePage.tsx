import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, CreditCard, Sparkles, Zap, Gift, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import type { PageResponse, Product, Category } from '../../types';
import { ProductCard } from '../../components/marketplace';

export function HomePage() {
  const { data: products } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => api.get<PageResponse<Product>>('/api/products?size=12'),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  });

  const categoryIcons = ['💻', '👗', '🏠', '⚽', '📱', '🎮'];

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-800 to-brand-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-400 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6">
                <Zap className="h-4 w-4 text-accent-400" />
                <span>Novidades chegando todos os dias</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-display leading-tight">
                Descubra o 
                <span className="bg-gradient-to-r from-accent-400 to-pink-400 bg-clip-text text-transparent"> melhor </span>
                para você
              </h1>
              <p className="text-lg text-brand-200 mb-8 max-w-lg mx-auto lg:mx-0">
                Milhares de produtos selecionados com os melhores preços, 
                entrega rápida e garantia de qualidade.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Explorar Produtos
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  to="/seller"
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-xl font-semibold transition-all backdrop-blur-sm border border-white/20"
                >
                  <Sparkles className="h-5 w-5" />
                  Começar a Vender
                </Link>
              </div>
            </div>
            
            {/* Hero Image/Stats */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                      <p className="text-4xl font-bold text-white mb-1">50k+</p>
                      <p className="text-brand-200">Produtos</p>
                    </div>
                    <div className="bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl p-6">
                      <p className="text-4xl font-bold text-white mb-1">98%</p>
                      <p className="text-white/80">Satisfação</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6">
                      <p className="text-4xl font-bold text-white mb-1">24h</p>
                      <p className="text-white/80">Entrega Express</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                      <p className="text-4xl font-bold text-white mb-1">5k+</p>
                      <p className="text-brand-200">Vendedores</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-8 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-soft p-6 lg:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Truck, title: 'Frete Grátis', desc: 'Acima de R$ 99', color: 'emerald' },
                { icon: Shield, title: 'Compra Segura', desc: 'Seu dinheiro protegido', color: 'brand' },
                { icon: CreditCard, title: 'Parcele em 12x', desc: 'Sem juros no cartão', color: 'purple' },
                { icon: Clock, title: 'Entrega Rápida', desc: 'Receba em até 24h', color: 'amber' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className={`p-3 bg-${item.color}-50 rounded-xl shrink-0`}>
                    <item.icon className={`h-6 w-6 text-${item.color}-600`} />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900">{item.title}</p>
                    <p className="text-sm text-surface-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 font-display">Categorias</h2>
              <p className="text-surface-500 mt-1">Encontre o que você procura</p>
            </div>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {categories?.slice(0, 6).map((category, i) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center p-6 bg-white rounded-2xl shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <span className="text-3xl">{categoryIcons[i] || '📦'}</span>
                </div>
                <span className="text-sm font-medium text-surface-700 text-center group-hover:text-brand-600 transition-colors">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 font-display">Produtos em Destaque</h2>
              <p className="text-surface-500 mt-1">Os mais vendidos da semana</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-brand-600 hover:text-brand-700 font-semibold transition-colors group"
            >
              Ver todos
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
            {products?.content?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="sm:hidden mt-6 text-center">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-brand-600 font-semibold"
            >
              Ver todos os produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 via-brand-700 to-purple-700 rounded-3xl">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>
            <div className="relative px-8 py-12 lg:py-16 text-center lg:text-left lg:flex items-center justify-between">
              <div className="mb-8 lg:mb-0">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-white text-sm mb-4">
                  <Gift className="h-4 w-4" />
                  <span>Oferta especial</span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-display">
                  Ganhe até 30% de desconto
                </h2>
                <p className="text-brand-100 text-lg max-w-lg">
                  Cadastre-se agora e aproveite ofertas exclusivas para novos usuários
                </p>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-700 px-8 py-4 rounded-xl font-bold hover:bg-brand-50 transition-colors shadow-xl"
              >
                Criar Conta Grátis
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Seller */}
      <section className="py-16 bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Sparkles className="h-12 w-12 text-accent-400 mx-auto mb-6" />
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 font-display">
            Quer vender seus produtos?
          </h2>
          <p className="text-lg text-surface-400 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de vendedores e comece a faturar hoje mesmo. 
            Cadastro gratuito e suporte completo.
          </p>
          <Link
            to="/seller"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl"
          >
            Começar a Vender
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
