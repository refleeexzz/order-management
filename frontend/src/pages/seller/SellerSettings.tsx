import { Settings } from 'lucide-react';

export function SellerSettings() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <Settings className="h-5 w-5 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 font-display">Configurações</h1>
      </div>
      <p className="text-surface-600">
        Esta área está sendo preparada. Em breve você poderá configurar sua loja aqui.
      </p>
    </div>
  );
}
