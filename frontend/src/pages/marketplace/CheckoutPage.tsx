import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  CreditCard, 
  Building2, 
  QrCode, 
  Check,
  Shield,
  Lock,
  ArrowLeft,
  MapPin,
  Truck,
  Package,
  Sparkles
} from 'lucide-react';
import { api } from '../../lib/api';
import { useCartStore } from '../../store/cartStore';
import { Button, Input } from '../../components/ui';
import { formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';

type PaymentMethod = 'credit' | 'debit' | 'pix' | 'boleto';

interface AddressForm {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();

  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [address, setAddress] = useState<AddressForm>({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1',
  });

  const subtotal = getTotal();
  const shipping = subtotal > 200 ? 0 : 19.90;
  const total = subtotal + shipping;

  const createOrder = useMutation({
    mutationFn: async () => {
      const orderData = {
        customerId: 1, // Would come from user profile
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        shippingAddress: `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.cep}`,
        paymentMethod,
        totalAmount: total,
      };
      return api.post('/api/orders', orderData);
    },
    onSuccess: () => {
      toast.success('Pedido realizado com sucesso!');
      clearCart();
      navigate('/orders');
    },
    onError: () => {
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    },
  });

  const handleCepChange = async (cep: string) => {
    setAddress({ ...address, cep });
    if (cep.replace(/\D/g, '').length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setAddress({
            ...address,
            cep,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          });
        }
      } catch {
        // CEP not found
      }
    }
  };

  const handleSubmit = () => {
    if (step === 1) {
      if (!address.cep || !address.street || !address.number || !address.city) {
        toast.error('Preencha todos os campos obrigatórios do endereço');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (paymentMethod === 'credit' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) {
        toast.error('Preencha todos os dados do cartão');
        return;
      }
      setStep(3);
    } else {
      createOrder.mutate();
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const steps = [
    { number: 1, label: 'Endereço', icon: MapPin },
    { number: 2, label: 'Pagamento', icon: CreditCard },
    { number: 3, label: 'Confirmar', icon: Check },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => step > 1 ? setStep(step - 1) : navigate('/cart')}
          className="flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar
        </button>
        <h1 className="text-2xl font-bold text-surface-900 font-display">Finalizar Compra</h1>
      </div>

      {/* Progress Steps */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-8">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-all ${
                    step >= s.number
                      ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md'
                      : 'bg-surface-100 text-surface-400'
                  }`}
                >
                  {step > s.number ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`text-sm mt-2 font-medium ${
                  step >= s.number ? 'text-brand-600' : 'text-surface-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 rounded-full transition-colors ${
                    step > s.number ? 'bg-brand-500' : 'bg-surface-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-surface-900 font-display">
                  Endereço de entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    CEP *
                  </label>
                  <Input
                    placeholder="00000-000"
                    value={address.cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Rua *
                  </label>
                  <Input
                    placeholder="Nome da rua"
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Número *
                  </label>
                  <Input
                    placeholder="123"
                    value={address.number}
                    onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Complemento
                  </label>
                  <Input
                    placeholder="Apto, bloco, etc."
                    value={address.complement}
                    onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Bairro *
                  </label>
                  <Input
                    placeholder="Bairro"
                    value={address.neighborhood}
                    onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Cidade *
                  </label>
                  <Input
                    placeholder="Cidade"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-2">
                    Estado *
                  </label>
                  <Input
                    placeholder="UF"
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    maxLength={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-card p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-brand-600" />
                </div>
                <h2 className="text-lg font-bold text-surface-900 font-display">
                  Forma de pagamento
                </h2>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { id: 'credit', label: 'Crédito', icon: CreditCard },
                  { id: 'debit', label: 'Débito', icon: CreditCard },
                  { id: 'pix', label: 'PIX', icon: QrCode, discount: true },
                  { id: 'boleto', label: 'Boleto', icon: Building2 },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`p-4 rounded-xl text-center transition-all relative ${
                      paymentMethod === method.id
                        ? 'bg-brand-50 border-2 border-brand-500 shadow-md'
                        : 'bg-surface-50 border-2 border-transparent hover:border-surface-200'
                    }`}
                  >
                    {method.discount && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -5%
                      </span>
                    )}
                    <method.icon className={`h-6 w-6 mx-auto mb-2 ${
                      paymentMethod === method.id ? 'text-brand-600' : 'text-surface-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      paymentMethod === method.id ? 'text-brand-700' : 'text-surface-700'
                    }`}>{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Credit Card Form */}
              {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                <div className="space-y-4 p-4 bg-surface-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Número do cartão
                    </label>
                    <Input
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-2">
                      Nome no cartão
                    </label>
                    <Input
                      placeholder="Como está no cartão"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Validade
                      </label>
                      <Input
                        placeholder="MM/AA"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        CVV
                      </label>
                      <Input
                        placeholder="123"
                        type="password"
                        maxLength={4}
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      />
                    </div>
                  </div>
                  {paymentMethod === 'credit' && (
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-2">
                        Parcelas
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-surface-200 rounded-xl bg-white text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        value={cardData.installments}
                        onChange={(e) => setCardData({ ...cardData, installments: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                          <option key={n} value={n}>
                            {n}x de {formatCurrency(total / n)} sem juros
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* PIX */}
              {paymentMethod === 'pix' && (
                <div className="text-center py-8 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-surface-700 font-medium">
                    O QR Code será gerado após a confirmação do pedido
                  </p>
                  <p className="text-sm text-emerald-600 font-semibold mt-2">
                    🎉 5% de desconto no PIX!
                  </p>
                </div>
              )}

              {/* Boleto */}
              {paymentMethod === 'boleto' && (
                <div className="text-center py-8 bg-surface-50 rounded-xl">
                  <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-surface-500" />
                  </div>
                  <p className="text-surface-700 font-medium">
                    O boleto será gerado após a confirmação do pedido
                  </p>
                  <p className="text-sm text-surface-500 mt-2">
                    Vencimento em 3 dias úteis
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="space-y-4 animate-slide-up">
              {/* Address Summary */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-surface-900 font-display">Endereço de entrega</h3>
                  </div>
                  <button
                    onClick={() => setStep(1)}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Editar
                  </button>
                </div>
                <p className="text-surface-600 ml-13">
                  {address.street}, {address.number}
                  {address.complement && ` - ${address.complement}`}
                  <br />
                  {address.neighborhood}, {address.city} - {address.state}
                  <br />
                  CEP: {address.cep}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-surface-900 font-display">Forma de pagamento</h3>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium"
                  >
                    Editar
                  </button>
                </div>
                <p className="text-surface-600 ml-13">
                  {paymentMethod === 'credit' && `Cartão de Crédito em ${cardData.installments}x`}
                  {paymentMethod === 'debit' && 'Cartão de Débito'}
                  {paymentMethod === 'pix' && 'PIX (5% de desconto)'}
                  {paymentMethod === 'boleto' && 'Boleto Bancário'}
                </p>
              </div>

              {/* Items Summary */}
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-brand-600" />
                  </div>
                  <h3 className="font-bold text-surface-900 font-display">Itens do pedido</h3>
                </div>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-4 p-3 bg-surface-50 rounded-xl">
                      <img
                        src={`https://picsum.photos/seed/${item.product.id}/80/80`}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-surface-900 line-clamp-2">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-surface-500 mt-1">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <p className="font-bold text-surface-900">
                        {formatCurrency(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-surface-900 mb-6 font-display">
              Resumo do pedido
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-surface-600">
                <span>Subtotal</span>
                <span className="font-medium text-surface-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-surface-600">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Frete
                </span>
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-semibold">Grátis</span>
                ) : (
                  <span className="font-medium text-surface-900">{formatCurrency(shipping)}</span>
                )}
              </div>
              {paymentMethod === 'pix' && (
                <div className="flex justify-between text-emerald-600">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Desconto PIX
                  </span>
                  <span className="font-semibold">-{formatCurrency(total * 0.05)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-surface-100 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-bold text-surface-900">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-bold text-surface-900">
                    {formatCurrency(paymentMethod === 'pix' ? total * 0.95 : total)}
                  </span>
                  {paymentMethod === 'credit' && parseInt(cardData.installments) > 1 && (
                    <p className="text-sm text-surface-500">
                      em {cardData.installments}x sem juros
                    </p>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              size="lg"
              isLoading={createOrder.isPending}
            >
              {step === 3 ? 'Finalizar pedido' : 'Continuar'}
            </Button>

            {/* Security */}
            <div className="mt-6 pt-6 border-t border-surface-100 space-y-3">
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                  <Lock className="h-4 w-4 text-emerald-600" />
                </div>
                <span>Pagamento 100% seguro</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-surface-600">
                <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center shrink-0">
                  <Shield className="h-4 w-4 text-brand-600" />
                </div>
                <span>Dados protegidos com criptografia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
