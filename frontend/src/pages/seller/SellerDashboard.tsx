import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye,
  ArrowUpRight,
  AlertTriangle
} from 'lucide-react';
import { api } from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import type { PageResponse, Product, Order } from '../../types';
import { Link } from 'react-router-dom';

export function SellerDashboard() {
  const { data: products } = useQuery({
    queryKey: ['seller-products'],
    queryFn: () => api.get<PageResponse<Product>>('/api/products?size=5'),
  });

  const { data: orders } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => api.get<PageResponse<Order>>('/api/orders?size=5'),
  });

  // Mock stats for demo
  const stats = {
    totalSales: 156,
    totalRevenue: 45890.00,
    totalProducts: products?.totalElements || 0,
    pendingOrders: 8,
    monthlyGrowth: 12.5,
    views: 3420,
  };

  const recentOrders = orders?.content?.slice(0, 5) || [];

  const statCards = [
    {
      title: 'Vendas do Mês',
      value: stats.totalSales,
      change: stats.monthlyGrowth,
      changeLabel: 'vs mês anterior',
      icon: ShoppingCart,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      trend: 'up',
    },
    {
      title: 'Faturamento',
      value: formatCurrency(stats.totalRevenue),
      change: 8.2,
      changeLabel: 'vs mês anterior',
      icon: DollarSign,
      iconBg: 'bg-brand-100',
      iconColor: 'text-brand-600',
      trend: 'up',
    },
    {
      title: 'Produtos Ativos',
      value: stats.totalProducts,
      subtitle: '3 com baixo estoque',
      icon: Package,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      title: 'Visualizações',
      value: stats.views.toLocaleString(),
      change: -2.1,
      changeLabel: 'vs mês anterior',
      icon: Eye,
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      trend: 'down',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Dashboard</h1>
        <p className="text-surface-500">Bem-vindo de volta! Aqui está o resumo da sua loja.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-card p-6 hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-surface-500">{stat.title}</p>
                <p className="text-2xl font-bold text-surface-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 ${stat.iconBg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-4 text-sm">
              {stat.trend && (
                <>
                  {stat.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={stat.trend === 'up' ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </span>
                  <span className="text-surface-400">{stat.changeLabel}</span>
                </>
              )}
              {stat.subtitle && (
                <span className="text-surface-500">{stat.subtitle}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="font-bold text-surface-900 font-display">Pedidos Recentes</h2>
            <Link 
              to="/seller/orders" 
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 group"
            >
              Ver todos 
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {recentOrders.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="h-8 w-8 text-surface-400" />
                </div>
                <p className="text-surface-500">Nenhum pedido ainda</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 hover:bg-surface-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-brand-50 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900">
                        Pedido #{order.id}
                      </p>
                      <p className="text-sm text-surface-500">
                        {order.customer?.name || 'Cliente'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-surface-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700' :
                      order.status === 'PENDING' ? 'bg-amber-50 text-amber-700' :
                      order.status === 'SHIPPED' ? 'bg-sky-50 text-sky-700' :
                      'bg-surface-100 text-surface-700'
                    }`}>
                      {order.status === 'DELIVERED' && '✓ '}
                      {order.status === 'PENDING' ? 'Pendente' :
                       order.status === 'DELIVERED' ? 'Entregue' :
                       order.status === 'SHIPPED' ? 'Enviado' :
                       order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-100">
            <h2 className="font-bold text-surface-900 font-display">Produtos Mais Vendidos</h2>
            <Link 
              to="/seller/products" 
              className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 group"
            >
              Ver todos 
              <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
          <div className="divide-y divide-surface-100">
            {products?.content?.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-amber-100 text-amber-700' :
                    index === 1 ? 'bg-surface-200 text-surface-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-surface-100 text-surface-600'
                  }`}>
                    {index + 1}
                  </span>
                  <img
                    src={`https://picsum.photos/seed/${product.id}/48/48`}
                    alt={product.name}
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  <div>
                    <p className="font-medium text-surface-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-sm text-surface-500">
                      {product.stockQuantity} em estoque
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-surface-900">
                  {formatCurrency(product.price)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-amber-800 text-lg">
              Ações Pendentes
            </h3>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white/60 rounded-xl p-3 border border-amber-200/50">
                <p className="text-2xl font-bold text-amber-700">{stats.pendingOrders}</p>
                <p className="text-sm text-amber-600">Pedidos para enviar</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-amber-200/50">
                <p className="text-2xl font-bold text-amber-700">3</p>
                <p className="text-sm text-amber-600">Estoque baixo</p>
              </div>
              <div className="bg-white/60 rounded-xl p-3 border border-amber-200/50">
                <p className="text-2xl font-bold text-amber-700">2</p>
                <p className="text-sm text-amber-600">Mensagens</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
