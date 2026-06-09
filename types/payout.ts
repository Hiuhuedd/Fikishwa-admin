export interface PayoutStatistics {
  totalOwedCommission: number;
  totalPendingPayouts: number;
  driversOwingCount: number;
  driversOwedCount: number;
}

export interface DriverOwing {
  driverId: string;
  name: string;
  phone: string;
  owedCommission: number;
  lastTripAt?: string;
}

export interface DriverOwed {
  driverId: string;
  name: string;
  phone: string;
  pendingPayout: number;
  payoutPreference?: string;
}
