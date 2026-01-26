import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { api } from '../../lib/api';
import type { PageResponse, Product, Customer, OrderItemRequest } from '../../types';
import { formatCurrency } from '../../lib/utils';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({ isOpen, onClose }: OrderModalProps) {
  const queryClient = useQueryClient();
  const [customerId, setCustomerId] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<(OrderItemRequest & { product?: Product })[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const { data: customers } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => api.get<PageResponse<Customer>>('/api/customers?size=1000'),
    enabled: isOpen,
  });

  const { data: products } = useQuery({
    queryKey: ['products-all'],
    queryFn: () => api.get<PageResponse<Product>>('/api/products?size=1000'),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: { customerId: number; items: OrderItemRequest[]; notes?: string }) =>
      api.post('/api/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setCustomerId(0);
    setNotes('');
    setItems([]);
    setSelectedProductId(0);
    setQuantity(1);
    onClose();
  };

  const handleAddItem = () => {
    if (selectedProductId === 0 || quantity <= 0) return;

    const product = products?.content?.find((p) => p.id === selectedProductId);
    if (!product) return;

    const existingIndex = items.findIndex((item) => item.productId === selectedProductId);
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += quantity;
      setItems(newItems);
    } else {
      setItems([...items, { productId: selectedProductId, quantity, product }]);
    }

    setSelectedProductId(0);
    setQuantity(1);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customerId === 0 || items.length === 0) return;

    createMutation.mutate({
      customerId,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      notes: notes || undefined,
    });
  };

  const total = items.reduce((acc, item) => {
    return acc + (item.product?.price || 0) * item.quantity;
  }, 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Novo Pedido</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Select
            id="customerId"
            label="Cliente"
            value={customerId}
            onChange={(e) => setCustomerId(Number(e.target.value))}
            options={customers?.content?.map((c) => ({ value: c.id, label: c.name })) || []}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adicionar Produto</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Select
                  id="productId"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  options={
                    products?.content
                      ?.filter((p) => p.active && p.stockQuantity > 0)
                      .map((p) => ({
                        value: p.id,
                        label: `${p.name} - ${formatCurrency(p.price)} (${p.stockQuantity} em estoque)`,
                      })) || []
                  }
                />
              </div>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <Button type="button" onClick={handleAddItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Qtd</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Preço</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{item.product?.name}</td>
                      <td className="px-4 py-2 text-center">{item.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(item.product?.price || 0)}</td>
                      <td className="px-4 py-2 text-right font-medium">
                        {formatCurrency((item.product?.price || 0) * item.quantity)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">Total:</td>
                    <td className="px-4 py-2 text-right font-bold text-lg">{formatCurrency(total)}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          <Input
            id="notes"
            label="Observações"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending}
              disabled={customerId === 0 || items.length === 0}
            >
              Criar Pedido
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
