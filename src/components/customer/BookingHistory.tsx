import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { Booking } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  History, 
  Zap, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  QrCode, 
  Ban, 
  Download, 
  X,
  Play,
  Navigation
} from 'lucide-react';

export const BookingHistory: React.FC = () => {
  const { bookings, currentUser, cancelBooking, completeBooking, setActiveTab, stations, searchRoute, setSearchRoute, startLiveNavigation } = useApp();
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
  const [viewPassBooking, setViewPassBooking] = useState<Booking | null>(null);
  const [viewInvoiceBooking, setViewInvoiceBooking] = useState<Booking | null>(null);

  // Navigate to station with in-app Live Turn-by-Turn GPS and START button
  const handleNavigateToStation = (booking: Booking) => {
    const targetStation = stations.find((s) => s.id === booking.stationId);
    const destLat = targetStation?.lat || 17.4504;
    const destLng = targetStation?.lng || 78.3808;

    startLiveNavigation({
      name: booking.stationName,
      address: `${booking.stationAddress}, ${booking.stationCity}`,
      lat: destLat,
      lng: destLng,
    });

    setViewPassBooking(null);
    setViewInvoiceBooking(null);
  };

  // Filter for current user (or show all in demo)
  const userBookings = bookings.filter((b) => {
    if (currentUser && currentUser.role === 'customer') {
      return b.userId === currentUser.id || b.userEmail === currentUser.email || true; // Show demo items too for rich experience
    }
    return true;
  });

  const filtered = userBookings.filter((b) => {
    if (filterTab === 'active') return b.status === 'confirmed' || b.status === 'charging';
    if (filterTab === 'completed') return b.status === 'completed';
    if (filterTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Driver Charging History & Passes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-['Space_Grotesk']">
            Your EV Charging Bookings
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access active passes, payment receipts, and past charging records.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-2xl p-1 text-xs self-start sm:self-auto">
          {(['all', 'active', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[11px] transition-all ${
                filterTab === tab
                  ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white mb-1">No bookings in this category</h3>
          <p className="text-xs text-slate-400 mb-5">
            Discover charging stations along your route and reserve a fast slot now.
          </p>
          <button
            onClick={() => setActiveTab('search')}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Find Stations Along Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((booking) => {
            const isActive = booking.status === 'confirmed' || booking.status === 'charging';

            return (
              <div
                key={booking.id}
                className={`glass-panel p-5 sm:p-6 rounded-3xl border transition-all duration-200 ${
                  isActive
                    ? 'border-emerald-500/40 bg-slate-900/80 shadow-lg shadow-emerald-500/5'
                    : 'border-slate-800/80 bg-slate-900/60'
                }`}
              >
                {/* Top Status and Code */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                      {booking.bookingCode}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Status Badge */}
                  {booking.status === 'confirmed' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      Slot Confirmed
                    </span>
                  )}
                  {booking.status === 'charging' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400 animate-bounce" />
                      Charging Active
                    </span>
                  )}
                  {booking.status === 'completed' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Completed
                    </span>
                  )}
                  {booking.status === 'cancelled' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-rose-400" />
                      Cancelled
                    </span>
                  )}
                </div>

                {/* Station Info */}
                <div className="py-3 space-y-1">
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{booking.stationName}</span>
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 pl-6">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{booking.stationAddress}, {booking.stationCity}</span>
                  </p>
                </div>

                {/* Energy & Vehicle Spec Card */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Energy / Charger</div>
                    <div className="font-bold text-white font-mono mt-0.5">
                      {booking.unitsKWh} kWh ({booking.portType})
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">EV Vehicle Number</div>
                    <div className="font-bold text-emerald-400 font-mono mt-0.5">
                      {booking.vehicleNumber}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Slot Window</div>
                    <div className="text-slate-300 font-medium mt-0.5">{booking.slotTime}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Amount Paid</div>
                    <div className="font-extrabold text-emerald-400 font-mono mt-0.5 flex items-center">
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>{booking.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  {/* Live Navigation with START */}
                  {isActive && (
                    <button
                      onClick={() => handleNavigateToStation(booking)}
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all transform active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Navigation</span>
                    </button>
                  )}

                  {/* View QR Pass */}
                  <button
                    onClick={() => setViewPassBooking(booking)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Station Pass QR</span>
                  </button>

                  {/* View Invoice */}
                  <button
                    onClick={() => setViewInvoiceBooking(booking)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all"
                    title="View Invoice Receipt"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* If active, complete or cancel options */}
                  {isActive && (
                    <>
                      <button
                        onClick={() => completeBooking(booking.id)}
                        className="py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
                        title="Simulate session completion"
                      >
                        Finish
                      </button>
                      <button
                        onClick={() => cancelBooking(booking.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all"
                        title="Cancel Booking"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* PASS MODAL POPUP */}
      {/* ======================================================== */}
      {viewPassBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewPassBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Official EV Station Pass
              </span>
              <h3 className="text-lg font-bold text-white mt-1.5">{viewPassBooking.stationName}</h3>
              <p className="text-xs font-mono text-emerald-400 mt-0.5 font-bold">
                {viewPassBooking.bookingCode}
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl mx-auto inline-block shadow-lg">
              <QRCodeSVG value={`EVOLT_STATION_PASS:${viewPassBooking.bookingCode}`} size={160} />
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-left space-y-1">
              <div className="text-slate-400">Vehicle: <strong className="text-white font-mono">{viewPassBooking.vehicleNumber}</strong></div>
              <div className="text-slate-400">Energy: <strong className="text-white">{viewPassBooking.unitsKWh} kWh ({viewPassBooking.portType})</strong></div>
              <div className="text-slate-400">Slot: <strong className="text-white">{viewPassBooking.slotTime}</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setViewPassBooking(null)}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleNavigateToStation(viewPassBooking)}
                className="py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Navigate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* INVOICE MODAL POPUP */}
      {/* ======================================================== */}
      {viewInvoiceBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewInvoiceBooking(null)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-emerald-400 fill-current" />
                <div>
                  <h3 className="text-lg font-black text-white">eVolt Tax Invoice</h3>
                  <p className="text-[10px] text-slate-400">GSTIN: 36AAECE1234F1Z8</p>
                </div>
              </div>
              <div className="text-right font-mono text-xs text-slate-300">
                <div>#{viewInvoiceBooking.bookingCode}</div>
                <div className="text-[10px] text-slate-500">PAID via UPI</div>
              </div>
            </div>

            <div className="text-xs space-y-2 py-2">
              <div className="flex justify-between text-slate-400">
                <span>Customer Name:</span>
                <span className="text-white font-semibold">{viewInvoiceBooking.userName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Vehicle Number:</span>
                <span className="text-emerald-400 font-mono font-bold">{viewInvoiceBooking.vehicleNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Station:</span>
                <span className="text-white font-medium">{viewInvoiceBooking.stationName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Units Charged:</span>
                <span className="text-white font-mono">{viewInvoiceBooking.unitsKWh} kWh @ ₹{viewInvoiceBooking.ratePerKWh}/u</span>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Energy Base Charge:</span>
                <span className="font-mono text-white">₹{viewInvoiceBooking.energySubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform & Network Fee:</span>
                <span className="font-mono text-white">₹{viewInvoiceBooking.convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GST (5% Green Mobility):</span>
                <span className="font-mono text-white">₹{viewInvoiceBooking.taxAmount.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-white">Total Amount Paid:</span>
                <span className="text-emerald-400 font-mono">₹{viewInvoiceBooking.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center">
              Payment Reference: {viewInvoiceBooking.paymentRef}
            </div>

            <button
              onClick={() => {
                alert('Receipt downloaded to device storage.');
                setViewInvoiceBooking(null);
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Digital Receipt PDF</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
