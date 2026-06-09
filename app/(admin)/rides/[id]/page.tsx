'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/auth';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/EmptyState';
import { ArrowLeft, Navigation, Clock, CreditCard, Car, User } from 'lucide-react';
import type { Ride } from '@/types/ride';

// Polyline decoder for Google Maps encoded strings
function decodePolyline(encoded: string) {
  let index = 0, len = encoded.length;
  let lat = 0, lng = 0;
  const coordinates = [];

  while (index < len) {
    let b, shift = 0, result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5] as [number, number]);
  }

  return coordinates;
}

const statusConfig: Record<string, { variant: any; label: string }> = {
  completed: { variant: 'success', label: 'COMPLETED' },
  cancelled: { variant: 'error', label: 'CANCELLED' },
  cancelled_no_drivers: { variant: 'error', label: 'NO DRIVERS' },
  in_progress: { variant: 'warning', label: 'IN PROGRESS' },
  started: { variant: 'warning', label: 'STARTED' },
  accepted: { variant: 'info', label: 'ACCEPTED' },
  arrived: { variant: 'info', label: 'ARRIVED' },
  searching: { variant: 'default', label: 'SEARCHING' },
};

function RideMap({ pickup, dropoff, routePolyline }: { pickup: any, dropoff: any, routePolyline?: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeaflet = async () => {
      if (!(window as any).L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current, { zoomControl: false }).setView([pickup.lat, pickup.lng], 13);
      mapInstance.current = map;
      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const createIcon = (color: string) => L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const pMarker = L.marker([pickup.lat, pickup.lng], { icon: createIcon('#10b981') }).addTo(map).bindPopup('<b>Pickup</b>');
      const dMarker = L.marker([dropoff.lat, dropoff.lng], { icon: createIcon('#ef4444') }).addTo(map).bindPopup('<b>Dropoff</b>');

      if (routePolyline) {
        const points = decodePolyline(routePolyline);
        if (points.length > 0) {
          const polyline = L.polyline(points, {
            color: '#3b82f6',
            weight: 5,
            opacity: 0.8,
            lineJoin: 'round'
          }).addTo(map);
          map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }
      } else {
        const group = new L.featureGroup([pMarker, dMarker]);
        map.fitBounds(group.getBounds(), { padding: [40, 40] });
      }
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [pickup, dropoff, routePolyline]);

  return <div ref={mapRef} className="w-full h-full rounded-2xl z-0" />;
}

export default function RideDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<Ride & { routePolyline?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRide = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/rides/${id}`);
      setRide(data.ride || data);
    } catch {
      setError('Failed to load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen message="Loading ride details…" />;
  if (error || !ride) return <ErrorState message={error || 'Ride not found'} onRetry={fetchRide} />;

  const cfg = statusConfig[ride.status] || { variant: 'default', label: ride.status.toUpperCase() };
  const fare = ride.finalFare || ride.estimatedFare || 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Rides
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Details */}
        <div className="flex-1 space-y-6 max-w-xl">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-xl font-bold text-textPrimary mb-1">Ride {ride.rideId.slice(0, 8).toUpperCase()}</h1>
                <p className="text-sm text-textMuted">{formatDate(ride.createdAt)}</p>
              </div>
              <Badge label={cfg.label} variant={cfg.variant} />
            </div>

            <div className="space-y-6">
              {/* Route */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1 pt-1">
                  <div className="w-3 h-3 rounded-full bg-success shrink-0 ring-4 ring-success/20" />
                  <div className="w-px h-12 bg-border border-dashed border-l-2" />
                  <div className="w-3 h-3 rounded-full bg-error shrink-0 ring-4 ring-error/20" />
                </div>
                <div className="flex-1 space-y-5">
                  <div>
                    <p className="text-xs font-bold text-textMuted uppercase mb-0.5">Pickup</p>
                    <p className="text-sm text-textPrimary font-medium leading-tight">{ride.pickup?.address || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-textMuted uppercase mb-0.5">Dropoff</p>
                    <p className="text-sm text-textPrimary font-medium leading-tight">{ride.dropoff?.address || 'Unknown'}</p>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border">
                <div className="bg-slate-50 p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-textMuted mb-1">
                    <Navigation className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Distance</span>
                  </div>
                  <p className="font-bold text-textPrimary">{ride.distanceKm ? `${ride.distanceKm.toFixed(1)} km` : '—'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-2 text-textMuted mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-semibold uppercase">Duration</span>
                  </div>
                  <p className="font-bold text-textPrimary">{ride.durationMin ? `${ride.durationMin.toFixed(0)} min` : '—'}</p>
                </div>
              </div>

              {/* Fare & Payment */}
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-textSecondary uppercase">Payment</p>
                    <p className="text-sm font-bold text-textPrimary capitalize">{ride.paymentMethod || 'Cash'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-textSecondary uppercase">Total Fare</p>
                  <p className="text-xl font-bold font-mono text-primary">{formatCurrency(fare)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* People Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-textSecondary"><User className="w-5 h-5" /></div>
                <h2 className="font-bold text-textPrimary">Customer</h2>
              </div>
              <p className="text-sm font-semibold text-textPrimary mb-1">{ride.customerName || 'Unknown Customer'}</p>
              <p className="text-xs text-textMuted break-all font-mono">{ride.customerId}</p>
            </div>
            
            <div className="bg-white rounded-2xl border border-border shadow-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-slate-100 rounded-lg text-textSecondary"><Car className="w-5 h-5" /></div>
                <h2 className="font-bold text-textPrimary">Driver</h2>
              </div>
              {ride.driverId ? (
                <>
                  <p className="text-sm font-semibold text-textPrimary mb-1">{ride.driverDetails?.name || 'Unknown Driver'}</p>
                  <p className="text-xs text-textMuted mb-2">{ride.driverDetails?.phone}</p>
                  <p className="text-xs text-textMuted break-all font-mono">{ride.driverId}</p>
                </>
              ) : (
                <p className="text-sm text-textMuted italic mt-2">No driver assigned</p>
              )}
            </div>
          </div>

          {/* Ratings & Feedback */}
          {(ride.customerRating || ride.driverRating) && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mt-6">
              <h2 className="text-sm font-bold text-textPrimary uppercase tracking-wider mb-4">Ratings & Feedback</h2>
              <div className="space-y-4">
                {ride.customerRating && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-border">
                    <p className="text-xs font-semibold text-textMuted uppercase mb-2">From Customer</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-lg ${star <= ride.customerRating!.stars ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                    {ride.customerRating.comment && <p className="text-sm text-textPrimary italic">"{ride.customerRating.comment}"</p>}
                  </div>
                )}
                {ride.driverRating && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-border">
                    <p className="text-xs font-semibold text-textMuted uppercase mb-2">From Driver</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={`text-lg ${star <= ride.driverRating!.stars ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                      ))}
                    </div>
                    {ride.driverRating.comment && <p className="text-sm text-textPrimary italic">"{ride.driverRating.comment}"</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Map */}
        <div className="flex-1 min-h-[400px] lg:min-h-full h-auto">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-2 w-full h-full min-h-[500px] relative overflow-hidden">
            {ride.pickup && ride.dropoff ? (
              <RideMap pickup={ride.pickup} dropoff={ride.dropoff} routePolyline={ride.routePolyline as string} />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl border border-dashed border-border">
                <p className="text-textMuted text-sm">Location data unavailable</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
