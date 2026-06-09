export interface VehicleCategory {
  categoryId: string;
  name: string;
  baseFare: number;
  perKmRate: number;
  perMinRate: number;
  minFare: number;
  maxPassengers: number;
  active: boolean;
  image?: string;
  description?: string;
}
