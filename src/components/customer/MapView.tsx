import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import type { Station } from '../../types';
import L from 'leaflet';
import { 
  Navigation, 
  Compass, 
  Car, 
  Bike, 
  Bus, 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  Gauge, 
  BatteryCharging, 
  CornerUpRight, 
  ExternalLink,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';

export const MapView: React.FC<{
  selectedStation?: Station | null;
  onBookStation?: (station: Station) => void;
}> = ({ selectedStation, onBookStation }) => {
  const { searchRoute, stations, setSelectedStationForBooking, setBookingModalOpen } = useApp();
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const vehicleMarkerRef = useRef<L.Marker | null>(null);

  // Navigation and Real-Time Transport Mode States
  type TransportMode = 'car' | 'bike' | 'bus';
  const [transportMode, setTransportMode] = useState<TransportMode>('car');
  const [isNavigating, setIsNavigating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [progressPercent, setProgressPercent] = useState(0); // 0 to 100
  const [currentSpeed, setCurrentSpeed] = useState(48); // km/h
  const [voiceAnnouncement, setVoiceAnnouncement] = useState<string>('');
  const [hasArrived, setHasArrived] = useState(false);

  // Transport details configuration
  const transportConfigs = useMemo(() => ({
    car: { label: 'Car / 4W EV', baseDistance: 31.8, baseMins: 38, baseSpeed: 52, icon: Car, batteryDrain: 16 },
    bike: { label: '2W Scooter EV', baseDistance: 29.2, baseMins: 45, baseSpeed: 38, icon: Bike, batteryDrain: 22 },
    bus: { label: 'Bus / Fleet EV', baseDistance: 33.5, baseMins: 52, baseSpeed: 42, icon: Bus, batteryDrain: 28 },
  }), []);

  const currentConfig = transportConfigs[transportMode];

  // Dynamic real-time calculations based on progress
  const distanceRemaining = Math.max(0, parseFloat((currentConfig.baseDistance * (1 - progressPercent / 100)).toFixed(1)));
  const timeRemainingMins = Math.max(0, Math.ceil(currentConfig.baseMins * (1 - progressPercent / 100)));
  const estimatedArrivalBattery = Math.max(15, 82 - Math.round(currentConfig.batteryDrain * (progressPercent / 100)));

  // Waypoints for the route
  const fromLat = searchRoute.fromCoords?.lat || 17.4504;
  const fromLng = searchRoute.fromCoords?.lng || 78.3808;
  const toLat = searchRoute.toCoords?.lat || (selectedStation ? selectedStation.lat : 17.2403);
  const toLng = searchRoute.toCoords?.lng || (selectedStation ? selectedStation.lng : 78.4294);

  // Intermediate route coordinates polyline
  const routePoints: [number, number][] = useMemo(() => [
    [fromLat, fromLng],
    [17.4420, 78.3750], // Cyber Towers exit
    [17.4350, 78.3680], // Gachibowli junction
    [17.4162, 78.3448], // Financial District WaveRock
    [17.3600, 78.3650], // ORR Toll Plaza
    [17.3100, 78.3900], // ORR South Express
    [17.2600, 78.4150], // Shamshabad approach
    [toLat, toLng]       // Destination
  ], [fromLat, fromLng, toLat, toLng]);

  // Turn by turn instructions based on progress
  const getTurnInstruction = (pct: number) => {
    if (pct < 15) return { text: 'Head south on Cyber Towers Rd towards HITEC Junction', dist: '350m' };
    if (pct < 35) return { text: 'In 600m, Turn Right onto Gachibowli Main Expressway', dist: '600m' };
    if (pct < 60) return { text: 'Merge onto Outer Ring Road (ORR) Toll-way Exit 16', dist: '2.4 km' };
    if (pct < 85) return { text: 'Continue straight on ORR Express for 12 km towards Airport', dist: '12 km' };
    if (pct < 98) return { text: 'In 300m, Take the exit towards eVolt SuperCharge Hub', dist: '300m' };
    return { text: 'You have arrived at your destination!', dist: '0m' };
  };

  const currentInstruction = getTurnInstruction(progressPercent);

  // Real-time GPS Vehicle Cursor Animation Simulation
  useEffect(() => {
    if (!isNavigating || isPaused || hasArrived) return;

    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          setHasArrived(true);
          setIsNavigating(false);
          setVoiceAnnouncement('You have arrived at your destination EV charging station.');
          return 100;
        }
        
        // Random speed fluctuations between 40 - 65 km/h
        const jitterSpeed = Math.floor(currentConfig.baseSpeed + (Math.random() * 10 - 5));
        setCurrentSpeed(jitterSpeed);

        return Math.min(100, prev + 1.2);
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isNavigating, isPaused, hasArrived, currentConfig.baseSpeed]);

  // Helper to interpolate coordinate along routePoints
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

  // Update Moving Vehicle Cursor on Leaflet Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const curPos = calculateCurrentPosition(progressPercent);

    // Create or update vehicle cursor marker
    if (!vehicleMarkerRef.current) {
      const vehicleIcon = L.divIcon({
        className: 'vehicle-nav-cursor',
        html: `
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 40px; height: 40px; border-radius: 9999px; background: rgba(16, 185, 129, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="width: 32px; height: 32px; border-radius: 9999px; background: #10b981; border: 3px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 10;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="black" stroke="black" stroke-width="2"><path d="M12 2L19 21l-7-4-7 4 7-19z"/></svg>
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

    // If navigating, pan smoothly to keep cursor centered
    if (isNavigating) {
      map.panTo(curPos, { animate: true, duration: 0.3 });
    }
  }, [progressPercent, isNavigating]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [17.3850, 78.4867],
        zoom: 11,
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

    // 1. Origin Marker
    const fromLatLng = L.latLng(fromLat, fromLng);
    bounds.extend(fromLatLng);

    const fromIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #10b981; color: black; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>📍 START: ${searchRoute.from.split(' ')[0]}</span>
        </div>
      `,
      iconSize: [110, 30],
      iconAnchor: [55, 15],
    });

    L.marker(fromLatLng, { icon: fromIcon })
      .addTo(markersGroup)
      .bindPopup(`<b>Start Point:</b><br>${searchRoute.from}`);

    // 2. Destination Marker
    const toLatLng = L.latLng(toLat, toLng);
    bounds.extend(toLatLng);

    const toIcon = L.divIcon({
      className: 'custom-map-icon',
      html: `
        <div style="background-color: #06b6d4; color: black; font-weight: 800; font-size: 11px; padding: 4px 8px; border-radius: 9999px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.5); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>🏁 DESTINATION: ${searchRoute.to.split(' ')[0]}</span>
        </div>
      `,
      iconSize: [120, 30],
      iconAnchor: [60, 15],
    });

    L.marker(toLatLng, { icon: toIcon })
      .addTo(markersGroup)
      .bindPopup(`<b>Destination:</b><br>${searchRoute.to}`);

    // 3. Draw Route Polyline
    L.polyline(routePoints, {
      color: '#10b981',
      weight: 6,
      opacity: 0.85,
      dashArray: '10, 6',
    }).addTo(markersGroup);

    // 4. EV Station Markers
    stations.forEach((stn) => {
      const stnLatLng = L.latLng(stn.lat, stn.lng);
      bounds.extend(stnLatLng);

      const isSelected = selectedStation?.id === stn.id;
      const markerBg = isSelected ? '#3b82f6' : stn.isBusy ? '#f59e0b' : '#10b981';

      const stationIcon = L.divIcon({
        className: 'station-pin-icon',
        html: `
          <div style="background-color: ${markerBg}; color: black; padding: 6px; border-radius: 14px; border: 2px solid white; box-shadow: 0 4px 16px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; cursor: pointer; transition: transform 0.2s;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="black" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const freePorts = stn.ports.filter(p => p.status === 'available').length;
      const marker = L.marker(stnLatLng, { icon: stationIcon }).addTo(markersGroup);

      const amenityTagsHtml = stn.amenities.slice(0, 3).map(a => {
        let emoji = '⚡';
        if (a.toLowerCase().includes('restaurant')) emoji = '🍽️';
        if (a.toLowerCase().includes('playstation') || a.toLowerCase().includes('play')) emoji = '🎮';
        if (a.toLowerCase().includes('food court')) emoji = '🍕';
        if (a.toLowerCase().includes('mall') || a.toLowerCase().includes('shopping')) emoji = '🛍️';
        if (a.toLowerCase().includes('baker')) emoji = '🥐';
        if (a.toLowerCase().includes('cafe') || a.toLowerCase().includes('coffee')) emoji = '☕';
        return `<span style="background: #f3f4f6; color: #1f2937; padding: 2px 6px; border-radius: 6px; font-size: 10px; font-weight: 600; display: inline-flex; align-items: center; gap: 2px; margin-right: 4px; margin-bottom: 4px;">${emoji} ${a}</span>`;
      }).join('');

      const popupContent = document.createElement('div');
      popupContent.className = 'p-2 text-slate-900 font-sans';
      popupContent.innerHTML = `
        <div style="font-weight: 800; font-size: 13px; margin-bottom: 2px;">${stn.name}</div>
        <div style="font-size: 11px; color: #4b5563; margin-bottom: 4px;">${stn.address}</div>
        <div style="margin-bottom: 6px; display: flex; flex-wrap: wrap;">${amenityTagsHtml}</div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 8px;">
          <span style="font-weight: bold; color: ${stn.isBusy ? '#b45309' : '#047857'};">
            ${stn.isBusy ? '🟠 Busy (~15 min wait)' : `🟢 ${freePorts} Ports Free`}
          </span>
          <span style="font-weight: 800; color: #047857;">₹${stn.basePricePerKWh}/kWh</span>
        </div>
        <button id="btn-book-${stn.id}" style="width: 100%; background: #10b981; color: black; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; font-size: 11px; cursor: pointer;">
          ⚡ Book This Station
        </button>
      `;

      marker.bindPopup(popupContent);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-book-${stn.id}`);
        if (btn) {
          btn.onclick = () => {
            if (onBookStation) {
              onBookStation(stn);
            } else {
              setSelectedStationForBooking(stn);
              setBookingModalOpen(true);
            }
          };
        }
      });
    });

    if (bounds.isValid() && !isNavigating) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }

  }, [fromLat, fromLng, toLat, toLng, searchRoute, stations, selectedStation, onBookStation, setBookingModalOpen, setSelectedStationForBooking, routePoints, isNavigating]);

  // Actions for Navigation Controls
  const handleStartNavigation = () => {
    setIsNavigating(true);
    setIsPaused(false);
    setHasArrived(false);
    setProgressPercent(0);
    setVoiceAnnouncement('Starting live GPS navigation. Head south towards your EV charging route.');
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setIsPaused(false);
    setProgressPercent(0);
    setHasArrived(false);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([fromLat, fromLng], 12);
    }
  };

  // Launch Google Maps Official App with direct turn-by-turn navigation
  const handleOpenGoogleMapsApp = () => {
    let originQuery = 'Current+Location';
    if (searchRoute.fromCoords?.lat && searchRoute.fromCoords?.lng) {
      originQuery = `${searchRoute.fromCoords.lat},${searchRoute.fromCoords.lng}`;
    }
    const gmapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originQuery)}&destination=${toLat},${toLng}&travelmode=driving&dir_action=navigate`;
    window.open(gmapsUrl, '_blank');
  };

  return (
    <div className="w-full h-full min-h-[480px] rounded-3xl overflow-hidden glass-panel border border-slate-800 relative shadow-2xl flex flex-col">
      
      {/* ======================================================== */}
      {/* 1. TOP FLOATING NAVIGATION HUD & INSTRUCTION BANNER */}
      {/* ======================================================== */}
      <div className="absolute top-4 inset-x-4 z-[400] space-y-2 pointer-events-none">
        
        {/* Navigation Step Banner (When Live Navigation is Active) */}
        {isNavigating && !hasArrived && (
          <div className="pointer-events-auto bg-emerald-600 text-black px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border-2 border-white/40 animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/20 flex items-center justify-center shrink-0">
                <CornerUpRight className="w-6 h-6 text-black" />
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
              title={soundEnabled ? 'Mute Voice' : 'Enable Voice'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        )}

        {/* Arrival Celebration Card */}
        {hasArrived && (
          <div className="pointer-events-auto bg-gradient-to-r from-emerald-500 to-teal-400 text-black p-4 rounded-2xl shadow-2xl text-center space-y-2 border-2 border-white animate-in zoom-in duration-200">
            <div className="text-lg font-black flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 fill-current" />
              <span>You Have Arrived at Destination!</span>
            </div>
            <p className="text-xs font-semibold text-black/80">
              Station is on your right. Ready to plug in and charge your EV.
            </p>
            <button
              onClick={handleStopNavigation}
              className="px-4 py-2 rounded-xl bg-black text-white font-bold text-xs"
            >
              Exit Navigation
            </button>
          </div>
        )}

        {/* Non-navigating Header: Transport Mode Selector & GPS Grid Indicator */}
        {!isNavigating && (
          <div className="pointer-events-auto flex items-center justify-between gap-2 flex-wrap bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-lg text-xs">
            
            {/* Live EV Grid Status */}
            <div className="flex items-center gap-2 px-2 py-1 font-bold text-white">
              <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span className="hidden sm:inline">Live EV Navigation Map</span>
            </div>

            {/* Transport Mode Switcher Chips */}
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {(['car', 'bike', 'bus'] as TransportMode[]).map((mode) => {
                const Icon = transportConfigs[mode].icon;
                return (
                  <button
                    key={mode}
                    onClick={() => setTransportMode(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      transportMode === mode
                        ? 'bg-emerald-500 text-black shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title={transportConfigs[mode].label}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">{mode === 'car' ? 'Car' : mode === 'bike' ? '2-Wheeler' : 'Bus'}</span>
                  </button>
                );
              })}
            </div>

            {/* Google Maps External Quick Link */}
            <button
              onClick={handleOpenGoogleMapsApp}
              className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1 text-[11px] font-semibold transition-all"
              title="Open direct turn-by-turn navigation in Google Maps"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3 h-3 text-cyan-400" />
            </button>
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 2. LEAFLET DOM MAP CONTAINER */}
      {/* ======================================================== */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px] flex-1 z-0"></div>

      {/* ======================================================== */}
      {/* 3. BOTTOM REAL-TIME NAVIGATION HUD & LIVE METRICS */}
      {/* ======================================================== */}
      <div className="p-4 bg-slate-900/95 border-t border-slate-800 z-[400] space-y-3">
        
        {/* Real-time Distance, ETA, Battery & Speed Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          
          {/* 1. Real-time ETA */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Travel Time</div>
              <div className="text-sm font-black text-white font-mono">{timeRemainingMins} Mins</div>
            </div>
          </div>

          {/* 2. Real-time Distance */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Remaining Distance</div>
              <div className="text-sm font-black text-cyan-300 font-mono">{distanceRemaining} KM</div>
            </div>
          </div>

          {/* 3. Real-time Moving Speed */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <Gauge className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">GPS Speed</div>
              <div className="text-sm font-black text-amber-300 font-mono">
                {isNavigating && !isPaused ? `${currentSpeed} km/h` : '0 km/h'}
              </div>
            </div>
          </div>

          {/* 4. Est. Battery at Arrival */}
          <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-2.5">
            <BatteryCharging className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-bold">Arrival Battery</div>
              <div className="text-sm font-black text-purple-300 font-mono">~{estimatedArrivalBattery}%</div>
            </div>
          </div>

        </div>

        {/* Progress bar when navigating */}
        {isNavigating && (
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        )}

        {/* Action Controls: START / PAUSE / RESUME / STOP */}
        <div className="flex items-center gap-3">
          
          {!isNavigating ? (
            <button
              onClick={handleStartNavigation}
              className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START NAVIGATION</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={handlePauseResume}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-current" /> : <Pause className="w-4 h-4 text-amber-400 fill-current" />}
                <span>{isPaused ? 'Resume Navigation' : 'Pause Navigation'}</span>
              </button>

              <button
                onClick={handleStopNavigation}
                className="py-3 px-5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Exit</span>
              </button>
            </div>
          )}

          {/* Google Maps Instant Intent Navigation */}
          <button
            onClick={handleOpenGoogleMapsApp}
            className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            title="Open in Google Maps App with voice navigation"
          >
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Open Maps App</span>
          </button>

        </div>

      </div>

    </div>
  );
};
