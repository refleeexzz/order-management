import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Shield, Truck, Tag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { Button, Input } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, getTotal, getItemsCount } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="w-full max-w-none mx-auto px-4 py-20 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
        <div className="text-center">
          <div className="w-24 h-24 bg-surface-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-surface-400" />
          </div>
          <h1 className="text-2xl font-bold text-surface-900 mb-2 font-display">
            Seu carrinho está vazio
          </h1>
          <p className="text-surface-500 mb-8 max-w-md mx-auto">
            Parece que você ainda não adicionou nenhum produto. Explore nossa loja e encontre algo especial!
          </p>
          <Link to="/products">
            <Button size="lg">
              <ShoppingBag className="h-5 w-5" />
              Explorar produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shipping = subtotal > 200 ? 0 : 19.90;
  const total = subtotal + shipping;

  return (
    <div className="w-full max-w-none mx-auto px-4 py-8 sm:px-6 lg:px-10 xl:px-14 2xl:px-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 font-display">Carrinho de Compras</h1>
          <p className="text-surface-500">{getItemsCount()} {getItemsCount() === 1 ? 'item' : 'itens'}</p>
        </div>
        <Link 
          to="/products" 
          className="text-brand-600 hover:text-brand-700 font-medium flex items-center gap-2 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Continuar comprando
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="bg-white rounded-2xl shadow-card p-5 transition-all hover:shadow-soft">
              <div className="flex gap-5">
                {/* Product Image */}
                <Link 
                  to={`/product/${item.product.id}`}
                  className="shrink-0"
                >
                  <img
                    src={`https://picsum.photos/seed/${item.product.id}/120/120`}
                    alt={item.product.name}
                    className="w-28 h-28 object-cover rounded-xl"
                  />
                </Link>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="font-semibold text-surface-900 hover:text-brand-600 transition-colors line-clamp-2"
                    >
                      {item.product.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-surface-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>

                  {item.product.category && (
                    <p className="text-sm text-surface-500 mt-1">
                      {item.product.category.name}
                    </p>
                  )}

                  {/* Stock */}
                  <p className="text-sm text-emerald-600 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                    Em estoque ({item.product.stockQuantity} disponíveis)
                  </p>

                  {/* Price & Quantity */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 gap-4">
                    <div className="flex items-center bg-surface-50 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 min-w-[50px] text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="p-2 hover:bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-surface-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                      <p className="text-sm text-surface-500">
                        {formatCurrency(item.product.price)} cada
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <div className="flex justify-end pt-2">
            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Limpar carrinho
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6 font-display">
              Resumo do Pedido
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal ({getItemsCount()} itens)</span>
                <span className="font-medium text-surface-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span>Frete</span>
                {shipping === 0 ? (
                  <span className="font-medium text-emerald-600">Grátis</span>
                ) : (
                  <span className="font-medium text-surface-900">{formatCurrency(shipping)}</span>
                )}
              </div>
              {shipping > 0 && (
                <div className="p-3 bg-brand-50 rounded-xl">
                  <p className="text-sm text-brand-700">
                    Falta <span className="font-bold">{formatCurrency(200 - subtotal)}</span> para frete grátis
                  </p>
                  <div className="mt-2 bg-brand-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / 200) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-surface-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-surface-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-surface-900">{formatCurrency(total)}</span>
                  <p className="text-sm text-surface-500">
                    ou 12x de {formatCurrency(total / 12)}
                  </p>
                </div>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full" size="lg">
                Finalizar Compra
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>

            {/* Benefits */}
            <div className="mt-6 pt-6 border-t border-surface-100 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <Truck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">Frete Grátis</p>
                  <p className="text-xs text-surface-500">Acima de R$ 200</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-brand-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900">Compra Segura</p>
                  <p className="text-xs text-surface-500">Seus dados protegidos</p>
                </div>
              </div>
            </div>

            {/* Coupon */}
            <div className="mt-6 pt-6 border-t border-surface-100">
              <div className="flex items-center gap-2 mb-3">
                <Tag className="h-4 w-4 text-surface-500" />
                <span className="text-sm font-medium text-surface-700">Cupom de desconto</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o código"
                  className="text-sm"
                />
                <Button variant="secondary" size="sm">
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
