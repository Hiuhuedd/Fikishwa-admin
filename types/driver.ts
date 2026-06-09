export interface Driver {
  driverId: string;
  uid: string;
  name: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;
  registrationStatus: 'pending' | 'approved' | 'rejected';
  isEnabled?: boolean;
  vehicleType?: string;
  vehicleCategory?: string;
  carModel?: string;
  carYear?: string;
  plateNumber?: string;
  vehicleRegNo?: string;
  carImageUrl?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  licenseUrl?: string;
  goodConductUrl?: string;
  carRegistrationUrl?: string;
  docStatuses?: Record<string, { status: 'approved' | 'rejected' | 'pending'; reason?: string }>;
  owedCommission?: number;
  pendingPayout?: number;
  createdAt?: string;
}
