import { BarChart3 } from 'lucide-react';

export function SellerAnalytics() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
          <BarChart3 className="h-5 w-5 text-brand-600" />
        </div>
        <h1 className="text-xl font-bold text-surface-900 font-display">Relatórios</h1>
      </div>
      <p className="text-surface-600">
        Área de relatórios em construção. Em breve você verá métricas de vendas e desempenho.
      </p>
    </div>
  );
}
