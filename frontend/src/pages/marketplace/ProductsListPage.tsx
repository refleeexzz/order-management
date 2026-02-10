import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, X, Search, Package } from 'lucide-react';
import { api } from '../../lib/api';
import type { PageResponse, Product, Category } from '../../types';
import { ProductCard } from '../../components/marketplace';
import { Button, Input, Select } from '../../components/ui';

export function ProductsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';
  const sortBy = searchParams.get('sort') || 'name';
  const page = parseInt(searchParams.get('page') || '0');

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', 'list', search, categoryId, sortBy, page],
    queryFn: () => {
      let url = `/api/products?page=${page}&size=20&sort=${sortBy}`;
      if (search) url += `&name=${encodeURIComponent(search)}`;
      if (categoryId) url += `&categoryId=${categoryId}`;
      return api.get<PageResponse<Product>>(url);
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>('/api/categories'),
  });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '0');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasFilters = search || categoryId;

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-surface-900 font-display">Filtros</h2>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                >
                  Limpar tudo
                </button>
              )}
            </div>

            {/* Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Buscar
              </label>
              <Input
                placeholder="Nome do produto..."
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                icon={<Search className="h-4 w-4" />}
              />
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Categoria
              </label>
              <Select
                value={categoryId}
                onChange={(e) => updateFilter('category', e.target.value)}
              >
                <option value="">Todas as categorias</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Sort */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Ordenar por
              </label>
              <Select
                value={sortBy}
                onChange={(e) => updateFilter('sort', e.target.value)}
              >
                <option value="name">Nome A-Z</option>
                <option value="price">Menor preço</option>
                <option value="price,desc">Maior preço</option>
                <option value="createdAt,desc">Mais recentes</option>
              </Select>
            </div>

            {/* Price Range */}
            <div className="pt-6 border-t border-surface-100">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Faixa de preço
              </label>
              <p className="text-xs text-surface-400 mb-4">Em breve</p>
              <div className="space-y-2 opacity-60">
                {[
                  { label: 'Até R$ 50', value: '0-50' },
                  { label: 'R$ 50 - R$ 100', value: '50-100' },
                  { label: 'R$ 100 - R$ 500', value: '100-500' },
                  { label: 'Acima de R$ 500', value: '500+' },
                ].map((range) => (
                  <label key={range.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="priceRange"
                      className="w-4 h-4 text-brand-600 border-surface-300 focus:ring-brand-500"
                      disabled
                    />
                    <span className="text-sm text-surface-600 group-hover:text-surface-900">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-surface-900 font-display">
                {search ? `Resultados para "${search}"` : 'Todos os Produtos'}
              </h1>
              <p className="text-surface-500 mt-1">
                {products?.totalElements || 0} produtos encontrados
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Button */}
              <Button
                variant="secondary"
                size="sm"
                className="lg:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtros
              </Button>

              {/* View Mode */}
              <div className="flex bg-surface-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white text-brand-600 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mb-6">
              {search && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full text-sm font-medium">
                  <Search className="h-3 w-3" />
                  {search}
                  <button 
                    onClick={() => updateFilter('search', '')}
                    className="hover:bg-brand-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryId && (
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                  {categories?.find((c) => c.id.toString() === categoryId)?.name}
                  <button 
                    onClick={() => updateFilter('category', '')}
                    className="hover:bg-purple-100 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Mobile Filters */}
          {showFilters && (
            <div className="lg:hidden bg-white rounded-2xl shadow-card p-6 mb-6 animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Buscar
                  </label>
                  <Input
                    placeholder="Nome do produto..."
                    value={search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Categoria
                  </label>
                  <Select
                    value={categoryId}
                    onChange={(e) => updateFilter('category', e.target.value)}
                  >
                    <option value="">Todas</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Ordenar
                  </label>
                  <Select
                    value={sortBy}
                    onChange={(e) => updateFilter('sort', e.target.value)}
                  >
                    <option value="name">Nome</option>
                    <option value="price">Menor preço</option>
                    <option value="price,desc">Maior preço</option>
                  </Select>
                </div>
              </div>
              {hasFilters && (
                <div className="pt-4 mt-4 border-t border-surface-100">
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Limpar filtros
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-card animate-pulse overflow-hidden">
                  <div className="aspect-square bg-surface-100" />
                  <div className="p-4 space-y-3">
                    <div className="h-3 bg-surface-100 rounded-full w-1/3" />
                    <div className="h-4 bg-surface-100 rounded-full w-3/4" />
                    <div className="h-6 bg-surface-100 rounded-full w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products?.content?.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl shadow-card">
              <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Package className="h-10 w-10 text-surface-400" />
              </div>
              <h3 className="text-xl font-bold text-surface-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-surface-500 mb-6">Tente ajustar os filtros ou buscar por outro termo</p>
              <Button onClick={clearFilters} variant="outline">
                Limpar filtros
              </Button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6'
              : 'space-y-4'
            }>
              {products?.content?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {products && products.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {[...Array(Math.min(products.totalPages, 5))].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilter('page', i.toString())}
                  className={`w-10 h-10 rounded-xl font-medium transition-all ${
                    page === i
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-white text-surface-600 hover:bg-surface-50 shadow-card'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
