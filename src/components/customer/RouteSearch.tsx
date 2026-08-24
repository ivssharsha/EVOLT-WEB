import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { POPULAR_LOCATIONS } from '../../data/mockData';
import { 
  Navigation, 
  MapPin, 
  LocateFixed, 
  ArrowRightLeft, 
  SlidersHorizontal, 
  Sparkles, 
  Route, 
  Clock, 
  BatteryCharging 
} from 'lucide-react';

export const RouteSearch: React.FC<{
  viewMode: 'split' | 'list' | 'map';
  setViewMode: (mode: 'split' | 'list' | 'map') => void;
}> = ({ viewMode, setViewMode }) => {
  const { 
    searchRoute, 
    setSearchRoute, 
    activeFilterCharger, 
    setActiveFilterCharger,
    maxPriceFilter,
    setMaxPriceFilter,
    showOnlyAvailable,
    setShowOnlyAvailable,
    stations
  } = useApp();

  const [locating, setLocating] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Handle "Use My Location" GPS
  const handleUseMyLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchRoute((prev) => ({
            ...prev,
            from: 'Current Location (GPS: HITEC City Hub)',
            fromCoords: {
              lat: position.coords.latitude || 17.4485,
              lng: position.coords.longitude || 78.3750,
            },
          }));
          setLocating(false);
        },
        (_error) => {
          // Fallback location for demo / when GPS blocked
          setSearchRoute((prev) => ({
            ...prev,
            from: 'Current Location (GPS Live: HITEC City)',
            fromCoords: { lat: 17.4485, lng: 78.3750 },
          }));
          setLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setSearchRoute((prev) => ({
        ...prev,
        from: 'Current Location (GPS: HITEC City)',
        fromCoords: { lat: 17.4485, lng: 78.3750 },
      }));
      setLocating(false);
    }
  };

  // Swap From and Destination
  const handleSwap = () => {
    setSearchRoute((prev) => ({
      from: prev.to,
      fromCoords: prev.toCoords,
      to: prev.from,
      toCoords: prev.fromCoords,
    }));
  };

  // Quick preset selected
  const handleSelectDestinationPreset = (loc: { name: string; lat: number; lng: number }) => {
    setSearchRoute((prev) => ({
      ...prev,
      to: loc.name,
      toCoords: { lat: loc.lat, lng: loc.lng },
    }));
  };

  return (
    <div className="w-full space-y-4">
      {/* Route Finder Card */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Route className="w-4 h-4" />
              <span>Smart EV Highway & City Route Discovery</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-['Space_Grotesk']">
              Plan Your EV Journey & Find Live Stations
            </h2>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-xl p-1 text-xs self-start lg:self-auto">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'split' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Split View (Map + List)
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'list' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stations Grid
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                viewMode === 'map' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Full Map
            </button>
          </div>
        </div>

        {/* Search Input Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
          
          {/* FROM Location */}
          <div className="lg:col-span-5 relative">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30"></span>
                From (Starting Point)
              </span>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="text-emerald-400 hover:text-emerald-300 text-[11px] font-semibold flex items-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/20 transition-all"
              >
                <LocateFixed className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                {locating ? 'Locating...' : 'Use My Location'}
              </button>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                value={searchRoute.from}
                onChange={(e) => setSearchRoute((prev) => ({ ...prev, from: e.target.value }))}
                placeholder="Enter starting point or click 'Use My Location'"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center py-1 lg:py-0">
            <button
              type="button"
              onClick={handleSwap}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all shadow-md active:scale-95"
              title="Swap From and Destination"
            >
              <ArrowRightLeft className="w-4 h-4 rotate-90 lg:rotate-0" />
            </button>
          </div>

          {/* DESTINATION Location */}
          <div className="lg:col-span-6 relative">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-cyan-400/30"></span>
              Destination (Trip End)
            </label>
            <div className="relative">
              <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={searchRoute.to}
                onChange={(e) => setSearchRoute((prev) => ({ ...prev, to: e.target.value }))}
                placeholder="e.g. Rajiv Gandhi International Airport or Gachibowli"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Popular Presets */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/70 flex items-center flex-wrap gap-2 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Quick Destinations:
          </span>
          {POPULAR_LOCATIONS.slice(0, 4).map((loc, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectDestinationPreset(loc)}
              className="px-2.5 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 border border-slate-700/60 text-slate-300 hover:text-white transition-all text-xs"
            >
              {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
            </button>
          ))}

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              showFilters
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters & Voltage</span>
          </button>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Charger Type Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Charger / Port Type
                </label>
                <select
                  value={activeFilterCharger}
                  onChange={(e) => setActiveFilterCharger(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">⚡ All Chargers (Any Voltage)</option>
                  <option value="150kW Ultra-Fast">🔥 150kW Ultra-Fast (800V DC)</option>
                  <option value="CCS2 Fast DC">⚡ CCS2 Fast DC (60kW / 400V)</option>
                  <option value="Type-2 AC">🔌 Type-2 AC (22kW / 240V)</option>
                  <option value="GB/T Fast DC">🔋 GB/T Fast DC</option>
                </select>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>Max Price / kWh</span>
                  <span className="text-emerald-400">₹{maxPriceFilter} / unit</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="30"
                  step="1"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Available Only Toggle */}
              <div className="flex items-center pt-4">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showOnlyAvailable}
                    onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500 accent-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    🟢 Show Available Only (Exclude Busy)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Route Live Metrics Bar */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Route className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Route Distance</div>
              <div className="text-sm font-bold text-white">31.8 km</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Drive ETA</div>
              <div className="text-sm font-bold text-white">~38 Mins</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <BatteryCharging className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-medium">Stations On Route</div>
              <div className="text-sm font-bold text-emerald-400">
                {stations.length} Active Hubs
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
