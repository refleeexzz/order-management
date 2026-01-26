import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button, Input, Select } from '../../components/ui';
import { api } from '../../lib/api';
import type { Product, Category } from '../../types';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  categoryId: number;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  categories: Category[];
}

export function ProductModal({ isOpen, onClose, product, categories }: ProductModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>();

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        sku: product.sku,
        categoryId: product.category?.id,
      });
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        sku: '',
        categoryId: 0,
      });
    }
  }, [product, reset]);

  const createMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.post('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProductFormData) => api.put(`/api/products/${product?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
  });

  const onSubmit = (data: ProductFormData) => {
    const payload = {
      ...data,
      price: Number(data.price),
      stockQuantity: Number(data.stockQuantity),
      categoryId: Number(data.categoryId),
    };
    if (product) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{product ? 'Editar Produto' : 'Novo Produto'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="name"
            label="Nome"
            error={errors.name?.message}
            {...register('name', { required: 'Nome é obrigatório' })}
          />

          <Input
            id="description"
            label="Descrição"
            error={errors.description?.message}
            {...register('description', { required: 'Descrição é obrigatória' })}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="price"
              type="number"
              step="0.01"
              label="Preço"
              error={errors.price?.message}
              {...register('price', { required: 'Preço é obrigatório' })}
            />

            <Input
              id="stockQuantity"
              type="number"
              label="Estoque"
              error={errors.stockQuantity?.message}
              {...register('stockQuantity', { required: 'Estoque é obrigatório' })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="sku"
              label="SKU"
              error={errors.sku?.message}
              {...register('sku', { required: 'SKU é obrigatório' })}
            />

            <Select
              id="categoryId"
              label="Categoria"
              error={errors.categoryId?.message}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              {...register('categoryId', { required: 'Categoria é obrigatória' })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {product ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
