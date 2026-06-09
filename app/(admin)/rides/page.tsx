'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState, { ErrorState } from '@/components/ui/EmptyState';
import Link from 'next/link';
import type { Ride } from '@/types/ride';

type BadgeVariant = 'success' | 'error' | 'warning' | 'info' | 'default';
const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  completed: { variant: 'success', label: 'COMPLETED' },
  cancelled: { variant: 'error', label: 'CANCELLED' },
  cancelled_no_drivers: { variant: 'error', label: 'NO DRIVERS' },
  in_progress: { variant: 'warning', label: 'IN PROGRESS' },
  started: { variant: 'warning', label: 'STARTED' },
  accepted: { variant: 'info', label: 'ACCEPTED' },
  arrived: { variant: 'info', label: 'ARRIVED' },
  searching: { variant: 'default', label: 'SEARCHING' },
};

export default function RidesPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [lastDocId, setLastDocId] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  const fetchRides = useCallback(async (refresh = false) => {
    if (refresh) { setLoading(true); setLastDocId(null); } else setLoadingMore(true);
    setError('');
    try {
      const params = new URLSearchParams({ limit: '20' });
      if (!refresh && lastDocId) params.append('lastDocId', lastDocId);
      const { data } = await api.get(`/admin/rides?${params}`);
      const newRides: Ride[] = data.rides || [];
      if (refresh) setRides(newRides); else setRides(p => [...p, ...newRides]);
      setLastDocId(data.lastDocId || null);
      setHasMore(data.hasMore || false);
    } catch { setError('Failed to load rides.'); }
    finally { setLoading(false); setLoadingMore(false); }
  }, [lastDocId]);

  useEffect(() => { fetchRides(true); }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => { if (entry.isIntersecting && hasMore && !loadingMore) fetchRides(false); }, { threshold: 0.5 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, fetchRides]);

  return (
    <div className="space-y-5">
      <PageHeader title="Rides" subtitle="Complete ride history and status tracking" />

      {loading ? <LoadingSpinner fullScreen message="Loading rides…" /> :
        error ? <ErrorState message={error} onRetry={() => fetchRides(true)} /> :
          rides.length === 0 ? <EmptyState icon="🚖" message="No rides found" action="Refresh" onAction={() => fetchRides(true)} /> : (
            <div className="grid gap-3">
              {rides.map(ride => {
                const cfg = statusConfig[ride.status] || { variant: 'default' as BadgeVariant, label: ride.status.replace(/_/g, ' ').toUpperCase() };
                const fare = ride.finalFare || ride.estimatedFare || 0;
                return (
                  <Link href={`/rides/${ride.rideId}`} key={ride.rideId} className="block bg-white rounded-xl border border-border shadow-sm p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-textMuted">{formatDate(ride.createdAt)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono text-textPrimary">{formatCurrency(fare)}</span>
                        <Badge label={cfg.label} variant={cfg.variant} />
                      </div>
                    </div>
                    <div className="flex gap-3 mb-3">
                      <div className="flex flex-col items-center gap-1 pt-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-success shrink-0" />
                        <div className="w-px flex-1 bg-border" />
                        <div className="w-2.5 h-2.5 rounded-full bg-error shrink-0" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm text-textPrimary leading-tight">{ride.pickup?.address || 'Unknown Pickup'}</p>
                        <p className="text-sm text-textPrimary leading-tight">{ride.dropoff?.address || 'Unknown Dropoff'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-textMuted">
                      <span>🚗 {ride.driverDetails?.name || 'No driver'}</span>
                      <span>👤 {ride.customerName || 'Customer'}</span>
                    </div>
                  </Link>
                );
              })}
              <div ref={loaderRef} className="py-4 flex justify-center">
                {loadingMore ? <LoadingSpinner message="Loading more…" /> : hasMore ? <p className="text-sm text-textMuted">Scroll for more</p> : <p className="text-sm text-textMuted">All rides loaded</p>}
              </div>
            </div>
          )}
    </div>
  );
}
