'use client';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import PageHeader from '@/components/ui/PageHeader';
import TabBar from '@/components/ui/TabBar';
import SearchInput from '@/components/ui/SearchInput';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import type { Driver } from '@/types/driver';
import { ChevronRight, RefreshCw } from 'lucide-react';

type Tab = 'pending' | 'all';

function statusVariant(s: string): 'warning' | 'success' | 'error' | 'default' {
  if (s === 'pending') return 'warning';
  if (s === 'approved') return 'success';
  if (s === 'rejected') return 'error';
  return 'default';
}

export default function DriversPage() {
  const [tab, setTab] = useState<Tab>('pending');
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const url = tab === 'pending' ? '/admin/drivers/pending' : '/admin/drivers/all';
      const { data } = await api.get(url);
      setDrivers(data.drivers || []);
    } catch { setError('Failed to load drivers.'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = drivers.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Drivers"
        subtitle="Manage driver registrations and accounts"
        actions={
          <button onClick={fetch} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-slate-50 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        }
      />
      <TabBar tabs={[{ label: 'Pending', value: 'pending' }, { label: 'All Drivers', value: 'all' }]} active={tab} onChange={setTab} />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" />

      {loading ? <LoadingSpinner fullScreen message="Loading drivers…" /> :
        error ? <ErrorState message={error} onRetry={fetch} /> :
          filtered.length === 0 ? <EmptyState icon="🚗" message="No drivers found" action="Refresh" onAction={fetch} /> : (
            <div className="grid gap-3">
              {filtered.map(driver => (
                <div key={driver.driverId} className="bg-white rounded-xl border border-border shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {driver.profilePhotoUrl
                      ? <img src={driver.profilePhotoUrl} alt={driver.name} className="w-full h-full object-cover" />
                      : <span className="text-lg font-bold text-primary">{driver.name?.[0]?.toUpperCase()}</span>}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-textPrimary">{driver.name}</span>
                      <Badge label={driver.registrationStatus} variant={statusVariant(driver.registrationStatus)} />
                    </div>
                    <p className="text-sm text-textSecondary">{driver.phone}</p>
                    {driver.vehicleType && <p className="text-xs text-textMuted mt-0.5">{driver.vehicleType}</p>}
                  </div>
                  {/* Action */}
                  <Link href={`/drivers/${driver.driverId}`} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors shrink-0">
                    Details <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
    </div>
  );
}
