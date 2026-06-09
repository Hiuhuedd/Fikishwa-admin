export interface Ride {
  rideId: string;
  customerId: string;
  driverId?: string;
  customerName?: string;
  driverDetails?: { name: string; phone: string };
  status: 'searching' | 'accepted' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'cancelled_no_drivers';
  pickup: { address?: string; lat: number; lng: number };
  dropoff: { address?: string; lat: number; lng: number };
  estimatedFare?: number;
  finalFare?: number;
  distanceKm?: number;
  durationMin?: number;
  paymentMethod?: 'cash' | 'mpesa';
  vehicleCategory?: string;
  customerRating?: { stars: number; comment: string; ratedAt: string };
  driverRating?: { stars: number; comment: string; ratedAt: string };
  createdAt: string | { seconds: number };
}

export interface RideStatistics {
  totalRides: number;
  activeRides: number;
  completedRides: number;
  cancelledRides: number;
}
