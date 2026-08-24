import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Zap, 
  MapPin, 
  History, 
  Store, 
  Bot, 
  LogOut, 
  LogIn, 
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    activeTab, 
    setActiveTab, 
    bookings, 
    logout, 
    setAuthModalOpen, 
    setAuthModalMode,
    setAiDrawerOpen,
    switchRoleDemo
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const activeBookingsCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'charging').length;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('search')}
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-500 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Zap className="w-6 h-6 text-black fill-current animate-pulse" />
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
            </div>
            <div>
              <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent font-['Space_Grotesk']">
                E<span className="text-white">Volt</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                EV Network
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Route & Chargers
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <History className="w-4 h-4" />
              <span>My Bookings</span>
              {activeBookingsCount > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-[11px] font-bold rounded-full bg-emerald-500 text-black">
                  {activeBookingsCount}
                </span>
              )}
            </button>

            {currentUser?.role === 'merchant' && (
              <button
                onClick={() => setActiveTab('merchant')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'merchant'
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Store className="w-4 h-4 text-cyan-400" />
                Merchant Hub
              </button>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="hidden lg:flex items-center gap-3">
            {/* AI Assistant Button */}
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 hover:bg-purple-500/20 text-sm font-semibold transition-all shadow-sm"
            >
              <Bot className="w-4 h-4 text-purple-400 animate-bounce" />
              <span>Spark AI</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                EV Co-pilot
              </span>
            </button>

            {/* Role Demo Quick Switcher (Visible only for Merchant Logins) */}
            {currentUser?.role === 'merchant' && (
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
                <span className="text-slate-500 px-2 font-medium">Demo:</span>
                <button
                  onClick={() => switchRoleDemo('customer')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currentUser?.role === 'customer'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Customer Mode"
                >
                  🚗 Driver
                </button>
                <button
                  onClick={() => switchRoleDemo('merchant')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    currentUser?.role === 'merchant'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Switch to Merchant Station Owner Mode"
                >
                  ⚡ Station Owner
                </button>
              </div>
            )}

            {/* Auth Profile / Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-200 leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center justify-end gap-1">
                    {currentUser.role === 'customer' ? (
                      currentUser.vehicleNumber || 'EV Driver'
                    ) : (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Station Host
                      </span>
                    )}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-sm shadow-md shadow-emerald-500/20 transition-all"
              >
                <LogIn className="w-4 h-4" />
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setAiDrawerOpen(true)}
              className="p-2 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30"
              title="AI Assistant"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-800 space-y-3 bg-[#0a0f1d] px-2 rounded-b-2xl shadow-2xl">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setActiveTab('search');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                  activeTab === 'search' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                Route & Chargers
              </button>

              <button
                onClick={() => {
                  setActiveTab('history');
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-sm font-medium ${
                  activeTab === 'history' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <History className="w-4 h-4 text-emerald-400" />
                  My Bookings
                </span>
                {activeBookingsCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-emerald-500 text-black font-bold rounded-full">
                    {activeBookingsCount}
                  </span>
                )}
              </button>

              {currentUser?.role === 'merchant' && (
                <button
                  onClick={() => {
                    setActiveTab('merchant');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-sm font-medium ${
                    activeTab === 'merchant' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-300'
                  }`}
                >
                  <Store className="w-4 h-4 text-cyan-400" />
                  Merchant Hub
                </button>
              )}
            </div>

            {/* Quick Demo Switch Mobile (Visible only for Merchant Logins) */}
            {currentUser?.role === 'merchant' && (
              <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 font-medium">Quick Role Switch:</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      switchRoleDemo('customer');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg ${
                      currentUser?.role === 'customer' ? 'bg-emerald-500 text-black font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => {
                      switchRoleDemo('merchant');
                      setMobileMenuOpen(false);
                    }}
                    className={`px-3 py-1 rounded-lg ${
                      currentUser?.role === 'merchant' ? 'bg-cyan-500 text-black font-bold' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Merchant
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Auth button */}
            {currentUser ? (
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div>
                  <div className="text-sm font-bold text-slate-200">{currentUser.name}</div>
                  <div className="text-xs text-emerald-400 font-mono">{currentUser.vehicleNumber || currentUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-500 text-black font-bold rounded-xl text-center"
              >
                Login / Register
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
