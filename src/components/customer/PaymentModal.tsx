import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { 
  X, 
  CheckCircle2, 
  IndianRupee, 
  ShieldCheck, 
  Clock, 
  Zap, 
  Sparkles, 
  MapPin, 
  Car, 
  Copy, 
  Check, 
  QrCode, 
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  ExternalLink
} from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { 
    paymentModalOpen, 
    setPaymentModalOpen, 
    activePaymentBooking, 
    confirmPaymentAndBooking,
    setActiveTab,
    stations,
    searchRoute,
    setSearchRoute,
    startLiveNavigation
  } = useApp();

  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedUpiId, setCopiedUpiId] = useState(false);
  const [timeLeft, setTimeLeft] = useState(299); // 5 min countdown
  const [redirectToast, setRedirectToast] = useState<{ app: string; message: string } | null>(null);

  // Timer countdown
  useEffect(() => {
    if (!paymentModalOpen || paymentSuccess) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [paymentModalOpen, paymentSuccess]);

  // Reset states when opening
  useEffect(() => {
    if (paymentModalOpen) {
      setPaymentSuccess(false);
      setTimeLeft(299);
      setRedirectToast(null);
    }
  }, [paymentModalOpen]);

  if (!paymentModalOpen || !activePaymentBooking) return null;

  const isTimedOut = timeLeft <= 0;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  // UPI Payee Configuration for direct crediting
  const PAYEE_UPI_ID = '9032976082@ybl';
  const PAYEE_NAME = 'EVolt Charging Network';

  // UPI payment URI for QR code & Direct Deep-links
  const baseUpiParams = `pa=${PAYEE_UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${activePaymentBooking.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Slot Booking ${activePaymentBooking.bookingCode}`)}`;
  const upiUri = `upi://pay?${baseUpiParams}`;

  const handleSimulateSuccess = () => {
    if (isTimedOut) return;

    // Trigger celebration confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#06b6d4', '#3b82f6', '#f59e0b'],
    });

    confirmPaymentAndBooking(activePaymentBooking.id);
    setPaymentSuccess(true);
  };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(activePaymentBooking.paymentRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText(PAYEE_UPI_ID);
    setCopiedUpiId(true);
    setTimeout(() => setCopiedUpiId(false), 2000);
  };

  const handleRegenerateQR = () => {
    setTimeLeft(299); // Reset to 5 minutes
    setRedirectToast(null);
  };

  const handleTriggerDemoTimeout = () => {
    setTimeLeft(0); // Instantly trigger timeout for testing
  };

  // Launch in-app Live Turn-by-Turn GPS Navigation Modal with real-time START button and moving cursor
  const handleNavigateToStation = () => {
    if (!activePaymentBooking) return;

    // Find destination station coordinates
    const targetStation = stations.find((s) => s.id === activePaymentBooking.stationId);
    const destLat = targetStation?.lat || 17.4504;
    const destLng = targetStation?.lng || 78.3808;

    setPaymentModalOpen(false);

    startLiveNavigation({
      name: activePaymentBooking.stationName,
      address: `${activePaymentBooking.stationAddress}, ${activePaymentBooking.stationCity}`,
      lat: destLat,
      lng: destLng,
    });
  };

  // Direct fetch / launch deep link for specific UPI App
  const handleFetchToApp = (appName: 'googlepay' | 'phonepe' | 'paytm' | 'upi') => {
    if (isTimedOut) return;

    let targetDeepLink = `upi://pay?${baseUpiParams}`;
    let appLabel = 'UPI App';

    if (appName === 'googlepay') {
      targetDeepLink = `tez://upi/pay?${baseUpiParams}`;
      appLabel = 'Google Pay';
    } else if (appName === 'phonepe') {
      targetDeepLink = `phonepe://pay?${baseUpiParams}`;
      appLabel = 'PhonePe';
    } else if (appName === 'paytm') {
      targetDeepLink = `paytmmp://pay?${baseUpiParams}`;
      appLabel = 'Paytm';
    } else {
      targetDeepLink = `upi://pay?${baseUpiParams}`;
      appLabel = 'Default UPI App';
    }

    setRedirectToast({
      app: appLabel,
      message: `Fetching & Redirecting directly to ${appLabel}...`
    });

    // Trigger device deep-link handler
    try {
      window.location.href = targetDeepLink;
    } catch {
      // fallback
      window.location.href = `upi://pay?${baseUpiParams}`;
    }

    // Auto clear toast after 5s
    setTimeout(() => {
      setRedirectToast(null);
    }, 5000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Top bar */}
        <div className={`h-1.5 w-full ${
          paymentSuccess
            ? 'bg-emerald-500'
            : isTimedOut
            ? 'bg-rose-500'
            : 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500'
        }`}></div>

        {/* Close Button */}
        <button
          onClick={() => setPaymentModalOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">

          {/* ======================================================== */}
          {/* STATE 1: SCAN QR & PAY */}
          {/* ======================================================== */}
          {!paymentSuccess ? (
            <div className="space-y-5 text-center">
              
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 inline-flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Instant UPI QR Payment</span>
                </span>
                <h3 className="text-xl font-bold text-white mt-2 font-['Space_Grotesk']">
                  Pay with UPI QR or Direct App
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Scan the QR code or click your UPI app below to open directly
                </p>
              </div>

              {/* Redirect Toast Notice */}
              {redirectToast && (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 flex items-center justify-between animate-in fade-in slide-in-from-top duration-200">
                  <div className="flex items-center gap-2 text-left">
                    <ExternalLink className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                    <span>{redirectToast.message}</span>
                  </div>
                  <button 
                    onClick={() => setRedirectToast(null)}
                    className="text-emerald-400 hover:text-white font-bold text-xs pl-2"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* QR Code Container with Glowing Frame and TIME OUT Overlay Box */}
              <div className="relative flex flex-col items-center justify-center">
                
                <div className={`p-4 bg-white rounded-3xl shadow-2xl transition-all duration-300 relative group ${
                  isTimedOut
                    ? 'border-4 border-rose-500/80 blur-[2px] opacity-40 select-none'
                    : 'shadow-emerald-500/10 border-4 border-slate-800'
                }`}>
                  <QRCodeSVG
                    value={upiUri}
                    size={200}
                    level="H"
                    includeMargin={false}
                    imageSettings={{
                      src: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2310b981'><path d='M13 2L3 14h9l-1 8 10-12h-9l1-8z'/></svg>",
                      x: undefined,
                      y: undefined,
                      height: 32,
                      width: 32,
                      excavate: true,
                    }}
                  />
                  <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-black shadow-md">
                      EVolt Secure Pay
                    </span>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* PROMINENT "TIME OUT" OVERLAY BOX WHEN TIMER EXPIRES */}
                {/* ======================================================== */}
                {isTimedOut && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center p-2 animate-in fade-in zoom-in duration-200">
                    <div className="w-full max-w-[280px] bg-slate-950/95 border-2 border-rose-500 rounded-3xl p-5 shadow-2xl shadow-rose-950/80 backdrop-blur-md text-center space-y-3">
                      
                      <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                        <AlertTriangle className="w-7 h-7 text-rose-400 animate-bounce" />
                      </div>

                      <div>
                        <div className="text-2xl font-black text-rose-400 tracking-wider font-['Space_Grotesk']">
                          TIME OUT
                        </div>
                        <p className="text-[11px] text-slate-300 font-medium mt-1 leading-snug">
                          QR Payment session has expired.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleRegenerateQR}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-extrabold text-xs shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all transform active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Regenerate QR Code</span>
                      </button>

                    </div>
                  </div>
                )}

                {/* Amount to Pay Tag */}
                <div className="mt-6 flex items-center justify-center gap-1 text-3xl font-black text-emerald-400 font-['Space_Grotesk']">
                  <IndianRupee className="w-7 h-7" />
                  <span>{activePaymentBooking.totalAmount.toFixed(2)}</span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  For {activePaymentBooking.unitsKWh} kWh ({activePaymentBooking.portType})
                </div>

                {/* Payee UPI ID badge */}
                <div className="mt-2.5 flex items-center justify-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Crediting to UPI:</span>
                  <button
                    type="button"
                    onClick={handleCopyUpiId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-xs font-mono font-bold text-emerald-300 transition-all"
                    title="Click to copy UPI ID"
                  >
                    <span>{PAYEE_UPI_ID}</span>
                    {copiedUpiId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>
                </div>
              </div>

              {/* Countdown Timer Status Bar */}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {isTimedOut ? (
                  <div className="flex items-center justify-center gap-2 text-xs text-rose-400 bg-rose-500/10 py-2 px-4 rounded-xl border border-rose-500/30 max-w-xs font-bold">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>STATUS: </span>
                    <span className="font-mono uppercase font-black text-rose-400">TIME OUT (00:00)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-xs text-amber-400 bg-amber-500/10 py-2 px-4 rounded-xl border border-amber-500/20 max-w-xs">
                    <Clock className="w-3.5 h-3.5 animate-spin-slow" />
                    <span>QR Expires in: </span>
                    <span className="font-mono font-bold">{formattedTime}</span>
                  </div>
                )}

                {/* Quick Demo Timeout Trigger Button */}
                {!isTimedOut && (
                  <button
                    type="button"
                    onClick={handleTriggerDemoTimeout}
                    className="text-[10px] text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 px-2 py-1.5 rounded-lg transition-colors"
                    title="Click to test TIME OUT box immediately"
                  >
                    ⏰ Test Timeout
                  </button>
                )}
              </div>

              {/* ======================================================== */}
              {/* DIRECT FETCH UPI PAYMENT APPS BUTTONS */}
              {/* ======================================================== */}
              <div className="space-y-2 pt-1 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Direct Fetch to UPI App:</span>
                  </span>
                  <span className="text-[10px] text-emerald-400">Tap to open app directly</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  
                  {/* 1. Google Pay Button */}
                  <button
                    type="button"
                    disabled={isTimedOut}
                    onClick={() => handleFetchToApp('googlepay')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 group shadow-md"
                    title="Fetch directly to Google Pay app"
                  >
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow">
                      {/* Google Multi-Color G Icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-emerald-300">
                      Google Pay
                    </span>
                  </button>

                  {/* 2. PhonePe Button */}
                  <button
                    type="button"
                    disabled={isTimedOut}
                    onClick={() => handleFetchToApp('phonepe')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 hover:border-purple-500/50 flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 group shadow-md"
                    title="Fetch directly to PhonePe app"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#5f259f] flex items-center justify-center shadow text-white font-extrabold text-xs">
                      पे
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-purple-300">
                      PhonePe
                    </span>
                  </button>

                  {/* 3. Paytm Button */}
                  <button
                    type="button"
                    disabled={isTimedOut}
                    onClick={() => handleFetchToApp('paytm')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 hover:border-cyan-500/50 flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 group shadow-md"
                    title="Fetch directly to Paytm app"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#002e6e] flex items-center justify-center shadow text-[#00baf2] font-black text-xs">
                      Pay
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-cyan-300">
                      Paytm
                    </span>
                  </button>

                  {/* 4. BHIM / Other UPI Button */}
                  <button
                    type="button"
                    disabled={isTimedOut}
                    onClick={() => handleFetchToApp('upi')}
                    className="p-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 hover:border-emerald-500/50 flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 group shadow-md"
                    title="Fetch directly to any UPI App"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow text-black font-black text-xs">
                      UPI
                    </div>
                    <span className="text-[11px] font-bold text-white group-hover:text-emerald-300">
                      Any UPI App
                    </span>
                  </button>

                </div>
              </div>

              {/* Simulation / Regenerate button */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                {isTimedOut ? (
                  <button
                    type="button"
                    onClick={handleRegenerateQR}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-black font-extrabold text-sm shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Session Expired — Click to Reload QR</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSimulateSuccess}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-teal-300 text-black font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Simulate Instant Payment Success</span>
                  </button>
                )}
                <p className="text-[11px] text-slate-500">
                  {isTimedOut
                    ? 'Please regenerate the QR code to proceed with payment.'
                    : 'Clicking simulates banking webhook authorization & confirms slot'}
                </p>
              </div>

            </div>
          ) : (
            /* ======================================================== */
            /* STATE 2: PAYMENT SUCCESSFUL & DIGITAL CHARGING PASS */
            /* ======================================================== */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Success Badge */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white font-['Space_Grotesk']">
                  Charging Slot Confirmed!
                </h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Payment Verified • Slot Reserved
                </p>
              </div>

              {/* Digital Charging Pass Card */}
              <div className="p-5 rounded-3xl bg-slate-950/80 border border-emerald-500/30 relative overflow-hidden space-y-4 shadow-xl">
                <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Pass Active
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Booking Code</div>
                    <div className="text-lg font-black text-white font-mono">{activePaymentBooking.bookingCode}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Total Paid</div>
                    <div className="text-lg font-black text-emerald-400 font-mono">₹{activePaymentBooking.totalAmount.toFixed(2)}</div>
                  </div>
                </div>

                {/* Station details */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white">{activePaymentBooking.stationName}</span>
                      <div className="text-[11px] text-slate-400">{activePaymentBooking.stationAddress}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 text-slate-300">
                    <Car className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Vehicle: <strong className="text-white font-mono">{activePaymentBooking.vehicleNumber}</strong> ({activePaymentBooking.userName})</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>Time Slot: <strong className="text-white">{activePaymentBooking.slotTime}</strong></span>
                  </div>
                </div>

                {/* Port & Voltage details badge */}
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Reserved Charger:</span>
                  <span className="font-bold text-emerald-300 font-mono">
                    {activePaymentBooking.portType} ({activePaymentBooking.powerKW}kW)
                  </span>
                </div>

                {/* Scanner pass QR */}
                <div className="pt-2 flex items-center justify-between">
                  <div className="text-[11px] text-slate-400 max-w-[200px]">
                    Show this pass to station scanner or host upon arrival.
                  </div>
                  <div className="p-2 bg-white rounded-xl">
                    <QRCodeSVG value={`EVOLT_PASS:${activePaymentBooking.bookingCode}`} size={56} />
                  </div>
                </div>

                {/* Payment Ref Copy */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Ref: {activePaymentBooking.paymentRef}</span>
                  <button
                    onClick={handleCopyRef}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Next Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setActiveTab('history');
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>View All Bookings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleNavigateToStation}
                  className="py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all transform active:scale-95"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Navigate to Station</span>
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
