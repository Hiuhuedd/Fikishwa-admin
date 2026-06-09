'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Car, Users, MapPin, CreditCard, Tag, Gift, Settings, X, Newspaper } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Drivers', href: '/drivers', icon: Car },
  { label: 'Customers', href: '/customers', icon: Users },
  { label: 'Rides', href: '/rides', icon: MapPin },
  { label: 'Payouts', href: '/payouts', icon: CreditCard },
  { label: 'Categories', href: '/categories', icon: Tag },
  { label: 'Promotions', href: '/promotions', icon: Gift },
  { label: 'News', href: '/news', icon: Newspaper },
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps { open?: boolean; onClose?: () => void; }

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 h-full z-30 w-64 bg-primary flex flex-col transition-transform duration-300
        md:translate-x-0 md:static md:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Fikishwa</span>
          </div>
          <button onClick={onClose} className="md:hidden p-1 text-white/60 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-6 pt-5 pb-2 text-xs font-semibold uppercase tracking-widest text-white/40">Navigation</p>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-xs text-white/30">Fikishwa Admin v1.0</p>
        </div>
      </aside>
    </>
  );
}
