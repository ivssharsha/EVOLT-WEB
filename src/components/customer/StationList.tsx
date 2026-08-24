import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Station } from '../../types';
import { 
  Zap, 
  MapPin, 
  Clock, 
  Star, 
  IndianRupee, 
  ShieldCheck, 
  Wifi, 
  AlertCircle, 
  ArrowUpRight, 
  Flame,
  UtensilsCrossed,
  Gamepad2,
  Coffee,
  ShoppingBag,
  Croissant,
  Pizza,
  Sparkles,
  Check,
  Play,
  Navigation
} from 'lucide-react';

// Helper function to format and render customized highlight amenity badges
const renderAmenityBadge = (amenity: string, idx: number) => {
  const lower = amenity.toLowerCase();

  // 1. Kids Playstation / Gaming / Play Area
  if (lower.includes('playstation') || lower.includes('play') || lower.includes('game') || lower.includes('arcade') || lower.includes('kids')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-purple-500/10 hover:bg-purple-500/25 transition-all"
      >
        <Gamepad2 className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 2. Restaurants / Dining
  if (lower.includes('restaurant') || lower.includes('dining') || lower.includes('gourmet') || lower.includes('drive-thru')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-rose-500/10 hover:bg-rose-500/25 transition-all"
      >
        <UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 3. Food Courts
  if (lower.includes('food court') || lower.includes('food')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-300 border border-orange-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-orange-500/10 hover:bg-orange-500/25 transition-all"
      >
        <Pizza className="w-3.5 h-3.5 text-orange-400" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 4. Shopping Mall / Retail
  if (lower.includes('shopping') || lower.includes('mall') || lower.includes('plaza') || lower.includes('retail')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-cyan-500/10 hover:bg-cyan-500/25 transition-all"
      >
        <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 5. Bakeries & Pastries
  if (lower.includes('baker') || lower.includes('bake') || lower.includes('pastry') || lower.includes('confectionery') || lower.includes('sandwich')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-pink-500/15 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-pink-500/10 hover:bg-pink-500/25 transition-all"
      >
        <Croissant className="w-3.5 h-3.5 text-pink-400" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 6. Cafeteria & Coffee
  if (lower.includes('cafe') || lower.includes('cafeteria') || lower.includes('coffee') || lower.includes('espresso')) {
    return (
      <span
        key={idx}
        className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-amber-500/10 hover:bg-amber-500/25 transition-all"
      >
        <Coffee className="w-3.5 h-3.5 text-amber-400" />
        <span>{amenity}</span>
      </span>
    );
  }

  // 7. Standard / WiFi / Security / Lounge
  return (
    <span
      key={idx}
      className="px-2.5 py-1 rounded-xl bg-slate-800/90 text-slate-300 border border-slate-700/70 text-xs font-medium flex items-center gap-1.5"
    >
      {lower.includes('wifi') && <Wifi className="w-3.5 h-3.5 text-cyan-400" />}
      {lower.includes('security') && <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}
      <span>{amenity}</span>
    </span>
  );
};

export const StationList: React.FC<{
  onSelectStationForMap?: (station: Station) => void;
}> = ({ onSelectStationForMap }) => {
  const { 
    stations, 
    activeFilterCharger, 
    maxPriceFilter, 
    showOnlyAvailable,
    setSelectedStationForBooking,
    setBookingModalOpen,
    startLiveNavigation
  } = useApp();

  const [selectedAmenityFilter, setSelectedAmenityFilter] = useState<string>('all');

  // Filter stations based on criteria + amenity filter
  const filteredStations = stations.filter((station) => {
    if (showOnlyAvailable && station.isBusy) return false;
    if (station.basePricePerKWh > maxPriceFilter) return false;
    if (activeFilterCharger !== 'all') {
      const hasPort = station.ports.some(p => p.type === activeFilterCharger);
      if (!hasPort) return false;
    }
    if (selectedAmenityFilter !== 'all') {
      const hasAmenity = station.amenities.some(a => 
        a.toLowerCase().includes(selectedAmenityFilter.toLowerCase())
      );
      if (!hasAmenity) return false;
    }
    return true;
  });

  const handleBookClick = (station: Station) => {
    setSelectedStationForBooking(station);
    setBookingModalOpen(true);
  };

  return (
    <div className="space-y-4">
      
      {/* Header and Lifestyle Amenities Quick Filter Bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-black text-white tracking-tight font-['Space_Grotesk']">
              EV Charging Stations On Your Route
            </h3>
            <p className="text-xs text-slate-400">
              Showing <span className="text-emerald-400 font-bold">{filteredStations.length}</span> verified stations with live socket availability
            </p>
          </div>
        </div>

        {/* Highlighted Amenities Filter Chips */}
        <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Filter by Amenities & Lifestyle while Charging:</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedAmenityFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedAmenityFilter === 'all'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Amenities
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'restaurant' ? 'all' : 'restaurant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'restaurant'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'bg-slate-900 text-rose-300 border border-rose-500/30 hover:bg-rose-500/10'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Restaurants</span>
              {selectedAmenityFilter === 'restaurant' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'play' ? 'all' : 'play')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'play'
                  ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-900 text-purple-300 border border-purple-500/30 hover:bg-purple-500/10'
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Kids Playstations</span>
              {selectedAmenityFilter === 'play' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'cafe' ? 'all' : 'cafe')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'cafe'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-amber-300 border border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Cafeteria</span>
              {selectedAmenityFilter === 'cafe' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'food court' ? 'all' : 'food court')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'food court'
                  ? 'bg-orange-500 text-black shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 text-orange-300 border border-orange-500/30 hover:bg-orange-500/10'
              }`}
            >
              <Pizza className="w-3.5 h-3.5" />
              <span>Food Courts</span>
              {selectedAmenityFilter === 'food court' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'mall' ? 'all' : 'mall')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'mall'
                  ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shopping Malls</span>
              {selectedAmenityFilter === 'mall' && <Check className="w-3 h-3 ml-0.5" />}
            </button>

            <button
              onClick={() => setSelectedAmenityFilter(selectedAmenityFilter === 'bake' ? 'all' : 'bake')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                selectedAmenityFilter === 'bake'
                  ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                  : 'bg-slate-900 text-pink-300 border border-pink-500/30 hover:bg-pink-500/10'
              }`}
            >
              <Croissant className="w-3.5 h-3.5" />
              <span>Bakeries</span>
              {selectedAmenityFilter === 'bake' && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          </div>
        </div>
      </div>

      {filteredStations.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl text-center border border-slate-800">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white mb-1">No charging stations matched your filters</h4>
          <p className="text-xs text-slate-400 mb-4">
            Try adjusting your amenity or price filter to see more stations along this route.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredStations.map((station) => {
            const availablePortsCount = station.ports.filter(p => p.status === 'available').length;
            const totalPortsCount = station.ports.length;
            const hasUltraFast = station.ports.some(p => p.powerKW >= 100);

            return (
              <div
                key={station.id}
                className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all duration-200 hover:border-emerald-500/50 hover:shadow-xl relative overflow-hidden group ${
                  station.isBusy ? 'border-slate-800 bg-slate-900/50' : 'border-slate-800/80 bg-slate-900/70'
                }`}
              >
                {/* Status Ribbon & Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Live Status indicator */}
                    {station.isBusy ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        <span>Busy ({station.estimatedWaitTimeMins} min wait)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        <span>Available ({availablePortsCount}/{totalPortsCount} Free)</span>
                      </span>
                    )}

                    {hasUltraFast && (
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        <Flame className="w-3 h-3 text-purple-400" />
                        <span>Ultra 150kW (800V)</span>
                      </span>
                    )}

                    <span className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{station.rating}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({station.totalReviews})</span>
                    </span>
                  </div>

                  {/* Price Tag */}
                  <div className="text-left sm:text-right">
                    <div className="text-xl font-extrabold text-emerald-400 flex items-center sm:justify-end gap-0.5">
                      <IndianRupee className="w-5 h-5" />
                      <span>{station.basePricePerKWh.toFixed(2)}</span>
                      <span className="text-xs font-medium text-slate-400">/ kWh</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Rate per Unit Charged</div>
                  </div>
                </div>

                {/* Station Info */}
                <div className="mb-4">
                  <h4 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors">
                    {station.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{station.address}, {station.city}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {station.timings}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Verified Host: {station.merchantName}
                    </span>
                  </div>
                </div>

                {/* Charger Types & Voltage Speeds */}
                <div className="mb-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chargers & Voltages at this Station:</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {station.ports.map((port) => (
                      <div
                        key={port.id}
                        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                          port.status === 'available'
                            ? 'bg-slate-900 border-slate-700/80 text-white'
                            : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                        }`}
                      >
                        <div>
                          <div className="font-bold flex items-center gap-1">
                            <span>{port.type}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">({port.powerKW}kW)</span>
                          </div>
                          <div className="text-[10px] text-slate-400">{port.voltage}</div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              port.status === 'available'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {port.status === 'available' ? 'FREE' : 'IN USE'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">₹{port.pricePerKWh}/u</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* HIGHLIGHTED AMENITIES SECTION */}
                <div className="mb-5 p-3.5 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-950/90 border border-slate-800/90">
                  <div className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Station Amenities & Food / Entertainment Highlights:</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {station.amenities.map((amenity, i) => renderAmenityBadge(amenity, i))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-3 border-t border-slate-800/80">
                  <button
                    onClick={() => startLiveNavigation(station)}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-500/10"
                    title="Start Live GPS Navigation with moving cursor"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Navigate</span>
                  </button>

                  {onSelectStationForMap && (
                    <button
                      onClick={() => onSelectStationForMap(station)}
                      className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Map Route</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleBookClick(station)}
                    className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all transform active:scale-[0.99]"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Book Charging Slot</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
