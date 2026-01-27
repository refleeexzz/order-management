import { Outlet } from 'react-router-dom';
import { MarketplaceHeader } from './MarketplaceHeader';
import { MarketplaceFooter } from './MarketplaceFooter';

export function MarketplaceLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <MarketplaceHeader />
      <main className="flex-1 animate-fade-in">
        <Outlet />
      </main>
      <MarketplaceFooter />
    </div>
  );
}
