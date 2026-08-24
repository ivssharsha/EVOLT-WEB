import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { RouteSearch } from './components/customer/RouteSearch';
import { StationList } from './components/customer/StationList';
import { BookingModal } from './components/customer/BookingModal';
import { PaymentModal } from './components/customer/PaymentModal';
import { BookingHistory } from './components/customer/BookingHistory';
import { ProfileView } from './components/customer/ProfileView';
import { MapView } from './components/customer/MapView';
import { LiveNavigationModal } from './components/customer/LiveNavigationModal';
import { AIAssistant } from './components/customer/AIAssistant';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import type { Station } from './types';
import { 
  Bot, 
  Zap
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentUser, activeTab, setAiDrawerOpen, setSelectedStationForBooking, setBookingModalOpen } = useApp();
  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [mapSelectedStation, setMapSelectedStation] = useState<Station | null>(null);

  const handleSelectStationForMap = (station: Station) => {
    setMapSelectedStation(station);
    if (viewMode === 'list') {
      setViewMode('split');
    }
  };

  const handleBookStationDirect = (station: Station) => {
    setSelectedStationForBooking(station);
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black">
      
      {/* Global Navbar */}
      <Navbar />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* ======================================================== */}
        {/* 1. ROUTE & STATION DISCOVERY TAB */}
        {/* ======================================================== */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <RouteSearch viewMode={viewMode} setViewMode={setViewMode} />

            {/* Split View (List + Map) */}
            {viewMode === 'split' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <StationList onSelectStationForMap={handleSelectStationForMap} />
                </div>
                <div className="lg:col-span-5 sticky top-24">
                  <MapView 
                    selectedStation={mapSelectedStation} 
                    onBookStation={handleBookStationDirect}
                  />
                </div>
              </div>
            )}

            {/* Full List View */}
            {viewMode === 'list' && (
              <div className="max-w-4xl mx-auto">
                <StationList onSelectStationForMap={handleSelectStationForMap} />
              </div>
            )}

            {/* Full Map View */}
            {viewMode === 'map' && (
              <div className="space-y-6">
                <div className="h-[600px]">
                  <MapView 
                    selectedStation={mapSelectedStation} 
                    onBookStation={handleBookStationDirect}
                  />
                </div>
                <div>
                  <StationList onSelectStationForMap={handleSelectStationForMap} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. BOOKINGS HISTORY TAB */}
        {/* ======================================================== */}
        {activeTab === 'history' && <BookingHistory />}

        {/* ======================================================== */}
        {/* 3. EV DRIVER PROFILE TAB */}
        {/* ======================================================== */}
        {activeTab === 'profile' && <ProfileView />}

        {/* ======================================================== */}
        {/* 4. MERCHANT STATION OWNER PORTAL TAB */}
        {/* ======================================================== */}
        {activeTab === 'merchant' && currentUser?.role === 'merchant' && <MerchantDashboard />}

      </main>

      {/* Floating AI Assistant Trigger Widget */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-2xl shadow-purple-600/40 border border-purple-400/30 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <Bot className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400"></span>
          </div>
          <span className="font-['Space_Grotesk']">Ask Spark AI</span>
          <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-purple-400/20 text-purple-200 border border-purple-400/30 font-extrabold">
            EV Assistant
          </span>
        </button>
      </div>

      {/* Modals & Drawers */}
      <AuthModal />
      <BookingModal />
      <PaymentModal />
      <LiveNavigationModal />
      <AIAssistant />

      {/* Footer */}
      <footer className="w-full bg-[#050811] border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400 fill-current" />
            <span className="font-bold text-slate-300 font-['Space_Grotesk']">EVolt Smart Mobility Network</span>
            <span>• Next-Gen EV Infrastructure</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by 100% Renewable Green Power</span>
            <span>•</span>
            <span className="text-emerald-400 font-mono">Status: All Stations Online</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
