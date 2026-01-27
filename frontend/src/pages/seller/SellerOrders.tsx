import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Search, 
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { api } from '../../lib/api';
import type { PageResponse, Order } from '../../types';
import { Button, Input, Select, Modal } from '../../components/ui';
import { formatCurrency, formatDate } from '../../lib/utils';
import { toast } from 'sonner';

const statusConfig = {
  PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-700', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', icon: Clock },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', icon: CheckCircle },
  PROCESSING: { label: 'Processando', color: 'bg-purple-100 text-purple-700', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', icon: Package },
  SHIPPED: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700', iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600', icon: Truck },
  DELIVERED: { label: 'Entregue', color: 'bg-emerald-100 text-emerald-700', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', icon: CheckCircle },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-700', iconBg: 'bg-red-100', iconColor: 'text-red-600', icon: XCircle },
};

type OrderStatus = keyof typeof statusConfig;

export function SellerOrders() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ['seller-orders', search, statusFilter],
    queryFn: () => {
      let url = '/api/orders?size=50';
      if (statusFilter) url += `&status=${statusFilter}`;
      return api.get<PageResponse<Order>>(url);
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      api.patch(`/api/orders/${data.id}/status`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      toast.success('Status atualizado com sucesso!');
      setSelectedOrder(null);
    },
    onError: () => {
      toast.error('Erro ao atualizar status');
    },
  });

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Record<OrderStatus, OrderStatus | null> = {
      PENDING: 'CONFIRMED',
      CONFIRMED: 'PROCESSING',
      PROCESSING: 'SHIPPED',
      SHIPPED: 'DELIVERED',
      DELIVERED: null,
      CANCELLED: null,
    };
    return flow[currentStatus];
  };

  const handleStatusChange = (order: Order, newStatus: string) => {
    updateOrderStatus.mutate({ id: order.id, status: newStatus });
  };

  const filteredOrders = orders?.content?.filter((order) => {
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        order.id.toString().includes(search) ||
        order.customer?.name?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Minhas Vendas</h1>
        <p className="text-surface-500">{orders?.totalElements || 0} pedidos no total</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as OrderStatus[]).map((status) => {
          const config = statusConfig[status];
          const count = orders?.content?.filter((o) => o.status === status).length || 0;
          const Icon = config.icon;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-4 rounded-2xl transition-all ${
                statusFilter === status
                  ? 'bg-brand-50 border-2 border-brand-500 shadow-md'
                  : 'bg-white border-2 border-transparent shadow-card hover:border-surface-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.iconBg}`}>
                  <Icon className={`h-5 w-5 ${config.iconColor}`} />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-surface-900">{count}</p>
                  <p className="text-sm text-surface-500">{config.label}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder="Buscar por ID ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="">Todos status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-surface-500">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Carregando...
          </div>
        ) : filteredOrders?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-surface-500">Seus pedidos aparecerão aqui</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-surface-700">Pedido</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Cliente</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Data</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Valor</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Status</th>
                  <th className="text-right p-4 font-semibold text-surface-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredOrders?.map((order) => {
                  const status = order.status as OrderStatus;
                  const config = statusConfig[status] || statusConfig.PENDING;
                  const Icon = config.icon;
                  const nextStatus = getNextStatus(status);

                  return (
                    <tr key={order.id} className="hover:bg-surface-50 transition-colors">
                      <td className="p-4">
                        <p className="font-semibold text-surface-900">#{order.id}</p>
                        <p className="text-sm text-surface-500">
                          {order.items?.length || 0} itens
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-surface-900">
                          {order.customer?.name || 'Cliente'}
                        </p>
                        <p className="text-sm text-surface-500">
                          {order.customer?.email}
                        </p>
                      </td>
                      <td className="p-4 text-surface-600">
                        {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-surface-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                          {config.label}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {nextStatus && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(order, nextStatus)}
                              isLoading={updateOrderStatus.isPending}
                            >
                              {nextStatus === 'CONFIRMED' && 'Confirmar'}
                              {nextStatus === 'PROCESSING' && 'Processar'}
                              {nextStatus === 'SHIPPED' && 'Enviar'}
                              {nextStatus === 'DELIVERED' && 'Entregar'}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Pedido #${selectedOrder?.id}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-surface-700 mb-2">Status</h4>
              <Select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder, e.target.value)}
              >
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Customer */}
            <div>
              <h4 className="text-sm font-medium text-surface-700 mb-2">Cliente</h4>
              <div className="bg-surface-50 rounded-xl p-4">
                <p className="font-semibold text-surface-900">
                  {selectedOrder.customer?.name || 'Cliente'}
                </p>
                <p className="text-sm text-surface-500">
                  {selectedOrder.customer?.email}
                </p>
                <p className="text-sm text-surface-500">
                  {selectedOrder.customer?.phone}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-medium text-surface-700 mb-2">Itens</h4>
              <div className="border border-surface-200 rounded-xl divide-y divide-surface-100 overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white hover:bg-surface-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://picsum.photos/seed/${item.product?.id}/48/48`}
                        alt={item.product?.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-surface-900">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-surface-500">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-semibold text-surface-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-4 border-t border-surface-100">
              <span className="font-semibold text-surface-900">Total</span>
              <span className="text-xl font-bold text-surface-900">
                {formatCurrency(selectedOrder.totalAmount)}
              </span>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                Fechar
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
