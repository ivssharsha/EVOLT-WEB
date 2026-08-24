export type UserRole = 'customer' | 'merchant';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  vehicleNumber?: string;
  vehicleModel?: string;
  batteryCapacityKWh?: number;
  merchantStationId?: string;
  createdAt: string;
}

export type ChargerType = 'CCS2 Fast DC' | 'Type-2 AC' | '150kW Ultra-Fast' | 'GB/T Fast DC' | 'CHAdeMO';
export type PortStatus = 'available' | 'in-use' | 'maintenance';

export interface Port {
  id: string;
  type: ChargerType;
  powerKW: number; // e.g. 60, 22, 150
  voltage: string; // e.g. "400V - 800V DC", "240V AC"
  status: PortStatus;
  pricePerKWh: number;
}

export interface Station {
  id: string;
  merchantId: string;
  merchantName: string;
  name: string;
  address: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  timings: string; // e.g. "24/7 Open" or "06:00 AM - 11:00 PM"
  basePricePerKWh: number; // e.g. 15
  voltageRating: string; // e.g. "400V / 800V Ultra-Charge"
  ports: Port[];
  amenities: string[]; // e.g. ["Cafe", "Free WiFi", "Restroom", "24/7 Security", "EV Lounge"]
  rating: number;
  totalReviews: number;
  isBusy: boolean;
  estimatedWaitTimeMins: number; // 0 if free, >0 if busy
  distanceKm?: number;
  etaMins?: number;
  phone: string;
  image: string;
}

export type BookingStatus = 'confirmed' | 'charging' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  bookingCode: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  vehicleNumber: string;
  stationId: string;
  stationName: string;
  stationAddress: string;
  stationCity: string;
  portId: string;
  portType: ChargerType;
  powerKW: number;
  unitsKWh: number;
  voltageSelected: string;
  ratePerKWh: number;
  energySubtotal: number;
  convenienceFee: number;
  taxAmount: number;
  totalAmount: number;
  status: BookingStatus;
  slotTime: string; // e.g. "Today, 14:30"
  createdAt: string;
  paymentMethod: string;
  paymentRef: string;
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'destination' | 'station';
  stationId?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string; payload?: any }[];
}
