import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Station, Booking, ChargerType, PortStatus, UserRole } from '../types';
import { INITIAL_USERS, INITIAL_STATIONS, INITIAL_BOOKINGS } from '../data/mockData';

interface RouteCoords {
  lat: number;
  lng: number;
}

interface SearchRouteState {
  from: string;
  fromCoords: RouteCoords | null;
  to: string;
  toCoords: RouteCoords | null;
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  stations: Station[];
  bookings: Booking[];
  searchRoute: SearchRouteState;
  activeTab: 'search' | 'history' | 'profile' | 'merchant';
  selectedStationForBooking: Station | null;
  bookingModalOpen: boolean;
  paymentModalOpen: boolean;
  activePaymentBooking: Booking | null;
  aiDrawerOpen: boolean;
  authModalOpen: boolean;
  authModalMode: 'login' | 'role_select' | 'signup_customer' | 'signup_merchant' | 'forgot_password';
  activeFilterCharger: string;
  maxPriceFilter: number;
  showOnlyAvailable: boolean;
  
  // Actions
  setCurrentUser: (user: User | null) => void;
  setActiveTab: (tab: 'search' | 'history' | 'profile' | 'merchant') => void;
  setSearchRoute: React.Dispatch<React.SetStateAction<SearchRouteState>>;
  setSelectedStationForBooking: (station: Station | null) => void;
  setBookingModalOpen: (open: boolean) => void;
  setPaymentModalOpen: (open: boolean) => void;
  setActivePaymentBooking: (booking: Booking | null) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'role_select' | 'signup_customer' | 'signup_merchant' | 'forgot_password') => void;
  setActiveFilterCharger: (charger: string) => void;
  setMaxPriceFilter: (price: number) => void;
  liveNavigationModalOpen: boolean;
  setLiveNavigationModalOpen: (open: boolean) => void;
  navigatingTarget: { name: string; address?: string; lat: number; lng: number } | null;
  startLiveNavigation: (target: { name: string; address?: string; lat: number; lng: number }) => void;

  // Auth & Operations
  login: (identifier: string, pass: string) => { success: boolean; message: string };
  signupCustomer: (data: { name: string; vehicleNumber: string; email: string; phone: string }) => { success: boolean; message: string };
  signupMerchant: (data: { name: string; stationName: string; address: string; area: string; city: string; timings: string; basePricePerKWh: number; phone: string; email: string }) => { success: boolean; message: string };
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  updateMerchantStation: (stationId: string, data: Partial<Station>) => void;
  togglePortStatus: (stationId: string, portId: string, status: PortStatus) => void;
  createBooking: (bookingDetails: {
    station: Station;
    port: { id: string; type: ChargerType; powerKW: number; voltage: string; pricePerKWh: number };
    unitsKWh: number;
    slotTime: string;
    vehicleNumber: string;
    userName: string;
    userPhone: string;
    userEmail: string;
  }) => Booking;
  confirmPaymentAndBooking: (bookingId: string) => void;
  cancelBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  switchRoleDemo: (role: UserRole) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage initialization with fallbacks
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('evolt_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('evolt_current_user');
    if (saved) return JSON.parse(saved);
    return INITIAL_USERS[0]; // Default logged-in customer for quick start
  });

  const [stations, setStations] = useState<Station[]>(() => {
    const saved = localStorage.getItem('evolt_stations');
    return saved ? JSON.parse(saved) : INITIAL_STATIONS;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('evolt_bookings');
    return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
  });

  const [searchRoute, setSearchRoute] = useState<SearchRouteState>({
    from: 'HITEC City Metro & Cyber Towers',
    fromCoords: { lat: 17.4504, lng: 78.3808 },
    to: 'Rajiv Gandhi International Airport Shamshabad',
    toCoords: { lat: 17.2403, lng: 78.4294 },
  });

  const [activeTab, setActiveTab] = useState<'search' | 'history' | 'profile' | 'merchant'>('search');
  const [selectedStationForBooking, setSelectedStationForBooking] = useState<Station | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentBooking, setActivePaymentBooking] = useState<Booking | null>(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'role_select' | 'signup_customer' | 'signup_merchant' | 'forgot_password'>('login');

  const [activeFilterCharger, setActiveFilterCharger] = useState<string>('all');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(25);
  const [showOnlyAvailable, setShowOnlyAvailable] = useState<boolean>(false);

  const [liveNavigationModalOpen, setLiveNavigationModalOpen] = useState(false);
  const [navigatingTarget, setNavigatingTarget] = useState<{ name: string; address?: string; lat: number; lng: number } | null>(null);

  const startLiveNavigation = (target: { name: string; address?: string; lat: number; lng: number }) => {
    setNavigatingTarget(target);
    setSearchRoute(prev => ({
      ...prev,
      to: target.name,
      toCoords: { lat: target.lat, lng: target.lng }
    }));
    setLiveNavigationModalOpen(true);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('evolt_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('evolt_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('evolt_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('evolt_stations', JSON.stringify(stations));
  }, [stations]);

  useEffect(() => {
    localStorage.setItem('evolt_bookings', JSON.stringify(bookings));
  }, [bookings]);

  // Auth Operations
  const login = (identifier: string, _pass: string) => {
    const user = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() || u.phone === identifier || u.vehicleNumber?.toLowerCase() === identifier.toLowerCase()
    );

    if (user) {
      setCurrentUser(user);
      setAuthModalOpen(false);
      if (user.role === 'merchant') {
        setActiveTab('merchant');
      } else {
        setActiveTab('search');
      }
      return { success: true, message: `Welcome back, ${user.name}!` };
    }

    // If identifier doesn't exist, create a temporary session user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: identifier.split('@')[0] || 'EV Driver',
      email: identifier.includes('@') ? identifier : `${identifier}@evolt.app`,
      phone: identifier.startsWith('+') || /^\d+$/.test(identifier) ? identifier : '+91 98765 00000',
      role: 'customer',
      vehicleNumber: 'TS 09 EV 9999',
      vehicleModel: 'Electric Vehicle',
      batteryCapacityKWh: 30.2,
      createdAt: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    setActiveTab('search');
    return { success: true, message: `Logged in successfully as ${newUser.name}!` };
  };

  const signupCustomer = (data: { name: string; vehicleNumber: string; email: string; phone: string }) => {
    const newUser: User = {
      id: `user_cust_${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'customer',
      vehicleNumber: data.vehicleNumber.toUpperCase(),
      vehicleModel: 'Tata Nexon EV / Mahindra XUV400',
      batteryCapacityKWh: 40.5,
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setAuthModalOpen(false);
    setActiveTab('search');
    return { success: true, message: 'Customer account created successfully!' };
  };

  const signupMerchant = (data: {
    name: string;
    stationName: string;
    address: string;
    area: string;
    city: string;
    timings: string;
    basePricePerKWh: number;
    phone: string;
    email: string;
  }) => {
    const stationId = `stn_${Date.now()}`;
    const newMerchantId = `user_merch_${Date.now()}`;

    const newStation: Station = {
      id: stationId,
      merchantId: newMerchantId,
      merchantName: data.name,
      name: data.stationName,
      address: data.address,
      area: data.area || 'City Central',
      city: data.city || 'Hyderabad',
      lat: 17.44 + (Math.random() * 0.05 - 0.025),
      lng: 78.38 + (Math.random() * 0.05 - 0.025),
      timings: data.timings || '24/7 Open',
      basePricePerKWh: Number(data.basePricePerKWh) || 16.0,
      voltageRating: '400V - 800V DC Fast',
      ports: [
        { id: `p_${Date.now()}_1`, type: 'CCS2 Fast DC', powerKW: 60, voltage: '400V DC', status: 'available', pricePerKWh: Number(data.basePricePerKWh) || 16.0 },
        { id: `p_${Date.now()}_2`, type: 'Type-2 AC', powerKW: 22, voltage: '240V AC', status: 'available', pricePerKWh: (Number(data.basePricePerKWh) || 16.0) - 4 },
      ],
      amenities: ['CCTV Security', 'Restroom', 'Digital Payment', 'Waiting Area'],
      rating: 5.0,
      totalReviews: 1,
      isBusy: false,
      estimatedWaitTimeMins: 0,
      phone: data.phone,
      image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80',
    };

    const newMerchantUser: User = {
      id: newMerchantId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: 'merchant',
      merchantStationId: stationId,
      createdAt: new Date().toISOString(),
    };

    setStations(prev => [newStation, ...prev]);
    setUsers(prev => [newMerchantUser, ...prev]);
    setCurrentUser(newMerchantUser);
    setAuthModalOpen(false);
    setActiveTab('merchant');

    return { success: true, message: `Merchant Station registered! Welcome, ${data.name}` };
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('search');
  };

  const updateProfile = (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updated : u)));
  };

  const updateMerchantStation = (stationId: string, data: Partial<Station>) => {
    setStations(prev =>
      prev.map(stn => (stn.id === stationId ? { ...stn, ...data } : stn))
    );
  };

  const togglePortStatus = (stationId: string, portId: string, status: PortStatus) => {
    setStations(prev =>
      prev.map(stn => {
        if (stn.id !== stationId) return stn;
        const newPorts = stn.ports.map(p => (p.id === portId ? { ...p, status } : p));
        const allBusy = newPorts.every(p => p.status === 'in-use');
        return {
          ...stn,
          ports: newPorts,
          isBusy: allBusy,
          estimatedWaitTimeMins: allBusy ? 15 : 0
        };
      })
    );
  };

  const createBooking = (details: {
    station: Station;
    port: { id: string; type: ChargerType; powerKW: number; voltage: string; pricePerKWh: number };
    unitsKWh: number;
    slotTime: string;
    vehicleNumber: string;
    userName: string;
    userPhone: string;
    userEmail: string;
  }): Booking => {
    const subtotal = Math.round(details.unitsKWh * details.port.pricePerKWh * 100) / 100;
    const convFee = 2.0; // Reduced to ₹2.00
    const tax = Math.round((subtotal + convFee) * 0.05 * 100) / 100;
    const total = Math.round((subtotal + convFee + tax) * 100) / 100;

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      bookingCode: `EV-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: currentUser?.id || 'guest_user',
      userName: details.userName || currentUser?.name || 'EV Driver',
      userEmail: details.userEmail || currentUser?.email || 'driver@evolt.com',
      userPhone: details.userPhone || currentUser?.phone || '+91 98765 43210',
      vehicleNumber: (details.vehicleNumber || currentUser?.vehicleNumber || 'TS 09 EV 1234').toUpperCase(),
      stationId: details.station.id,
      stationName: details.station.name,
      stationAddress: details.station.address,
      stationCity: details.station.city,
      portId: details.port.id,
      portType: details.port.type,
      powerKW: details.port.powerKW,
      unitsKWh: details.unitsKWh,
      voltageSelected: details.port.voltage,
      ratePerKWh: details.port.pricePerKWh,
      energySubtotal: subtotal,
      convenienceFee: convFee,
      taxAmount: tax,
      totalAmount: total,
      status: 'confirmed',
      slotTime: details.slotTime,
      createdAt: new Date().toISOString(),
      paymentMethod: 'UPI_QR',
      paymentRef: `UPI/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}/EVOLT`,
    };

    setActivePaymentBooking(newBooking);
    return newBooking;
  };

  const confirmPaymentAndBooking = (bookingId: string) => {
    if (activePaymentBooking && activePaymentBooking.id === bookingId) {
      setBookings(prev => [activePaymentBooking, ...prev]);
    }
  };

  const cancelBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
  };

  const completeBooking = (bookingId: string) => {
    setBookings(prev =>
      prev.map(b => (b.id === bookingId ? { ...b, status: 'completed' } : b))
    );
  };

  const switchRoleDemo = (role: UserRole) => {
    if (role === 'merchant') {
      const merchant = users.find(u => u.role === 'merchant') || INITIAL_USERS[1];
      setCurrentUser(merchant);
      setActiveTab('merchant');
    } else {
      const customer = users.find(u => u.role === 'customer') || INITIAL_USERS[0];
      setCurrentUser(customer);
      setActiveTab('search');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        stations,
        bookings,
        searchRoute,
        activeTab,
        selectedStationForBooking,
        bookingModalOpen,
        paymentModalOpen,
        activePaymentBooking,
        aiDrawerOpen,
        authModalOpen,
        authModalMode,
        activeFilterCharger,
        maxPriceFilter,
        showOnlyAvailable,
        liveNavigationModalOpen,
        setLiveNavigationModalOpen,
        navigatingTarget,
        startLiveNavigation,
        setCurrentUser,
        setActiveTab,
        setSearchRoute,
        setSelectedStationForBooking,
        setBookingModalOpen,
        setPaymentModalOpen,
        setActivePaymentBooking,
        setAiDrawerOpen,
        setAuthModalOpen,
        setAuthModalMode,
        setActiveFilterCharger,
        setMaxPriceFilter,
        setShowOnlyAvailable,
        login,
        signupCustomer,
        signupMerchant,
        logout,
        updateProfile,
        updateMerchantStation,
        togglePortStatus,
        createBooking,
        confirmPaymentAndBooking,
        cancelBooking,
        completeBooking,
        switchRoleDemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
