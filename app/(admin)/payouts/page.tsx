'use client';
import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import TabBar from '@/components/ui/TabBar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import type { PayoutStatistics, DriverOwing, DriverOwed } from '@/types/payout';

type Tab = 'owing' | 'owed';

export default function PayoutsPage() {
  const [tab, setTab] = useState<Tab>('owing');
  const [stats, setStats] = useState<PayoutStatistics | null>(null);
  const [owing, setOwing] = useState<DriverOwing[]>([]);
  const [owed, setOwed] = useState<DriverOwed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [sRes, listRes] = await Promise.all([
        api.get('/admin/payout/statistics'),
        tab === 'owing' ? api.get('/admin/payout/drivers-owing') : api.get('/admin/payout/drivers-owed'),
      ]);
      setStats(sRes.data.stats || sRes.data);
      if (tab === 'owing') setOwing(listRes.data.drivers || []);
      else setOwed(listRes.data.drivers || []);
    } catch { setError('Failed to load payout data.'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-5">
      <PageHeader title="Payouts" subtitle="Commission tracking and driver payouts" />

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-error/5 border border-error/20 rounded-xl p-5">
            <p className="text-xs text-textMuted mb-1">Total Owed Commission</p>
            <p className="text-2xl font-bold text-error">{formatCurrency(stats.totalOwedCommission)}</p>
            <p className="text-xs text-textMuted mt-1">{stats.driversOwingCount} drivers owing</p>
          </div>
          <div className="bg-warning/5 border border-warning/20 rounded-xl p-5">
            <p className="text-xs text-textMuted mb-1">Total Pending Payouts</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(stats.totalPendingPayouts)}</p>
            <p className="text-xs text-textMuted mt-1">{stats.driversOwedCount} drivers waiting</p>
          </div>
        </div>
      )}

      <TabBar tabs={[{ label: 'Owing Commission', value: 'owing' }, { label: 'Pending Payouts', value: 'owed' }]} active={tab} onChange={setTab} />

      {loading ? <LoadingSpinner fullScreen message="Loading financial data…" /> :
        error ? <ErrorState message={error} onRetry={fetchData} /> :
          tab === 'owing' ? (
            owing.length === 0 ? <EmptyState icon="✅" message="No drivers owing commission" /> : (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>{['Driver', 'Phone', 'Owed', 'Last Trip'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-textMuted">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {owing.map(d => (
                      <tr key={d.driverId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-textPrimary">{d.name}</td>
                        <td className="px-4 py-3 text-textSecondary">{d.phone}</td>
                        <td className="px-4 py-3 font-bold font-mono text-error">{formatCurrency(d.owedCommission)}</td>
                        <td className="px-4 py-3 text-textMuted">{d.lastTripAt ? formatDate(d.lastTripAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            owed.length === 0 ? <EmptyState icon="💳" message="No pending payouts" /> : (
              <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-border">
                    <tr>{['Driver', 'Phone', 'Pending', 'Preference', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-textMuted">{h}</th>)}</tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {owed.map(d => (
                      <tr key={d.driverId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-textPrimary">{d.name}</td>
                        <td className="px-4 py-3 text-textSecondary">{d.phone}</td>
                        <td className="px-4 py-3 font-bold font-mono text-success">{formatCurrency(d.pendingPayout)}</td>
                        <td className="px-4 py-3 text-textMuted capitalize">{d.payoutPreference || 'M-Pesa'}</td>
                        <td className="px-4 py-3">
                          <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors">Pay</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
    </div>
  );
}
