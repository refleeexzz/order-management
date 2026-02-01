import { Outlet } from 'react-router-dom';
import { MarketplaceHeader } from './MarketplaceHeader';
import { MarketplaceFooter } from './MarketplaceFooter';

export function MarketplaceLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <MarketplaceHeader />
      <main className="w-full flex-1">
        <Outlet />
      </main>
      <MarketplaceFooter />
    </div>
  );
}
