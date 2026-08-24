import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import L from 'leaflet';
import confetti from 'canvas-confetti';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Gauge, 
  BatteryCharging, 
  CornerUpRight, 
  MapPin, 
  Clock, 
  Car, 
  Bike, 
  Bus, 
  X, 
  ExternalLink,
  Sparkles,
  Zap,
  Navigation
} from 'lucide-react';

export const LiveNavigationModal: React.FC = () => {
  const { 
    liveNavigationModalOpen, 
    setLiveNavigationModalOpen, 
    navigatingTarget, 
    searchRoute,
    stations
  } = useApp();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  type TransportMode = 'car' | 'bike' | 'bus';
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(52);
  const [hasArrived, setHasArrived] = useState(false);

  // Transport details
  const transportConfigs = useMemo(() => ({
    car: { label: 'Car / 4W EV', baseDistance: 28.5, baseMins: 34, baseSpeed: 55, icon: Car, batteryDrain: 15 },
    bike: { label: '2W Scooter EV', baseDistance: 26.2, baseMins: 42, baseSpeed: 38, icon: Bike, batteryDrain: 20 },
    bus: { label: 'Bus / Fleet EV', baseDistance: 31.0, baseMins: 48, baseSpeed: 40, icon: Bus, batteryDrain: 26 },
  }), []);

  const currentConfig = transportConfigs[transportMode];

  // Dynamic values based on travel progress
  const distanceRemaining = Math.max(0, parseFloat((currentConfig.baseDistance * (1 - progressPercent / 100)).toFixed(1)));
  const timeRemainingMins = Math.max(0, Math.ceil(currentConfig.baseMins * (1 - progressPercent / 100)));
  const estimatedArrivalBattery = Math.max(12, 85 - Math.round(currentConfig.batteryDrain * (progressPercent / 100)));

  // Destination coordinates
  const destLat = navigatingTarget?.lat || searchRoute.toCoords?.lat || 17.4504;
  const destLng = navigatingTarget?.lng || searchRoute.toCoords?.lng || 78.3808;
  const destName = navigatingTarget?.name || searchRoute.to || 'EV SuperCharge Station';
  const destAddress = navigatingTarget?.address || 'Near Cyber Towers Main Gate, HITEC City';

  // Origin coordinates
  const fromLat = searchRoute.fromCoords?.lat || 17.4350;
  const fromLng = searchRoute.fromCoords?.lng || 78.3680;
  const fromName = searchRoute.from || 'Current Location';

  // Intermediate route points for smooth animation
  const routePoints: [number, number][] = useMemo(() => [
    [fromLat, fromLng],
    [17.4420, 78.3750], // Junction
    [17.4465, 78.3780], // Expressway entry
    [17.4490, 78.3800], // HITEC corridor
    [destLat, destLng]   // Station
  ], [fromLat, fromLng, destLat, destLng]);

  // Turn-by-turn instruction steps
  const getTurnInstruction = (pct: number) => {
    if (pct < 20) return { text: `Head towards ${destName} via Main Expressway`, dist: '400m', turn: 'straight' };
    if (pct < 50) return { text: 'In 500m, Turn Right onto Cyber Towers Corridor', dist: '500m', turn: 'right' };
    if (pct < 85) return { text: 'Continue straight for 1.2 km on HITEC Road', dist: '1.2 km', turn: 'straight' };
    if (pct < 98) return { text: `In 150m, Station ${destName} will be on your left`, dist: '150m', turn: 'left' };
    return { text: `You have arrived at ${destName}!`, dist: '0m', turn: 'arrived' };
  };

  const currentInstruction = getTurnInstruction(progressPercent);

  // Position interpolation along route points
  const calculateCurrentPosition = (pct: number): [number, number] => {
    if (routePoints.length < 2) return [fromLat, fromLng];
    const totalSegments = routePoints.length - 1;
    const exactIndex = (pct / 100) * totalSegments;
    const segmentIndex = Math.min(totalSegments - 1, Math.floor(exactIndex));
    const segmentProgress = exactIndex - segmentIndex;

    const p1 = routePoints[segmentIndex];
    const p2 = routePoints[segmentIndex + 1];

    const lat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
    const lng = p1[1] + (p2[1] - p1[1]) * segmentProgress;
    return [lat, lng];
  };

  // Real-time animation loop
  useEffect(() => {
    if (!isNavigating || isPaused || hasArrived) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setHasArrived(true);
          setIsNavigating(false);
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.5 },
          });
          return 100;
        }

        // Live speed fluctuation
        const jitter = Math.floor(currentConfig.baseSpeed + (Math.random() * 8 - 4));
        setCurrentSpeed(jitter);

        return Math.min(100, prev + 1.6);
      });
    }, 350);

    return () => clearInterval(interval);
  }, [isNavigating, isPaused, hasArrived, currentConfig.baseSpeed]);

  // Update Moving Vehicle Cursor on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !liveNavigationModalOpen) return;

    const curPos = calculateCurrentPosition(progressPercent);

    if (!vehicleMarkerRef.current) {
      const vehicleIcon = L.divIcon({
        className: 'vehicle-nav-cursor-modal',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(16, 185, 129, 0.4); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 34px; height: 34px; border-radius: 9999px; background: #10b981; border: 3px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2"><path d="M12 2L19 21l-7-4-7 4 7-19z"/></svg>
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker(curPos, { icon: vehicleIcon, zIndexOffset: 1000 }).addTo(map);
      vehicleMarkerRef.current = marker;
    } else {
      vehicleMarkerRef.current.setLatLng(curPos);
    }

    if (isNavigating) {
      map.panTo(curPos, { animate: true, duration: 0.3 });
    }
  }, [progressPercent, isNavigating, liveNavigationModalOpen]);

  // Map Initialization inside modal
  useEffect(() => {
    if (!liveNavigationModalOpen || !mapContainerRef.current) return;

    // Small delay to ensure modal DOM is painted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [(fromLat + destLat) / 2, (fromLng + destLng) / 2],
          zoom: 13,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
          maxZoom: 19,
        }).addTo(map);

        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;
        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;
      const markersGroup = markersGroupRef.current;

      if (!map || !markersGroup) return;

      markersGroup.clearLayers();
      const bounds = L.latLngBounds([]);

      // Start Marker
      const fromLatLng = L.latLng(fromLat, fromLng);
      bounds.extend(fromLatLng);

      const startIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #10b981; color: black; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>📍 START</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      L.marker(fromLatLng, { icon: startIcon }).addTo(markersGroup);

      // Destination Marker
      const toLatLng = L.latLng(destLat, destLng);
      bounds.extend(toLatLng);

      const destIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="background-color: #06b6d4; color: black; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
            <span>⚡ DESTINATION</span>
          </div>
        `,
        iconSize: [110, 30],
        iconAnchor: [55, 15],
      });

      L.marker(toLatLng, { icon: destIcon }).addTo(markersGroup);

      // Route Polyline
      L.polyline(routePoints, {
        color: '#10b981',
        weight: 6,
        opacity: 0.85,
        dashArray: '10, 6',
      }).addTo(markersGroup);

      // Other stations for context
      stations.forEach((stn) => {
        if (stn.lat === destLat && stn.lng === destLng) return;
        const stnIcon = L.divIcon({
          className: 'station-pin-mini',
          html: `<div style="background:#10b981;width:12px;height:12px;border-radius:9999px;border:2px solid white;"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        });
        L.marker([stn.lat, stn.lng], { icon: stnIcon }).addTo(markersGroup);
      });

      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [liveNavigationModalOpen, fromLat, fromLng, destLat, destLng, routePoints, stations]);

  // Clean up on modal close
  const handleClose = () => {
    setIsNavigating(false);
    setIsPaused(false);
    setProgressPercent(0);
    setHasArrived(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersGroupRef.current = null;
      vehicleMarkerRef.current = null;
    }
    setLiveNavigationModalOpen(false);
  };

  const handleStart = () => {
    setIsNavigating(true);
    setIsPaused(false);
    setHasArrived(false);
    setProgressPercent(0);
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleOpenGoogleMapsApp = () => {
    let originQuery = 'Current+Location';
    if (searchRoute.fromCoords?.lat && searchRoute.fromCoords?.lng) {
      originQuery = `${searchRoute.fromCoords.lat},${searchRoute.fromCoords.lng}`;
    }
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQuery)}&destination=${destLat},${destLng}&travelmode=driving&dir_action=navigate`;
    window.open(gmapsUrl, '_blank');
  };

  if (!liveNavigationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[750px] bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* ======================================================== */}
        {/* MODAL HEADER */}
        {/* ======================================================== */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white leading-tight">{destName}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live GPS
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">{destAddress}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Open Google Maps Button */}
            <button
              onClick={handleOpenGoogleMapsApp}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              title="Open Google Maps App"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {/* Close Modal */}
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================================================== */}
        {/* MAP CONTAINER & FLOATING HUD */}
        {/* ======================================================== */}
        <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
          
          {/* Leaflet DOM container */}
          <div ref={mapContainerRef} className="w-full h-full min-h-[300px] z-0"></div>

          {/* Floating Next Turn Instruction Banner */}
          {isNavigating && !hasArrived && (
            <div className="absolute top-3 inset-x-3 sm:inset-x-6 z-[400] bg-emerald-500 text-black px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/50 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                  <CornerUpRight className="w-6 h-6 text-black font-black" />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-black/75">
                    {currentInstruction.dist}
                  </div>
                  <div className="text-sm font-extrabold leading-tight text-black">
                    {currentInstruction.text}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-xl bg-black/15 hover:bg-black/25 text-black transition-colors shrink-0"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Floating Transport Selector (When Idle) */}
          {!isNavigating && !hasArrived && (
            <div className="absolute top-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-700/80 shadow-lg flex items-center gap-1 text-xs">
              {(['car', 'bike', 'bus'] as TransportMode[]).map((mode) => {
                const Icon = transportConfigs[mode].icon;
                return (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      transportMode === mode
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{mode === 'car' ? 'Car (34m)' : mode === 'bike' ? '2-Wheeler (42m)' : 'Bus (48m)'}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Arrival Celebration Card */}
          {hasArrived && (
            <div className="absolute inset-x-4 top-4 z-[400] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-black p-5 rounded-2xl shadow-2xl text-center space-y-2 border-2 border-white animate-in zoom-in duration-200">
              <div className="text-lg font-black flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 fill-current" />
                <span>You Have Arrived at {destName}!</span>
              </div>
              <p className="text-xs font-semibold text-black/85">
                Charging ports are ready. Plug in your vehicle to begin your charging session.
              </p>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-black text-xs shadow-lg"
                >
                  Close & View Booking
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* BOTTOM METRICS & START NAVIGATION CONTROLS */}
        {/* ======================================================== */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3 z-10">
          
          {/* Dynamic Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            
            {/* 1. Travel Time */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Travel Time</div>
                <div className="text-sm font-black text-white font-mono">{timeRemainingMins} Mins</div>
              </div>
            </div>

            {/* 2. Remaining Distance */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Distance Remaining</div>
                <div className="text-sm font-black text-cyan-300 font-mono">{distanceRemaining} KM</div>
              </div>
            </div>

            {/* 3. Live Speed */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
              <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Live Speed</div>
                <div className="text-sm font-black text-amber-300 font-mono">
                  {isNavigating && !isPaused ? `${currentSpeed} km/h` : '0 km/h'}
                </div>
              </div>
            </div>

            {/* 4. Arrival Battery */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2.5">
              <BatteryCharging className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-bold">Battery at Station</div>
                <div className="text-sm font-black text-purple-300 font-mono">~{estimatedArrivalBattery}%</div>
              </div>
            </div>

          </div>

          {/* Progress Line */}
          {isNavigating && (
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          )}

          {/* Start / Pause / Exit Buttons */}
          <div className="flex items-center gap-3">
            
            {!isNavigating ? (
              <button
                onClick={handleStart}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99]"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>START NAVIGATION</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  onClick={handlePauseResume}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-current" /> : <Pause className="w-4 h-4 text-amber-400 fill-current" />}
                  <span>{isPaused ? 'Resume Guidance' : 'Pause Guidance'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsNavigating(false);
                    setIsPaused(false);
                    setProgressPercent(0);
                  }}
                  className="py-3 px-5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              </div>
            )}

            <button
              onClick={handleOpenGoogleMapsApp}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-2 transition-all"
              title="Open Google Maps with navigation mode"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Google Maps App</span>
            </button>

          </div>

        </div>

      </div>
    </div>
  );
};
