import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { AIMessage } from '../../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  ArrowRight
} from 'lucide-react';

const INITIAL_AI_MESSAGES: AIMessage[] = [
  {
    id: 'msg_1',
    sender: 'ai',
    text: `⚡ **Hello! I'm Spark AI**, your intelligent eVolt Co-Pilot.\n\nI can help you with:\n• **Route Battery Estimation** (e.g., "Can I reach Airport from HITEC with 30% battery?")\n• **Finding Fastest & Cheapest Chargers** along your current route\n• **Voltage & Connector Guidance** (800V DC vs 400V vs 240V AC)\n• Telugu / English EV assistance!\n\nHow can I help your journey today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickActions: [
      { label: '⚡ Fastest 150kW Charger on route', action: 'find_fastest' },
      { label: '🔋 Will my battery reach Airport?', action: 'battery_check' },
      { label: '💰 Cost to charge 35 kWh', action: 'calc_cost' },
      { label: '🇮🇳 Telugu: Route lo best station enti?', action: 'telugu_recommend' },
    ]
  }
];

export const AIAssistant: React.FC = () => {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    searchRoute, 
    stations, 
    setSelectedStationForBooking, 
    setBookingModalOpen 
  } = useApp();

  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_AI_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiDrawerOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiDrawerOpen, messages]);

  if (!aiDrawerOpen) return null;

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // AI Response generation with EV logic
    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();

      if (q.includes('battery') || q.includes('reach') || q.includes('percentage') || q.includes('range')) {
        reply = `🚗 **Route Battery Analysis for ${searchRoute.to}:**\n\n• **Estimated Route Distance:** ~32 km\n• **Energy Consumption:** ~5.2 kWh (~13-15% battery on Tata Nexon EV / MG ZS EV)\n• **Verdict:** ✅ If your battery is **above 25%**, you will easily reach without charging! If below 20%, we recommend stopping at **eVolt Highway MegaPoint (ORR Exit 16)** for a quick 10-min 150kW top-up!`;
      } else if (q.includes('fastest') || q.includes('150kw') || q.includes('hyper') || q.includes('speed')) {
        const ultraStn = stations.find(s => s.ports.some(p => p.powerKW >= 100)) || stations[0];
        reply = `⚡ **Fastest Charger Recommended:**\n\n**${ultraStn.name}**\n• **Speed:** 150kW Ultra-Fast (800V DC HyperCharge)\n• **Time to 80%:** ~18 minutes\n• **Status:** ${ultraStn.isBusy ? '🟠 Busy (15 min wait)' : '🟢 Available Now (Free Ports)'}\n• **Rate:** ₹19.00 / kWh\n\nWould you like to reserve a slot right now?`;
      } else if (q.includes('cost') || q.includes('price') || q.includes('kwh') || q.includes('unit') || q.includes('calculate')) {
        const units = 35;
        const avgRate = 16.5;
        const total = (units * avgRate) + 20 + ((units * avgRate + 20) * 0.05);
        reply = `💰 **Estimated Cost Calculation for 35 kWh:**\n\n• Base Energy (35 kWh @ ₹${avgRate}/u): **₹${(units * avgRate).toFixed(2)}**\n• Platform & Network Fee: **₹20.00**\n• GST (5%): **₹${(((units * avgRate + 20) * 0.05)).toFixed(2)}**\n• **Total Payable:** **₹${total.toFixed(2)}**\n\nThis gives you approximately **~230 km of driving range** (₹0.26 / km compared to ₹8.5 / km for petrol)!`;
      } else if (q.includes('telugu') || q.includes('enti') || q.includes('ekada') || q.includes('cheyali') || q.includes('undhi')) {
        reply = `⚡ **నమస్కారం! eVolt EV అసిస్టెంట్:**\n\nమీ ప్రయాణ మార్గంలో (**${searchRoute.from}** నుండి **${searchRoute.to}** వరకు):\n\n1. **eVolt SuperCharge Hub - HITEC**: 150kW Ultra Fast, Slots Available (ఖాళీగా ఉంది).\n2. **eVolt Highway MegaPoint - Shamshabad ORR**: విమానాశ్రయం వెళ్ళే దారిలో బెస్ట్ స్టాప్.\n\nమీరు 'Book Slot' క్లిక్ చేసి నేరుగా మీ వెహికల్ నంబర్‌తో స్లాట్ బుక్ చేసుకోవచ్చు మరియు UPI QR కోడ్ ద్వారా సులభంగా పేమెంట్ చేయవచ్చు!`;
      } else {
        reply = `⚡ **eVolt Smart Route Insight:**\n\nAlong your route between **${searchRoute.from}** and **${searchRoute.to}**, there are **${stations.length} active charging stations**.\n\n• Top Pick: **eVolt SuperCharge Hub** (400V-800V DC Fast)\n• Current Status: High availability & 4.9⭐ rated\n\nYou can click on any station card to calculate exact voltage charging fees and generate an instant UPI QR pass!`;
      }

      const aiMsg: AIMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: '⚡ Book Recommended Station', action: 'book_recommended' },
          { label: '📍 View All Stations on Map', action: 'view_map' },
        ]
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleQuickAction = (action: string) => {
    if (action === 'find_fastest') {
      handleSendMessage('Find the fastest 150kW charger on my route');
    } else if (action === 'battery_check') {
      handleSendMessage('Will my battery reach the destination?');
    } else if (action === 'calc_cost') {
      handleSendMessage('Calculate charging cost for 35 kWh');
    } else if (action === 'telugu_recommend') {
      handleSendMessage('Ee route lo best station enti?');
    } else if (action === 'book_recommended') {
      setSelectedStationForBooking(stations[0]);
      setBookingModalOpen(true);
      setAiDrawerOpen(false);
    } else if (action === 'view_map') {
      setAiDrawerOpen(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-l border-slate-700/80 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Bot className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-white text-base font-['Space_Grotesk']">
                Spark AI Assistant
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PRO EV
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Intelligent EV Route & Battery Co-Pilot</p>
          </div>
        </div>

        <button
          onClick={() => setAiDrawerOpen(false)}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-md'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Quick action buttons if available */}
              {msg.quickActions && msg.quickActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-1.5">
                  {msg.quickActions.map((qa, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickAction(qa.action)}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <span>{qa.label}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-2xl w-28">
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask battery range, stations, prices, Telugu..."
            className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
