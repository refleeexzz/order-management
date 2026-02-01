import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  Shield,
  CreditCard,
  Clock,
  Package,
  ShoppingBag,
  Gift,
  Star,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { PageResponse, Product } from '../../types';
import { ProductCard } from '../../components/marketplace';

export function HomePage() {
  const { data: products } = useQuery({
    queryKey: ['products', 'home'],
    queryFn: () => api.get<PageResponse<Product>>('/api/products?size=8'),
  });

  const categories = [
    { name: 'Eletrônicos', icon: '💻' },
    { name: 'Moda', icon: '👗' },
    { name: 'Casa & Jardim', icon: '🏠' },
    { name: 'Esportes', icon: '⚽' },
    { name: 'Livros', icon: '📚' },
    { name: 'Games', icon: '🎮' },
  ];

  const stats = [
    { label: 'Produtos', value: '50K+' },
    { label: 'Clientes', value: '150K+' },
    { label: 'Avaliação', value: '4.9/5' },
    { label: 'Vendedores', value: '5K+' },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Hero */}
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-none px-4 py-16 text-center sm:px-6 lg:px-10 xl:px-14 2xl:px-20 lg:py-20">
          <span className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">
            <Star className="h-4 w-4" />
            Loja com curadoria premium
          </span>
          <h1 className="mb-4 text-3xl font-extrabold text-gray-900 sm:text-4xl lg:text-5xl">
            Tudo o que você precisa em um só lugar
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:text-lg">
            Produtos selecionados, entrega rápida e uma experiência de compra simples, segura e moderna.
          </p>
          <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-violet-700"
            >
              <ShoppingBag className="h-5 w-5" />
              Ver Produtos
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/seller"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50"
            >
              Começar a Vender
            </Link>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="w-full border-y border-gray-100 bg-white">
        <div className="mx-auto w-full max-w-none px-4 py-10 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="grid grid-cols-2 gap-6 text-center lg:grid-cols-4">
            {[
              { icon: Truck, title: 'Frete Grátis', desc: 'Acima de R$ 99' },
              { icon: Shield, title: 'Compra Segura', desc: '100% protegido' },
              { icon: CreditCard, title: 'Parcele em 12x', desc: 'Sem juros' },
              { icon: Clock, title: 'Entrega Rápida', desc: 'Em até 24h' },
            ].map((benefit) => (
              <div key={benefit.title} className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <benefit.icon className="h-6 w-6" />
                </div>
                <div className="text-sm font-semibold text-gray-900">{benefit.title}</div>
                <div className="text-xs text-gray-500">{benefit.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="w-full py-14">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Explore por Categoria</h2>
            <p className="mt-2 text-gray-600">Organização clara para você encontrar rápido</p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name.toLowerCase()}`}
                className="rounded-2xl border border-gray-100 bg-white p-5 text-center transition-all hover:-translate-y-1 hover:border-violet-200 hover:shadow-md"
              >
                <div className="mb-3 text-4xl">{category.icon}</div>
                <div className="text-sm font-semibold text-gray-900">{category.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="w-full bg-white py-14">
        <div className="mx-auto w-full max-w-none px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <div className="mb-8 flex flex-col gap-2 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Produtos em Destaque</h2>
            <p className="text-gray-600">Selecionados para você hoje</p>
          </div>

          {products?.content && products.content.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7">
              {products.content.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-16 text-center">
              <Package className="mx-auto mb-4 h-10 w-10 text-gray-300" />
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Nenhum produto disponível</h3>
              <p className="mb-6 text-sm text-gray-600">Em breve teremos novidades para você.</p>
              <Link
                to="/seller"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
              >
                <Gift className="h-4 w-4" />
                Seja um vendedor
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16">
        <div className="mx-auto w-full max-w-none px-4 text-center sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
          <h2 className="mb-3 text-2xl font-bold text-gray-900 sm:text-3xl">
            Quer vender na NovaShop?
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-gray-600">
            Tenha acesso a milhares de clientes com uma vitrine moderna e confiável.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-violet-700"
          >
            Criar conta grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
