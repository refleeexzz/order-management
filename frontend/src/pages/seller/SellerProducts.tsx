import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { api } from '../../lib/api';
import type { PageResponse, Product, Category } from '../../types';
import { Button, Input, Select, Modal } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

export function SellerProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    sku: '',
    categoryId: '',
    imageUrl: '',
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['seller-products', search, categoryFilter],
    queryFn: () => {
      let url = '/api/products?size=50';
      if (search) url += `&name=${encodeURIComponent(search)}`;
      if (categoryFilter) url += `&categoryId=${categoryFilter}`;
      return api.get<PageResponse<Product>>(url);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  });

  const createProduct = useMutation({
    mutationFn: (data: typeof formData) =>
      api.post('/api/products', {
        name: data.name,
        description: data.description,
        sku: data.sku,
        imageUrl: data.imageUrl || null,
        price: parseFloat(data.price),
        stockQuantity: parseInt(data.stockQuantity),
        categoryId: parseInt(data.categoryId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Produto criado com sucesso!');
      closeModal();
    },
    onError: () => {
      toast.error('Erro ao criar produto');
    },
  });

  const updateProduct = useMutation({
    mutationFn: (data: { id: number; formData: typeof formData }) =>
      api.put(`/api/products/${data.id}`, {
        name: data.formData.name,
        description: data.formData.description,
        sku: data.formData.sku,
        imageUrl: data.formData.imageUrl || null,
        price: parseFloat(data.formData.price),
        stockQuantity: parseInt(data.formData.stockQuantity),
        categoryId: parseInt(data.formData.categoryId),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Produto atualizado com sucesso!');
      closeModal();
    },
    onError: () => {
      toast.error('Erro ao atualizar produto');
    },
  });

  const deleteProduct = useMutation({
    mutationFn: (id: number) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir produto');
    },
  });

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stockQuantity: product.stockQuantity.toString(),
        sku: product.sku || '',
        categoryId: product.category?.id?.toString() || '',
        imageUrl: product.imageUrl || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stockQuantity: '',
        sku: '',
        categoryId: '',
        imageUrl: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, formData });
    } else {
      createProduct.mutate(formData);
    }
  };

  const handleDelete = (product: Product) => {
    if (confirm(`Deseja excluir "${product.name}"?`)) {
      deleteProduct.mutate(product.id);
    }
  };

  // Stats calculation
  const totalProducts = products?.totalElements || 0;
  const activeProducts = products?.content?.filter(p => p.stockQuantity > 0).length || 0;
  const lowStockProducts = products?.content?.filter(p => p.stockQuantity <= 5 && p.stockQuantity > 0).length || 0;
  const outOfStockProducts = products?.content?.filter(p => p.stockQuantity === 0).length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Meus Produtos</h1>
          <p className="text-surface-500">{totalProducts} produtos cadastrados</p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totalProducts, icon: Package, color: 'brand' },
          { label: 'Ativos', value: activeProducts, icon: TrendingUp, color: 'emerald' },
          { label: 'Estoque Baixo', value: lowStockProducts, icon: AlertTriangle, color: 'amber' },
          { label: 'Esgotados', value: outOfStockProducts, icon: BarChart3, color: 'red' },
        ].map((stat) => (
          <div 
            key={stat.label}
            className="bg-white rounded-2xl shadow-card p-4"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                stat.color === 'brand' ? 'bg-brand-100' :
                stat.color === 'emerald' ? 'bg-emerald-100' :
                stat.color === 'amber' ? 'bg-amber-100' : 'bg-red-100'
              }`}>
                <stat.icon className={`h-5 w-5 ${
                  stat.color === 'brand' ? 'text-brand-600' :
                  stat.color === 'emerald' ? 'text-emerald-600' :
                  stat.color === 'amber' ? 'text-amber-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-surface-900">{stat.value}</p>
                <p className="text-sm text-surface-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="sm:w-48"
          >
            <option value="">Todas categorias</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-surface-500">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            Carregando...
          </div>
        ) : products?.content?.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-surface-400" />
            </div>
            <h3 className="text-lg font-semibold text-surface-900 mb-2">Nenhum produto encontrado</h3>
            <p className="text-surface-500 mb-6">Comece adicionando seu primeiro produto</p>
            <Button onClick={() => openModal()}>
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-50 border-b border-surface-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-surface-700">Produto</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Categoria</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Preço</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Estoque</th>
                  <th className="text-left p-4 font-semibold text-surface-700">Status</th>
                  <th className="text-right p-4 font-semibold text-surface-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {products?.content?.map((product) => (
                  <tr key={product.id} className="hover:bg-surface-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-surface-100 flex items-center justify-center">
                            <Package className="h-6 w-6 text-surface-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-surface-900">{product.name}</p>
                          <p className="text-sm text-surface-500">SKU: {product.sku || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-surface-100 rounded-lg text-sm text-surface-600">
                        {product.category?.name || 'Sem categoria'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-surface-900">
                        {formatCurrency(product.price)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span className={`font-medium ${
                          product.stockQuantity === 0 ? 'text-red-600' :
                          product.stockQuantity <= 5 ? 'text-amber-600' : 'text-surface-700'
                        }`}>
                          {product.stockQuantity}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        product.stockQuantity > 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          product.stockQuantity > 0 ? 'bg-emerald-500' : 'bg-red-500'
                        }`} />
                        {product.stockQuantity > 0 ? 'Ativo' : 'Esgotado'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2 text-surface-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-2 text-surface-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Editar Produto' : 'Novo Produto'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Nome do Produto *
            </label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Smartphone Samsung Galaxy"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do produto..."
              rows={3}
              className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none text-surface-900 placeholder:text-surface-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Preço *
              </label>
              <Input
                required
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0,00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Quantidade *
              </label>
              <Input
                required
                type="number"
                min="0"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                SKU
              </label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Categoria *
              </label>
              <Select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                <option value="">Selecione...</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              URL da Imagem
            </label>
            <Input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-20 h-20 object-cover rounded-xl border border-surface-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={createProduct.isPending || updateProduct.isPending}
            >
              {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
