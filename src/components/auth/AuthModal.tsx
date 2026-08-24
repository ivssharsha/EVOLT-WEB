import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Zap, 
  Car, 
  Store, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  Building2, 
  Clock, 
  IndianRupee, 
  MapPin,
  Sparkles
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    authModalOpen, 
    setAuthModalOpen, 
    authModalMode, 
    setAuthModalMode,
    login,
    signupCustomer,
    signupMerchant
  } = useApp();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Customer Signup state
  const [custName, setCustName] = useState('');
  const [custVehicleNo, setCustVehicleNo] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [custConfirmPassword, setCustConfirmPassword] = useState('');

  // Merchant Signup state
  const [merchName, setMerchName] = useState('');
  const [merchStationName, setMerchStationName] = useState('');
  const [merchAddress, setMerchAddress] = useState('');
  const [merchArea, setMerchArea] = useState('');
  const [merchCity, setMerchCity] = useState('Hyderabad');
  const [merchTimings, setMerchTimings] = useState('24/7 Open');
  const [merchPrice, setMerchPrice] = useState('16.50');
  const [merchPhone, setMerchPhone] = useState('');
  const [merchEmail, setMerchEmail] = useState('');
  const [merchPassword, setMerchPassword] = useState('');

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [newPassword, setNewPassword] = useState('');

  // Notifications / status
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!authModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setFeedback({ type: 'error', message: 'Please enter your email/mobile and password.' });
      return;
    }
    const res = login(loginIdentifier, loginPassword);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setAuthModalOpen(false);
        setFeedback(null);
      }, 500);
    }
  };

  const handleCustomerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custVehicleNo || !custEmail || !custPassword) {
      setFeedback({ type: 'error', message: 'Please fill in all required customer details.' });
      return;
    }
    if (custPassword !== custConfirmPassword) {
      setFeedback({ type: 'error', message: 'Passwords do not match! Please check.' });
      return;
    }

    const res = signupCustomer({
      name: custName,
      vehicleNumber: custVehicleNo,
      email: custEmail,
      phone: custPhone || '+91 98765 00000',
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setAuthModalOpen(false);
        setFeedback(null);
      }, 700);
    }
  };

  const handleMerchantSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchName || !merchStationName || !merchAddress || !merchEmail || !merchPassword) {
      setFeedback({ type: 'error', message: 'Please fill in all station information.' });
      return;
    }

    const res = signupMerchant({
      name: merchName,
      stationName: merchStationName,
      address: merchAddress,
      area: merchArea || 'Central District',
      city: merchCity,
      timings: merchTimings,
      basePricePerKWh: parseFloat(merchPrice) || 16.5,
      phone: merchPhone || '+91 91234 56789',
      email: merchEmail,
    });

    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => {
        setAuthModalOpen(false);
        setFeedback(null);
      }, 700);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!forgotIdentifier) {
        setFeedback({ type: 'error', message: 'Enter your registered email or mobile.' });
        return;
      }
      setForgotStep(2);
      setForgotOtp('4829'); // Simulated OTP
      setFeedback({ type: 'success', message: 'Simulated OTP [4829] sent to your device.' });
    } else {
      if (!newPassword || forgotOtp !== '4829') {
        setFeedback({ type: 'error', message: 'Please enter valid OTP and new password.' });
        return;
      }
      setFeedback({ type: 'success', message: 'Password reset successful! You can now log in.' });
      setTimeout(() => {
        setAuthModalMode('login');
        setForgotStep(1);
        setFeedback(null);
      }, 1000);
    }
  };

  // Quick Demo Auto-fills
  const autofillCustomer = () => {
    setLoginIdentifier('rahul.ev@example.com');
    setLoginPassword('evolt123');
  };

  const autofillMerchant = () => {
    setLoginIdentifier('vikram.station@evolt.com');
    setLoginPassword('evolt123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
        
        {/* Header decoration */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"></div>

        {/* Close Button */}
        <button
          onClick={() => {
            setAuthModalOpen(false);
            setFeedback(null);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* Brand Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Zap className="w-6 h-6 text-emerald-400 fill-current" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white font-['Space_Grotesk']">
                E<span className="text-emerald-400">Volt</span> Hub
              </h2>
              <p className="text-xs text-slate-400">Next-Gen EV Smart Charging Ecosystem</p>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div
              className={`mb-4 p-3.5 rounded-xl text-sm flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <X className="w-5 h-5 shrink-0 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* ======================================================== */}
          {/* 1. LOGIN MODE */}
          {/* ======================================================== */}
          {authModalMode === 'login' && (
            <div>
              <div className="mb-5">
                <h3 className="text-xl font-bold text-white">Sign In to EVolt</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Access live route charging stations, instant booking & merchant controls.
                </p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address / Mobile Number
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="e.g. rahul.ev@example.com or 9876543210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthModalMode('forgot_password');
                        setFeedback(null);
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Quick Auto-Fill Buttons for Instant Testing */}
                <div className="pt-1 pb-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>⚡ Quick Demo Logins:</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={autofillCustomer}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-center gap-1.5 font-medium transition-all"
                    >
                      <Car className="w-3.5 h-3.5" /> Customer Account
                    </button>
                    <button
                      type="button"
                      onClick={autofillMerchant}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-xs flex items-center justify-center gap-1.5 font-medium transition-all"
                    >
                      <Store className="w-3.5 h-3.5" /> Merchant Account
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
                >
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Create Account Link */}
              <div className="mt-6 pt-5 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  New to eVolt?{' '}
                  <button
                    onClick={() => {
                      setAuthModalMode('role_select');
                      setFeedback(null);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold underline transition-colors"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. ROLE SELECTION (CUSTOMER vs MERCHANT) */}
          {/* ======================================================== */}
          {authModalMode === 'role_select' && (
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">Join eVolt Ecosystem</h3>
              <p className="text-xs text-slate-400 mb-6">
                Please select how you would like to register with eVolt:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Customer Choice */}
                <button
                  onClick={() => {
                    setAuthModalMode('signup_customer');
                    setFeedback(null);
                  }}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 hover:border-emerald-500/80 hover:bg-emerald-950/20 text-left transition-all duration-200 relative overflow-hidden shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all">
                    <Car className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    Customer (EV Driver)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    Book EV stations along your travel route, check live availability, and pay via instant QR.
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-emerald-400 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Register as Driver</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Merchant Choice */}
                <button
                  onClick={() => {
                    setAuthModalMode('signup_merchant');
                    setFeedback(null);
                  }}
                  className="group p-5 rounded-2xl bg-gradient-to-b from-slate-800/80 to-slate-900 border border-slate-700/80 hover:border-cyan-500/80 hover:bg-cyan-950/20 text-left transition-all duration-200 relative overflow-hidden shadow-lg"
                >
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-cyan-500/20 transition-all">
                    <Store className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                    Merchant (Station Owner)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    List your charging station, set unit prices (₹/kWh), manage operating timings, and track revenue.
                  </p>
                  <div className="mt-3 flex items-center text-xs font-semibold text-cyan-400 gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Register as Host</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>

              <button
                onClick={() => setAuthModalMode('login')}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Already have an account? <span className="text-emerald-400 font-semibold underline">Sign In</span>
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. CUSTOMER REGISTRATION FORM */}
          {/* ======================================================== */}
          {authModalMode === 'signup_customer' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-emerald-400" />
                    Customer Registration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Create your EV driver profile for seamless route booking.
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalMode('role_select')}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Change Role
                </button>
              </div>

              <form onSubmit={handleCustomerSignup} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={custName}
                      onChange={(e) => setCustName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    EV Vehicle Registration Number *
                  </label>
                  <div className="relative">
                    <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={custVehicleNo}
                      onChange={(e) => setCustVehicleNo(e.target.value.toUpperCase())}
                      placeholder="e.g. TS 09 EV 4521 or AP 28 EV 9999"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500 uppercase"
                      required
                    />
                  </div>
                  <span className="text-[10px] text-emerald-400/80 mt-0.5 block">
                    ⚡ Auto-populates during station booking slots
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="email"
                        value={custEmail}
                        onChange={(e) => setCustEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        value={custPhone}
                        onChange={(e) => setCustPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={custPassword}
                        onChange={(e) => setCustPassword(e.target.value)}
                        placeholder="Create password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="password"
                        value={custConfirmPassword}
                        onChange={(e) => setCustConfirmPassword(e.target.value)}
                        placeholder="Confirm password"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Complete Customer Registration</span>
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthModalMode('login')}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 4. MERCHANT REGISTRATION FORM */}
          {/* ======================================================== */}
          {authModalMode === 'signup_merchant' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Store className="w-5 h-5 text-cyan-400" />
                    Merchant Station Registration
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    List your EV Charging Hub on eVolt network.
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalMode('role_select')}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Change Role
                </button>
              </div>

              <form onSubmit={handleMerchantSignup} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Owner / Host Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={merchName}
                        onChange={(e) => setMerchName(e.target.value)}
                        placeholder="e.g. Vikram Reddy"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Charging Station Name *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={merchStationName}
                        onChange={(e) => setMerchStationName(e.target.value)}
                        placeholder="e.g. eVolt FastHub HITEC"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Station Address / Landmark *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={merchAddress}
                      onChange={(e) => setMerchAddress(e.target.value)}
                      placeholder="e.g. Main Gate, Cyber Towers, HITEC City"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Area / Zone
                    </label>
                    <input
                      type="text"
                      value={merchArea}
                      onChange={(e) => setMerchArea(e.target.value)}
                      placeholder="HITEC City"
                      className="w-full px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Operating Hours
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="text"
                        value={merchTimings}
                        onChange={(e) => setMerchTimings(e.target.value)}
                        placeholder="24/7 Open"
                        className="w-full pl-8 pr-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Price / kWh (₹)
                    </label>
                    <div className="relative">
                      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                      <input
                        type="number"
                        step="0.5"
                        value={merchPrice}
                        onChange={(e) => setMerchPrice(e.target.value)}
                        placeholder="16.50"
                        className="w-full pl-8 pr-2 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={merchCity}
                      onChange={(e) => setMerchCity(e.target.value)}
                      placeholder="Hyderabad"
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={merchPhone}
                      onChange={(e) => setMerchPhone(e.target.value)}
                      placeholder="+91 91234 56789"
                      className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={merchEmail}
                    onChange={(e) => setMerchEmail(e.target.value)}
                    placeholder="merchant@evolt.com"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={merchPassword}
                    onChange={(e) => setMerchPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>Launch Merchant Station Hub</span>
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <p className="text-xs text-slate-400">
                  Already registered?{' '}
                  <button
                    onClick={() => setAuthModalMode('login')}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 5. FORGOT PASSWORD FORM */}
          {/* ======================================================== */}
          {authModalMode === 'forgot_password' && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                  Reset Password
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {forgotStep === 1
                    ? 'Enter your registered email or mobile to receive verification code.'
                    : 'Enter the verification OTP and your new password.'}
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                {forgotStep === 1 ? (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Registered Email or Mobile Number
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. rahul.ev@example.com or 9876543210"
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        4-Digit OTP Code
                      </label>
                      <input
                        type="text"
                        value={forgotOtp}
                        onChange={(e) => setForgotOtp(e.target.value)}
                        placeholder="Enter 4829"
                        className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-center text-lg tracking-widest font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all"
                >
                  {forgotStep === 1 ? 'Send Reset OTP' : 'Update & Reset Password'}
                </button>
              </form>

              <div className="mt-4 pt-3 border-t border-slate-800 text-center">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setForgotStep(1);
                    setFeedback(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 underline"
                >
                  Back to Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
