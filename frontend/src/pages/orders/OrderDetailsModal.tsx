import { X } from 'lucide-react';
import type { Order } from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Badge } from '../../components/ui';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
};

export function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Pedido #{order.orderNumber}</h2>
            <p className="text-gray-500 text-sm">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Cliente</h3>
            <p className="text-gray-600">{order.customer?.name}</p>
            <p className="text-gray-500 text-sm">{order.customer?.email}</p>
            <p className="text-gray-500 text-sm">{order.customer?.phone}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Endereço de Entrega</h3>
            <p className="text-gray-600">
              {order.customer?.address?.street}, {order.customer?.address?.number}
            </p>
            <p className="text-gray-500 text-sm">
              {order.customer?.address?.neighborhood} - {order.customer?.address?.city}/{order.customer?.address?.state}
            </p>
            <p className="text-gray-500 text-sm">CEP: {order.customer?.address?.zipCode}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">Status:</h3>
            <Badge>{statusLabels[order.status]}</Badge>
          </div>
          {order.notes && (
            <div className="mt-2">
              <h3 className="font-semibold text-gray-900 mb-1">Observações:</h3>
              <p className="text-gray-600 text-sm">{order.notes}</p>
            </div>
          )}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{item.product?.name}</p>
                    <p className="text-gray-500 text-sm">{item.product?.sku}</p>
                  </td>
                  <td className="px-4 py-3 text-center">{item.quantity}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total do Pedido:</td>
                <td className="px-4 py-3 text-right font-bold text-lg text-blue-600">
                  {formatCurrency(order.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
