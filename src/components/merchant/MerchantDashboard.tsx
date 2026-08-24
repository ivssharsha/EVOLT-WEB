import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Station } from '../../types';
import { 
  Store, 
  Zap, 
  Clock, 
  MapPin, 
  IndianRupee, 
  Save, 
  CheckCircle2, 
  TrendingUp, 
  BatteryCharging, 
  Users, 
  Sliders, 
  ShieldCheck, 
  Activity, 
  Car 
} from 'lucide-react';

export const MerchantDashboard: React.FC = () => {
  const { 
    currentUser, 
    stations, 
    bookings, 
    updateMerchantStation, 
    togglePortStatus,
    completeBooking 
  } = useApp();

  // Find the merchant's station or fallback to primary station
  const station: Station = stations.find(s => s.merchantId === currentUser?.id || s.id === currentUser?.merchantStationId) || stations[0];

  // Station Form States
  const [stationName, setStationName] = useState(station.name);
  const [timings, setTimings] = useState(station.timings);
  const [basePrice, setBasePrice] = useState(station.basePricePerKWh.toString());
  const [address, setAddress] = useState(station.address);
  const [area, setArea] = useState(station.area);
  const [city, setCity] = useState(station.city);
  const [phone, setPhone] = useState(station.phone);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveStationInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateMerchantStation(station.id, {
      name: stationName,
      timings,
      basePricePerKWh: parseFloat(basePrice) || 16.5,
      address,
      area,
      city,
      phone,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Metrics for Merchant Station
  const stationBookings = bookings.filter(b => b.stationId === station.id);
  const totalRevenue = stationBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc, b) => acc + b.totalAmount, 0);
  const totalKWhDispensed = stationBookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed')
    .reduce((acc, b) => acc + b.unitsKWh, 0);
  const activeChargersCount = station.ports.filter(p => p.status === 'in-use').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Merchant Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-cyan-500/20">
            <Store className="w-8 h-8 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Space_Grotesk']">
                {station.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Live Host Hub
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>{station.address}, {station.city}</span>
              <span>•</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Host: {station.merchantName}</span>
            </p>
          </div>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-2.5 rounded-2xl border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Station Grid Status</div>
            <div className={`text-xs font-black ${station.isBusy ? 'text-amber-400' : 'text-emerald-400'}`}>
              {station.isBusy ? '🟠 BUSY (HIGH OCCUPANCY)' : '🟢 ACTIVE & ACCEPTING DRIVERS'}
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Station Revenue</span>
            <IndianRupee className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% this week
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Power Dispensed</span>
            <BatteryCharging className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalKWhDispensed} kWh
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Across all active ports</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Active Connected Sockets</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {activeChargersCount} / {station.ports.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {station.ports.length - activeChargersCount} sockets available now
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>Total Bookings</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {stationBookings.length + 18} Sessions
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">4.9⭐ Driver Satisfaction</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Port & Socket Controller */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Live Port & Socket Availability
                </h3>
                <p className="text-xs text-slate-400">
                  Toggle socket statuses. Changes update customer route search in real-time.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {station.ports.map((port) => (
                <div
                  key={port.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{port.type}</span>
                      <span className="text-xs font-mono text-cyan-400 font-bold">({port.powerKW}kW)</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{port.voltage}</div>
                    <div className="text-xs text-emerald-400 font-mono mt-1 font-bold">
                      ₹{port.pricePerKWh.toFixed(2)} / kWh
                    </div>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => togglePortStatus(station.id, port.id, 'available')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        port.status === 'available'
                          ? 'bg-emerald-500 text-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePortStatus(station.id, port.id, 'in-use')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        port.status === 'in-use'
                          ? 'bg-amber-500 text-black shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      In-Use
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePortStatus(station.id, port.id, 'maintenance')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        port.status === 'maintenance'
                          ? 'bg-slate-700 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Offline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Customer Booking Stream for this Station */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" />
              Incoming Driver Bookings
            </h3>

            {stationBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active bookings currently for this station.</p>
            ) : (
              <div className="space-y-2.5">
                {stationBookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{bk.userName}</span>
                        <span className="font-mono text-emerald-400 font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {bk.vehicleNumber}
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {bk.unitsKWh} kWh ({bk.portType}) • {bk.slotTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-mono font-bold text-white">₹{bk.totalAmount.toFixed(2)}</div>
                        <span className="text-[10px] text-emerald-400">PAID</span>
                      </div>
                      {bk.status === 'confirmed' && (
                        <button
                          onClick={() => completeBooking(bk.id)}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-bold hover:bg-emerald-500/30 transition-all"
                        >
                          Finish
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Station Details Editor */}
        <div className="lg:col-span-6">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  Station Profile & Pricing Settings
                </h3>
                <p className="text-xs text-slate-400">
                  Update timings, unit prices, and location displayed to customers.
                </p>
              </div>
              {savedSuccess && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  Saved!
                </span>
              )}
            </div>

            <form onSubmit={handleSaveStationInfo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Station Public Name
                </label>
                <input
                  type="text"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Operating Timings
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={timings}
                      onChange={(e) => setTimings(e.target.value)}
                      placeholder="e.g. 24/7 Open or 06:00 - 23:00"
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Base Price per Unit (₹/kWh)
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      step="0.5"
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-mono focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Station Landmark / Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Area / District
                  </label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Host Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Station Details & Pricing</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
