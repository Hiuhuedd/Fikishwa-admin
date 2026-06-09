'use client';
import { Menu, RefreshCw, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/drivers': 'Drivers',
  '/customers': 'Customers',
  '/rides': 'Rides',
  '/payouts': 'Payouts',
  '/categories': 'Vehicle Categories',
  '/promotions': 'Promotions',
  '/settings': 'Settings',
};

export default function Topbar({ onMenuClick, onRefresh }: { onMenuClick?: () => void; onRefresh?: () => void }) {
  const pathname = usePathname();
  const base = '/' + pathname.split('/')[1];
  const title = titles[base] || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0 sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-slate-100 transition-colors md:hidden">
          <Menu className="w-5 h-5 text-textSecondary" />
        </button>
        <span className="hidden md:block text-sm text-textMuted">Fikishwa</span>
        <span className="hidden md:block text-textMuted">/</span>
        <span className="font-semibold text-textPrimary">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {onRefresh && (
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-slate-100 transition-colors group" title="Refresh">
            <RefreshCw className="w-4.5 h-4.5 text-textSecondary group-hover:text-primary transition-colors" style={{ width: 18, height: 18 }} />
          </button>
        )}
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">A</div>
      </div>
    </header>
  );
}
