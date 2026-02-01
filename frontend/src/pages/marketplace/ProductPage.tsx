import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  ArrowLeft,
  Minus,
  Plus,
  MapPin,
  Star,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => api.get<Product>(`/api/products/${id}`),
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast.success('Produto adicionado ao carrinho!');
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addItem(product, quantity);
      window.location.href = '/cart';
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stockQuantity) {
      setQuantity(quantity + 1);
    }
  };

  // Mock images for demo (replace with real product images)
  const productImages = [
    `https://picsum.photos/seed/${id}/600/600`,
    `https://picsum.photos/seed/${id}a/600/600`,
    `https://picsum.photos/seed/${id}b/600/600`,
    `https://picsum.photos/seed/${id}c/600/600`,
  ];

  if (isLoading) {
    return (
      <div className="w-full max-w-none mx-auto px-4 py-8 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-square bg-surface-100 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-4 bg-surface-100 rounded-full w-1/4" />
              <div className="h-8 bg-surface-100 rounded-full w-3/4" />
              <div className="h-6 bg-surface-100 rounded-full w-1/4" />
              <div className="h-12 bg-surface-100 rounded-full w-1/3" />
              <div className="h-24 bg-surface-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full max-w-none mx-auto px-4 py-20 text-center sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <div className="w-20 h-20 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShoppingCart className="h-10 w-10 text-surface-400" />
        </div>
        <h1 className="text-2xl font-bold text-surface-900 mb-4 font-display">
          Produto não encontrado
        </h1>
        <p className="text-surface-500 mb-6">O produto que você está procurando não existe ou foi removido.</p>
        <Link to="/products">
          <Button variant="outline">Voltar para produtos</Button>
        </Link>
      </div>
    );
  }

  const discountPercentage = 12; // Mock discount
  const originalPrice = product.price * 1.12;
  const installments = Math.ceil(product.price / 100) > 12 ? 12 : Math.ceil(product.price / 100);
  const installmentValue = product.price / installments;

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8 animate-fade-in sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">Início</Link>
        <span className="text-surface-300">/</span>
        <Link to="/products" className="hover:text-brand-600 transition-colors">Produtos</Link>
        <span className="text-surface-300">/</span>
        {product.category && (
          <>
            <Link 
              to={`/products?category=${product.category.id}`} 
              className="hover:text-brand-600 transition-colors"
            >
              {product.category.name}
            </Link>
            <span className="text-surface-300">/</span>
          </>
        )}
        <span className="text-surface-700 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Back Button Mobile */}
      <Link 
        to="/products" 
        className="lg:hidden inline-flex items-center gap-2 text-brand-600 font-medium mb-4 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Product Images */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-card overflow-hidden sticky top-24">
            <div className="aspect-square relative group">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Favorite Button */}
              <button 
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast.success(isWishlisted ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
                }}
                className={`absolute top-4 right-4 p-3 rounded-xl shadow-lg transition-all ${
                  isWishlisted 
                    ? 'bg-red-500 text-white' 
                    : 'bg-white/90 backdrop-blur-sm text-surface-600 hover:bg-white hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>

              {/* Discount Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                  -{discountPercentage}%
                </span>
              </div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-3 p-4">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-xl overflow-hidden transition-all ${
                    selectedImage === index 
                      ? 'ring-2 ring-brand-500 ring-offset-2' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl shadow-card p-6">
            {/* Condition & Sales */}
            <div className="flex items-center gap-2 text-sm text-surface-500 mb-3">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">Novo</span>
              <span className="text-surface-300">|</span>
              <span>+500 vendidos</span>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-surface-900 mb-4 font-display leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-surface-200'}`} 
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-surface-700">4.5</span>
              <span className="text-sm text-surface-400">(127 avaliações)</span>
            </div>

            {/* Price */}
            <div className="mb-6 p-4 bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl">
              <div className="flex items-center gap-3 mb-1">
                <span className="text-sm text-surface-500 line-through">
                  {formatCurrency(originalPrice)}
                </span>
                <span className="text-sm text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  {discountPercentage}% OFF
                </span>
              </div>
              <p className="text-3xl font-bold text-surface-900">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm text-surface-600 mt-1">
                ou <span className="text-brand-600 font-semibold">
                  {installments}x de {formatCurrency(installmentValue)}
                </span> sem juros
              </p>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2 mb-5">
              {product.stockQuantity > 0 ? (
                <>
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-emerald-600 text-sm font-medium">
                    Em estoque ({product.stockQuantity} disponíveis)
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-red-500 rounded-full" />
                  <span className="text-red-600 text-sm font-medium">Fora de estoque</span>
                </>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Quantidade
              </label>
              <div className="inline-flex items-center bg-surface-50 rounded-xl p-1">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="p-3 hover:bg-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 py-2 min-w-[60px] text-center font-semibold">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stockQuantity}
                  className="p-3 hover:bg-white rounded-lg disabled:opacity-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                onClick={handleBuyNow} 
                className="w-full"
                size="lg"
                disabled={product.stockQuantity === 0}
              >
                Comprar agora
              </Button>
              <Button 
                variant="outline" 
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
                disabled={product.stockQuantity === 0}
              >
                <ShoppingCart className="h-5 w-5" />
                Adicionar ao carrinho
              </Button>
            </div>

            {/* Share */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-surface-100">
              <button className="flex items-center gap-2 text-sm text-surface-500 hover:text-brand-600 transition-colors">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
              <button 
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast.success(isWishlisted ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
                }}
                className="flex items-center gap-2 text-sm text-surface-500 hover:text-red-500 transition-colors"
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                Favoritar
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-card p-6 mt-4">
            <h2 className="font-bold text-surface-900 mb-3 font-display">Descrição</h2>
            <p className="text-surface-600 whitespace-pre-line leading-relaxed">
              {product.description || 'Sem descrição disponível para este produto.'}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          {/* Shipping */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-bold text-surface-900 mb-4 font-display">Envio</h3>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-surface-500" />
              </div>
              <div className="text-sm">
                <p className="text-surface-600">Enviar para</p>
                <button className="text-brand-600 hover:text-brand-700 font-medium">
                  Calcular frete →
                </button>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="text-sm">
                <p className="text-emerald-700 font-semibold">Frete grátis</p>
                <p className="text-surface-600">Chegará em 5-8 dias úteis</p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-bold text-surface-900 mb-4 font-display">Vendedor</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-500 to-brand-600 rounded-xl flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="font-semibold text-surface-900">MegaLoja Oficial</p>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-surface-700">98%</span>
                  <span className="text-surface-500">de reputação</span>
                </div>
              </div>
            </div>
            <Link 
              to="/seller/megaloja" 
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Ver mais produtos do vendedor →
            </Link>
          </div>

          {/* Guarantee */}
          <div className="bg-gradient-to-br from-brand-50 to-purple-50 rounded-2xl p-5 border border-brand-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="h-6 w-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-surface-900 mb-1 font-display">
                  Compra Garantida
                </h3>
                <p className="text-sm text-surface-600">
                  Receba o produto que está esperando ou devolvemos o dinheiro
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-2xl shadow-card p-6 mt-8">
        <h2 className="text-xl font-bold text-surface-900 mb-6 font-display">
          Características do produto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
          {[
            { label: 'SKU', value: product.sku || 'N/A' },
            { label: 'Categoria', value: product.category?.name || 'N/A' },
            { label: 'Estoque', value: `${product.stockQuantity} unidades` },
            { label: 'Condição', value: 'Novo' },
          ].map((item) => (
            <div key={item.label} className="flex py-4 border-b border-surface-100">
              <span className="text-surface-500 w-40 shrink-0">{item.label}</span>
              <span className="text-surface-900 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
