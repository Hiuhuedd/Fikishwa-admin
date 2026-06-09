'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency } from '@/lib/auth';
import StatCard from '@/components/ui/StatCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/EmptyState';
import type { PayoutStatistics } from '@/types/payout';
import type { RideStatistics } from '@/types/ride';
import { Car, Users, MapPin, CreditCard, Tag, Gift, ChevronRight } from 'lucide-react';

const quickActions = [
  { label: 'Manage Rides', href: '/rides', icon: MapPin, bg: 'bg-blue-50/50', text: 'text-blue-600', border: 'border-blue-100' },
  { label: 'Manage Drivers', href: '/drivers', icon: Car, bg: 'bg-emerald-50/50', text: 'text-emerald-600', border: 'border-emerald-100' },
  { label: 'View Customers', href: '/customers', icon: Users, bg: 'bg-indigo-50/50', text: 'text-indigo-600', border: 'border-indigo-100' },
  { label: 'Payouts', href: '/payouts', icon: CreditCard, bg: 'bg-amber-50/50', text: 'text-amber-600', border: 'border-amber-100' },
  { label: 'Promotions', href: '/promotions', icon: Gift, bg: 'bg-purple-50/50', text: 'text-purple-600', border: 'border-purple-100' },
  { label: 'Categories', href: '/categories', icon: Tag, bg: 'bg-slate-50/50', text: 'text-slate-600', border: 'border-slate-200' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [payoutStats, setPayoutStats] = useState<PayoutStatistics | null>(null);
  const [rideStats, setRideStats] = useState<RideStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true); setError('');
    try {
      const [pRes, rRes] = await Promise.all([
        api.get('/admin/payout/statistics'),
        api.get('/admin/rides/stats'),
      ]);
      setPayoutStats(pRes.data.stats || pRes.data);
      setRideStats(rRes.data.stats || rRes.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner fullScreen message="Loading dashboard…" />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-12">
      <PageHeader title="Dashboard" subtitle="Platform overview at a glance" />

      {/* Financial KPIs */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Financial Overview</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard title="Commission Owed" value={formatCurrency(payoutStats?.totalOwedCommission ?? 0)} icon="💰" subtitle="From drivers" />
          <StatCard title="Pending Payouts" value={formatCurrency(payoutStats?.totalPendingPayouts ?? 0)} icon="📤" subtitle="To drivers" />
          <StatCard title="Drivers Owing" value={payoutStats?.driversOwingCount ?? 0} icon="🚗" subtitle="Need to pay" />
          <StatCard title="Drivers Owed" value={payoutStats?.driversOwedCount ?? 0} icon="✅" subtitle="Awaiting payout" />
        </div>
      </section>

      {/* Ride Stats */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Ride Overview</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard title="Total Rides" value={rideStats?.totalRides ?? 0} icon="🚖" />
          <StatCard title="Active Rides" value={rideStats?.activeRides ?? 0} icon="⚡" subtitle="Now live" />
          <StatCard title="Completed" value={rideStats?.completedRides ?? 0} icon="🏁" />
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-slate-200 flex-1"></div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Quick Actions</h2>
          <div className="h-px bg-slate-200 flex-1"></div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {quickActions.map(({ label, href, icon: Icon, bg, text, border }) => (
            <Link key={href} href={href} className={`group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-white border border-slate-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${border} ${bg} ${text} group-hover:scale-110 transition-transform duration-300`}>
                <Icon strokeWidth={1.5} className="w-5 h-5" />
              </div>
              <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
