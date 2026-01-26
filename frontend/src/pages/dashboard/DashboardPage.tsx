import { useQuery } from '@tanstack/react-query';
import { Package, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { Card, CardContent } from '../../components/ui';
import { api } from '../../lib/api';
import type { PageResponse, Product, Order, Customer } from '../../types';
import { formatCurrency } from '../../lib/utils';

export function DashboardPage() {
  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.get<PageResponse<Product>>('/api/products?size=1000'),
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.get<PageResponse<Order>>('/api/orders?size=1000'),
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get<PageResponse<Customer>>('/api/customers?size=1000'),
  });

  const totalProducts = products?.totalElements || 0;
  const totalOrders = orders?.totalElements || 0;
  const totalCustomers = customers?.totalElements || 0;
  const totalRevenue = orders?.content?.reduce((acc, order) => acc + order.totalAmount, 0) || 0;

  const stats = [
    { label: 'Produtos', value: totalProducts, icon: Package, color: 'bg-blue-500' },
    { label: 'Clientes', value: totalCustomers, icon: Users, color: 'bg-green-500' },
    { label: 'Pedidos', value: totalOrders, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Receita Total', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'bg-yellow-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Pedidos Recentes</h2>
            {orders?.content && orders.content.length > 0 ? (
              orders.content.slice(0, 5).map((order) => (
                <div key={order.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.customer?.name || 'Cliente'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-sm text-gray-500">{order.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h2 className="text-lg font-semibold mb-4">Produtos com Baixo Estoque</h2>
            {products?.content
              ?.filter((p) => p.stockQuantity < 10)
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="flex justify-between items-center py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category?.name || 'Sem categoria'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{product.stockQuantity} unidades</p>
                  </div>
                </div>
              )) || <p className="text-gray-500">Nenhum produto com baixo estoque</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
