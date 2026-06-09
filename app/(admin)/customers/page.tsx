'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import SearchInput from '@/components/ui/SearchInput';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import type { Customer } from '@/types/config';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { data } = await api.get('/admin/customers/all');
      setCustomers(data.customers || data || []);
    } catch { setError('Failed to load customers.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Customers" subtitle="View all registered customers" />
      <SearchInput value={search} onChange={setSearch} placeholder="Search by name or phone…" />

      {loading ? <LoadingSpinner fullScreen message="Loading customers…" /> :
        error ? <ErrorState message={error} onRetry={fetch} /> :
          filtered.length === 0 ? <EmptyState icon="👥" message="No customers found" /> : (
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-border">
                  <tr>{['Name', 'Phone', 'Email', 'Joined', 'Total Rides'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-textMuted">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(c => (
                    <tr key={c.customerId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-textPrimary">{c.name}</td>
                      <td className="px-4 py-3 text-textSecondary">{c.phone}</td>
                      <td className="px-4 py-3 text-textSecondary">{c.email || '—'}</td>
                      <td className="px-4 py-3 text-textMuted">{formatDate(c.createdAt)}</td>
                      <td className="px-4 py-3 font-mono text-textPrimary">{c.totalRides ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
    </div>
  );
}
