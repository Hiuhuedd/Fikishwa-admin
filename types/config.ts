export interface AppConfig {
  commissionRate: number;
  taxRate: number;
  maxOwedCommission: number;
  paybillNumber: string;
  supportPhone: string;
  supportEmail: string;
  maxDispatchRadius: number | null;
  geohashPrecision?: number;
  surgeMultiplier: number;
  updatedAt?: string;
}

export interface Customer {
  customerId: string;
  uid: string;
  name: string;
  phone: string;
  email?: string;
  createdAt?: string;
  totalRides?: number;
}

export interface Promotion {
  promoId: string;
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrderValue?: number;
  maxUses?: number;
  usedCount?: number;
  expiryDate?: string;
  isActive?: boolean;
}
