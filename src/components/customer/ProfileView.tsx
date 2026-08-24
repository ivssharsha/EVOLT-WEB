import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  User, 
  Car, 
  Mail, 
  Phone, 
  Battery, 
  Zap, 
  Leaf, 
  IndianRupee, 
  Save, 
  CheckCircle2 
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, bookings } = useApp();

  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [email, setEmail] = useState(currentUser?.email || 'rahul.ev@example.com');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98765 43210');
  const [vehicleNumber, setVehicleNumber] = useState(currentUser?.vehicleNumber || 'TS 09 EV 4521');
  const [vehicleModel, setVehicleModel] = useState(currentUser?.vehicleModel || 'Tata Nexon EV Max');
  const [batteryCapacity, setBatteryCapacity] = useState(currentUser?.batteryCapacityKWh || 40.5);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      phone,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleModel,
      batteryCapacityKWh: Number(batteryCapacity),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Calculate environmental and economic impact from bookings
  const totalKWhCharged = bookings.reduce((acc, b) => acc + (b.status === 'completed' || b.status === 'confirmed' ? b.unitsKWh : 0), 0);
  const co2SavedKg = Math.round(totalKWhCharged * 0.82); // ~0.82 kg CO2 saved per kWh vs ICE
  const moneySavedINR = Math.round(totalKWhCharged * 6.5 * 10); // EV vs Petrol cost savings per 100km

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-black font-black text-2xl shadow-xl shadow-emerald-500/20">
            {name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white font-['Space_Grotesk']">{name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Verified EV Pilot
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">{email} • {phone}</p>
          </div>
        </div>

        <div className="bg-slate-900/80 px-4 py-2.5 rounded-2xl border border-slate-800 text-right self-stretch sm:self-auto">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Registered EV Plate</div>
          <div className="text-base font-black text-emerald-400 font-mono tracking-wider">{vehicleNumber}</div>
        </div>
      </div>

      {/* Impact Badges Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">CO₂ Emissions Saved</div>
            <div className="text-lg font-black text-white">{co2SavedKg} kg Green Offset</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Clean Energy Consumed</div>
            <div className="text-lg font-black text-white">{totalKWhCharged} kWh Units</div>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0">
            <IndianRupee className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Est. Fuel Savings vs Petrol</div>
            <div className="text-lg font-black text-emerald-400">₹{moneySavedINR.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
              Vehicle & Contact Preferences
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These details are used to calculate compatible charging voltages and auto-populate bookings.
            </p>
          </div>
          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Saved Successfully!
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Full Driver Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                EV Vehicle Registration Plate *
              </label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                EV Model / Make
              </label>
              <select
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Tata Nexon EV Max">Tata Nexon EV (Max / Prime)</option>
                <option value="Tata Punch EV">Tata Punch.ev</option>
                <option value="Tata Curvv EV">Tata Curvv EV</option>
                <option value="Mahindra XUV400">Mahindra XUV400 EV</option>
                <option value="MG ZS EV">MG ZS EV</option>
                <option value="Hyundai Ioniq 5">Hyundai Ioniq 5 (800V Ultra)</option>
                <option value="Kia EV6">Kia EV6 (800V Ultra)</option>
                <option value="BYD Atto 3 / Seal">BYD Atto 3 / Seal</option>
                <option value="Ola S1 Pro (2-Wheeler)">Ola S1 Pro (2-Wheeler EV)</option>
                <option value="Ather 450X (2-Wheeler)">Ather 450X (2-Wheeler EV)</option>
                <option value="Tesla Model 3 / Y">Tesla Model 3 / Y</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Battery Capacity (kWh)
              </label>
              <div className="relative">
                <Battery className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="0.5"
                  value={batteryCapacity}
                  onChange={(e) => setBatteryCapacity(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save EV Profile Changes</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
