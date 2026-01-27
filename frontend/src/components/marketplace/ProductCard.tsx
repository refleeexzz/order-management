import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Truck } from 'lucide-react';
import type { Product } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { useCartStore } from '../../store/cartStore';
import { useState } from 'react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    addItem(product);
    toast.success('Produto adicionado ao carrinho!');
    setTimeout(() => setIsAdding(false), 500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
  };

  const discount = Math.floor(Math.random() * 30) + 10;
  const originalPrice = product.price / (1 - discount / 100);
  const rating = (Math.random() * 1 + 4).toFixed(1);
  const reviews = Math.floor(Math.random() * 200) + 50;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-white rounded-2xl shadow-card hover:shadow-soft transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-gradient-to-br from-surface-50 to-surface-100 overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-20 h-20 bg-surface-200 rounded-2xl flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-surface-400" />
            </div>
          </div>
        )}
        
        {/* Discount Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-accent-500 to-accent-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg shadow-md">
            -{discount}%
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2.5 rounded-xl transition-all duration-200 ${
            isWishlisted 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 backdrop-blur-sm text-surface-600 hover:bg-white hover:text-red-500'
          } shadow-md`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add Button */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full py-2.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all"
          >
            <ShoppingCart className={`h-4 w-4 ${isAdding ? 'animate-bounce' : ''}`} />
            {isAdding ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <span className="text-xs font-medium text-brand-600 mb-1">
            {product.category.name}
          </span>
        )}

        {/* Title */}
        <h3 className="text-sm font-medium text-surface-800 line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-semibold text-surface-700">{rating}</span>
          </div>
          <span className="text-xs text-surface-400">({reviews})</span>
        </div>

        {/* Price */}
        <div className="mt-auto space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-xs text-surface-400 line-through">
              {formatCurrency(originalPrice)}
            </p>
          </div>
          <p className="text-xl font-bold text-surface-900">
            {formatCurrency(product.price)}
          </p>
          <p className="text-xs text-surface-500">
            ou 12x de <span className="font-semibold text-brand-600">{formatCurrency(product.price / 12)}</span>
          </p>
        </div>

        {/* Free Shipping */}
        <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-100">
          <Truck className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-medium text-emerald-600">Frete grátis</span>
        </div>
      </div>
    </Link>
  );
}
