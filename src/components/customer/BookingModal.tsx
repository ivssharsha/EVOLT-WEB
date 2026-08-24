import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Zap, 
  Car, 
  User, 
  Mail, 
  Clock, 
  IndianRupee, 
  Battery, 
  ArrowRight,
  Info,
  Sliders,
  UtensilsCrossed,
  Gamepad2,
  Coffee,
  ShoppingBag,
  Croissant,
  Pizza,
  Sparkles
} from 'lucide-react';

export const BookingModal: React.FC = () => {
  const { 
    currentUser, 
    selectedStationForBooking, 
    bookingModalOpen, 
    setBookingModalOpen,
    setPaymentModalOpen,
    createBooking
  } = useApp();

  const [selectedPortId, setSelectedPortId] = useState<string>('');
  const [unitsKWh, setUnitsKWh] = useState<number>(30);
  const [slotTime, setSlotTime] = useState<string>('Immediate (Arriving in 15 mins)');
  
  // User input fields
  const [userName, setUserName] = useState('');
  const [userVehicleNo, setUserVehicleNo] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');

  // Form error
  const [error, setError] = useState<string | null>(null);

  // Initialize form when station or user changes
  useEffect(() => {
    if (selectedStationForBooking) {
      const firstAvail = selectedStationForBooking.ports.find(p => p.status === 'available') || selectedStationForBooking.ports[0];
      setSelectedPortId(firstAvail ? firstAvail.id : '');
    }
    if (currentUser) {
      setUserName(currentUser.name || '');
      setUserVehicleNo(currentUser.vehicleNumber || 'TS 09 EV 4521');
      setUserEmail(currentUser.email || '');
      setUserPhone(currentUser.phone || '+91 98765 43210');
    }
  }, [selectedStationForBooking, currentUser]);

  if (!bookingModalOpen || !selectedStationForBooking) return null;

  const selectedPort = selectedStationForBooking.ports.find(p => p.id === selectedPortId) || selectedStationForBooking.ports[0];

  // Dynamic Price Calculations
  const rate = selectedPort ? selectedPort.pricePerKWh : selectedStationForBooking.basePricePerKWh;
  const energySubtotal = Math.round(unitsKWh * rate * 100) / 100;
  const convFee = 2.0; // Reduced Station & Cloud Network Fee to ₹2.00
  const gstAmount = Math.round((energySubtotal + convFee) * 0.05 * 100) / 100;
  const totalPayable = Math.round((energySubtotal + convFee + gstAmount) * 100) / 100;

  // Estimated Charging Time: Units (kWh) / Power (kW) * 60 mins
  const chargingTimeMins = selectedPort ? Math.max(12, Math.round((unitsKWh / selectedPort.powerKW) * 60)) : 30;

  // Estimated Range Added: ~6.5 km per kWh
  const rangeAddedKm = Math.round(unitsKWh * 6.8);

  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userVehicleNo || !userEmail) {
      setError('Please fill in your driver details and vehicle number.');
      return;
    }
    if (unitsKWh <= 0) {
      setError('Please enter a valid energy charge requirement (kWh).');
      return;
    }

    // Create booking and trigger payment modal
    createBooking({
      station: selectedStationForBooking,
      port: selectedPort,
      unitsKWh,
      slotTime,
      vehicleNumber: userVehicleNo.toUpperCase(),
      userName,
      userPhone,
      userEmail,
    });

    setBookingModalOpen(false);
    setPaymentModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            setBookingModalOpen(false);
            setError(null);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmitBooking} className="p-6 sm:p-8 space-y-5">
          
          {/* Station Summary Banner */}
          <div className="flex items-start gap-3.5 pb-4 border-b border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-emerald-400 fill-current" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Slot Booking
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {selectedStationForBooking.area}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {selectedStationForBooking.name}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedStationForBooking.address}, {selectedStationForBooking.city}
              </p>
            </div>
          </div>

          {/* Highlighted Amenities at this Station */}
          <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Available Food & Entertainment at this Hub:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              {selectedStationForBooking.amenities.map((amenity, idx) => {
                const lower = amenity.toLowerCase();
                let icon = null;
                let badgeClass = "bg-slate-900 border-slate-700 text-slate-300";
                
                if (lower.includes('restaurant') || lower.includes('dining')) {
                  icon = <UtensilsCrossed className="w-3 h-3 text-rose-400" />;
                  badgeClass = "bg-rose-500/15 border-rose-500/30 text-rose-300";
                } else if (lower.includes('playstation') || lower.includes('play') || lower.includes('kids') || lower.includes('arcade')) {
                  icon = <Gamepad2 className="w-3 h-3 text-purple-400" />;
                  badgeClass = "bg-purple-500/15 border-purple-500/30 text-purple-300";
                } else if (lower.includes('food court') || lower.includes('food')) {
                  icon = <Pizza className="w-3 h-3 text-orange-400" />;
                  badgeClass = "bg-orange-500/15 border-orange-500/30 text-orange-300";
                } else if (lower.includes('shopping') || lower.includes('mall')) {
                  icon = <ShoppingBag className="w-3 h-3 text-cyan-400" />;
                  badgeClass = "bg-cyan-500/15 border-cyan-500/30 text-cyan-300";
                } else if (lower.includes('bake') || lower.includes('pastry')) {
                  icon = <Croissant className="w-3 h-3 text-pink-400" />;
                  badgeClass = "bg-pink-500/15 border-pink-500/30 text-pink-300";
                } else if (lower.includes('cafe') || lower.includes('coffee')) {
                  icon = <Coffee className="w-3 h-3 text-amber-400" />;
                  badgeClass = "bg-amber-500/15 border-amber-500/30 text-amber-300";
                }

                return (
                  <span key={idx} className={`px-2 py-0.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 ${badgeClass}`}>
                    {icon}
                    <span>{amenity}</span>
                  </span>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Choose Port & Voltage */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              1. Select Charger Port & Voltage Speed
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedStationForBooking.ports.map((port) => (
                <button
                  type="button"
                  key={port.id}
                  onClick={() => setSelectedPortId(port.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                    selectedPortId === port.id
                      ? 'bg-emerald-950/30 border-emerald-500 ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{port.type}</span>
                    <span className="text-xs font-extrabold text-emerald-400">
                      ₹{port.pricePerKWh}/kWh
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-mono text-cyan-400 font-semibold">{port.powerKW} kW</span>
                    <span>•</span>
                    <span>{port.voltage}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span
                      className={`font-semibold px-2 py-0.5 rounded ${
                        port.status === 'available'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {port.status === 'available' ? '🟢 Available' : '🟠 Busy'}
                    </span>
                    {selectedPortId === port.id && (
                      <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                        Selected ✓
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Energy Requirement (Units / kWh / Volts) */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Battery className="w-4 h-4 text-emerald-400" />
                2. Energy Required (Units / kWh)
              </label>
              <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                {unitsKWh} kWh Units
              </span>
            </div>

            {/* Quick energy preset buttons */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {[1, 15, 25, 35, 45, 60].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setUnitsKWh(preset)}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all text-center ${
                    unitsKWh === preset
                      ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {preset === 1 ? '⚡ 1 kWh (₹1)' : `${preset} kWh`}
                </button>
              ))}
            </div>

            {/* Slider */}
            <input
              type="range"
              min="1"
              max="90"
              step="1"
              value={unitsKWh}
              onChange={(e) => setUnitsKWh(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />

            {/* Live Estimation Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
              <div className="text-slate-400">
                Est. Charging Duration:{' '}
                <span className="font-bold text-white">~{chargingTimeMins} Minutes</span>
              </div>
              <div className="text-slate-400 text-right">
                Est. Added Range:{' '}
                <span className="font-bold text-emerald-400">+{rangeAddedKm} km</span>
              </div>
            </div>
          </div>

          {/* Section 3: Driver & Vehicle Details (Auto-filled) */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-cyan-400" />
              3. EV Driver & Vehicle Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Driver Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Vehicle Registration Number *
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={userVehicleNo}
                    onChange={(e) => setUserVehicleNo(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Email for Receipt & Pass
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Slot Timing
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Immediate (Arriving in 15 mins)">Immediate (Next 15 mins)</option>
                    <option value="Today, in 30 Mins">Today, in 30 Mins</option>
                    <option value="Today, in 1 Hour">Today, in 1 Hour</option>
                    <option value="Today Evening (18:00 - 19:00)">Today Evening (18:00 - 19:00)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Real-time Price Calculation Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 space-y-2.5">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Real-Time Price Calculation</span>
              <span className="text-[11px] text-emerald-400 font-mono">Dynamic Billing</span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Energy Base ({unitsKWh} units × ₹{rate}/kWh):</span>
                <span className="text-white font-mono">₹{energySubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Station & Cloud Network Fee:</span>
                <span className="text-white font-mono">₹{convFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (5% Green Energy Cess):</span>
                <span className="text-white font-mono">₹{gstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-300 font-semibold">Total Amount Payable</div>
                <div className="text-[10px] text-slate-500">Includes guaranteed slot reserve</div>
              </div>
              <div className="text-2xl font-black text-emerald-400 flex items-center font-['Space_Grotesk']">
                <IndianRupee className="w-6 h-6" />
                <span>{totalPayable.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <span>Proceed to Pay & Generate QR</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
