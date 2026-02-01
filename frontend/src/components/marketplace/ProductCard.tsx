import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Check } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import type { Product } from '../../types';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success('Produto adicionado ao carrinho!');
  };

  const getProductImage = () => {
    const seed = product.id || Math.floor(Math.random() * 1000);
    return `https://picsum.photos/seed/product${seed}/400/400`;
  };

  const imageUrl = product.imageUrl || getProductImage();
  const rating = 4 + Math.random();
  const reviewCount = Math.floor(50 + Math.random() * 200);
  const discount = Math.floor(10 + Math.random() * 30);
  const originalPrice = product.price * (1 + discount / 100);
  const inStock = product.stockQuantity > 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-violet-200 hover:shadow-2xl"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/seed/fallback${product.id}/400/400`;
          }}
        />
        
        {/* Discount Badge */}
        <div className="absolute left-3 top-3 rounded-lg bg-red-500 px-2.5 py-1 text-xs font-bold text-white shadow-lg">
          -{discount}%
        </div>

        {/* Stock Badge */}
        {product.stockQuantity > 0 && product.stockQuantity < 10 && (
          <div className="absolute left-3 top-10 rounded-lg bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
            Restam {product.stockQuantity}
          </div>
        )}

        {/* Out of Stock */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
            <span className="rounded-xl bg-gray-900/50 px-4 py-2 text-lg font-bold text-white">
              Esgotado
            </span>
          </div>
        )}
        
        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.info('Lista de desejos em breve!');
          }}
          className="absolute right-3 top-3 rounded-xl bg-white p-2.5 opacity-0 shadow-lg transition-all duration-300 hover:scale-110 hover:bg-red-50 group-hover:opacity-100"
          aria-label="Adicionar à lista de desejos"
        >
          <Heart className="h-4 w-4 text-gray-400 transition-colors hover:text-red-500" />
        </button>

        {/* Quick Add */}
        {inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button
              onClick={handleAddToCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-violet-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Adicionar ao Carrinho
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-grow flex-col p-4">
        {/* Category */}
        {product.category && (
          <span className="mb-2 inline-flex w-fit items-center rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-600">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 font-semibold leading-tight text-gray-900 transition-colors group-hover:text-violet-600">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-gray-500">({reviewCount})</span>
        </div>

        {/* Price */}
        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400 line-through">
              {formatCurrency(originalPrice)}
            </span>
          </div>
          <div className="text-xl font-bold text-gray-900">
            {formatCurrency(product.price)}
          </div>
          <div className="text-xs text-gray-500">
            ou 12x de {formatCurrency(product.price / 12)}
          </div>
          
          {/* Free Shipping */}
          {product.price > 99 && (
            <div className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600">
              <Check className="h-3.5 w-3.5" />
              Frete grátis
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
