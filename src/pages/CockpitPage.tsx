import React, { useState, useRef, useEffect } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Navigation, Mic, ScanLine, Loader2, Wallet, Activity, 
  Cloud, Sun, Terminal, Maximize2, Minimize2,
  Cpu, HardDrive, Wifi, Battery, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Widgets & Hooks
import { MapWidget } from '../components/widgets/MapWidget';
import { NexcoWidget } from '../components/widgets/NexcoWidget';
import { TrafficTicker } from '../components/widgets/TrafficTicker';
import { HighwaySignWidget } from '../components/widgets/HighwaySignWidget';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { WalletPage } from './WalletPage';

// --- Shared Components ---
const ProCard = ({ children, className = "", onClick, noBlur = false }: { children: React.ReactNode, className?: string, onClick?: () => void, noBlur?: boolean }) => (
  <motion.div 
    onClick={onClick}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    className={`relative overflow-hidden rounded-[24px] border border-white/10 shadow-2xl ${noBlur ? 'bg-[#000000]' : 'bg-[#161618]/90 backdrop-blur-3xl'} ${className}`}
  >
    {children}
  </motion.div>
);

// --- Widgets ---
const Speedometer = ({ speed }: { speed: number }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="absolute inset-2 rounded-full border border-white/5" />
      <div className="absolute inset-8 rounded-full border border-dashed border-white/10 opacity-50" />
      <svg className="absolute inset-0 w-full h-full -rotate-90 p-4">
        <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#333" strokeWidth="6" strokeDasharray="75 25" strokeDashoffset="0" strokeLinecap="round" />
        <motion.circle cx="50%" cy="50%" r="42%" fill="none" stroke={speed > 100 ? '#FF453A' : '#0A84FF'} strokeWidth="6" strokeDasharray="75 25" strokeDashoffset="0" initial={{ pathLength: 0 }} animate={{ pathLength: Math.min(speed / 180, 0.75) }} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(10,132,255,0.5)]" />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Ground Speed</span>
        <div className="flex items-baseline gap-1">
          <span className="text-7xl font-bold text-white font-mono tracking-tighter tabular-nums">{speed}</span>
          <span className="text-lg font-medium text-zinc-500">km/h</span>
        </div>
      </div>
    </div>
  );
};

const NavModule = ({ nextWaypoint, distance }: { nextWaypoint: any, distance: string }) => (
  <div className="flex flex-col justify-between h-full p-1">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 bg-[#0A84FF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.4)]">
        <Navigation size={32} className="text-white fill-white" />
      </div>
      <div>
        <div className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider mb-1">Next Waypoint</div>
        <div className="text-2xl font-bold text-white leading-none tracking-tight line-clamp-1">
          {nextWaypoint?.name || "Destination"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 font-mono">{distance}</div>
      </div>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden flex">
      <div className="w-1/3 h-full bg-[#30D158]" />
      <div className="w-1/3 h-full bg-[#FFD60A]" />
      <div className="w-1/3 h-full bg-zinc-700" />
    </div>
  </div>
);

const SystemConsole = ({ location }: { location: { lat: number, lng: number } }) => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = ["GPS_LOCK_OK", "NET_STABLE", "MEM_OPTIMAL", "FUEL_ECO_MODE", "TRAFFIC_UPDATED"];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
      setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 4));
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-full font-mono text-[9px] text-[#30D158] leading-relaxed opacity-80 overflow-hidden">
      <div className="flex justify-between border-b border-[#30D158]/20 pb-1 mb-1">
        <span className="flex items-center gap-1"><Terminal size={10} /> SYS.LOG</span>
        <span>ADMIN: NAOTO</span>
      </div>
      <div className="flex justify-between mb-2 text-[8px] text-zinc-500">
        <span>LAT: {location.lat.toFixed(4)}</span>
        <span>LNG: {location.lng.toFixed(4)}</span>
      </div>
      <div className="space-y-0.5">
        {logs.map((log, i) => <div key={i} className="opacity-70">{log}</div>)}
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, active, onClick, color = "text-white" }: any) => (
  <button onClick={onClick} className={`relative group flex flex-col items-center justify-center gap-1 w-full aspect-square rounded-2xl border transition-all duration-200 ${active ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800'}`}>
    <Icon size={24} className={active ? "text-black" : color} strokeWidth={2.5} />
    <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    {active && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF453A] rounded-full animate-pulse" />}
  </button>
);

// --- Admin Dashboard (Settings) ---
const AdminDashboard = () => {
  const { resetAllData, refreshRouteData } = useNavStore();
  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-32">
      <h2 className="text-[34px] font-bold tracking-tight mb-8">System Admin</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50">
          <Cpu size={24} className="text-blue-500" />
          <span className="text-xs font-bold text-zinc-500">CPU LOAD</span>
          <span className="text-xl font-mono">12%</span>
        </ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50">
          <HardDrive size={24} className="text-purple-500" />
          <span className="text-xs font-bold text-zinc-500">STORAGE</span>
          <span className="text-xl font-mono">45%</span>
        </ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50">
          <Wifi size={24} className="text-green-500" />
          <span className="text-xs font-bold text-zinc-500">NETWORK</span>
          <span className="text-xl font-mono">5G</span>
        </ProCard>
        <ProCard className="p-4 flex flex-col items-center gap-2 bg-zinc-900/50">
          <Battery size={24} className="text-yellow-500" />
          <span className="text-xs font-bold text-zinc-500">POWER</span>
          <span className="text-xl font-mono">100%</span>
        </ProCard>
      </div>

      <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-3">Maintenance</h3>
      <div className="space-y-3">
        <ProCard onClick={() => { if(refreshRouteData) refreshRouteData(); }} className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5">
          <span className="font-medium">Force Sync Route Data</span>
          <Activity size={16} className="text-blue-500" />
        </ProCard>
        <ProCard onClick={() => { if(confirm('Factory Reset?')) resetAllData(); }} className="p-4 flex items-center justify-between cursor-pointer hover:bg-red-900/20 border-red-900/30">
          <span className="font-medium text-red-400">Factory Reset</span>
          <Trash2 size={16} className="text-red-500" />
        </ProCard>
      </div>
    </div>
  );
};

// --- Main Layout ---

export const CockpitPage: React.FC = () => {
  const { trafficInfo, nextWaypoint, currentSpeed, nearestFacilityText, addExpense, currentLocation } = useNavStore();
  const safeTrafficInfo = trafficInfo || { riskLevel: 0, jamDistance: 0, nextReg: '--' };
  
  const [activeTab, setActiveTab] = useState<'drive' | 'wallet' | 'admin'>('drive');
  const [focusMode, setFocusMode] = useState(false);
  
  const { isListening, startListening } = useVoiceAssistant();
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = "ja-JP";
    window.speechSynthesis.speak(uttr);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    speak("Processing receipt.");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64String }) });
        const data = await res.json();
        if (data.title && data.amount) {
          addExpense(data.title, parseInt(data.amount), 'Naoto');
          speak("Expense registered.");
        } else { speak("Scan failed."); }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) { setIsScanning(false); speak("System error."); }
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col text-white font-sans selection:bg-[#0A84FF]/30">
      
      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto"><HighwaySignWidget /></div>
        <div className="flex gap-2 pointer-events-auto">
          <button onClick={() => setFocusMode(!focusMode)} className={`p-3 rounded-full backdrop-blur-md border border-white/10 transition-all ${focusMode ? 'bg-[#0A84FF] text-white shadow-lg shadow-blue-500/50' : 'bg-black/60 text-zinc-400'}`}>
            {focusMode ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* 1. DRIVE MODE (Cockpit) */}
          {activeTab === 'drive' && (
            <motion.div 
              key="drive"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 p-4 pt-16 pb-24 grid grid-cols-12 grid-rows-12 gap-4"
            >
              {/* Speedometer */}
              <ProCard className={`col-span-12 md:col-span-5 row-span-5 md:row-span-6 relative transition-all duration-500 ${focusMode ? 'scale-105 z-40 bg-black border-none' : ''}`}>
                <Speedometer speed={currentSpeed} />
                <div className="absolute bottom-6 left-12 right-12">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 mb-1"><span>E-POWER</span><span>84%</span></div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-[#30D158] to-[#30D158]" initial={{ width: '0%' }} animate={{ width: '84%' }} /></div>
                </div>
              </ProCard>

              {/* Map & Nav */}
              <ProCard className={`col-span-12 md:col-span-7 row-span-4 md:row-span-6 overflow-hidden relative group transition-all duration-500 ${focusMode ? 'opacity-20 blur-sm' : ''}`}>
                <div className="absolute inset-0 z-0 opacity-60 group-hover:opacity-100 transition-opacity"><MapWidget /></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10"><NavModule nextWaypoint={nextWaypoint} distance={nearestFacilityText} /></div>
                <div className="absolute top-4 right-4 z-20"><NexcoWidget riskLevel={safeTrafficInfo.riskLevel} jamDistance={safeTrafficInfo.jamDistance} nextReg={safeTrafficInfo.nextReg} /></div>
              </ProCard>

              {/* Console & Actions */}
              {!focusMode && (
                <>
                  <ProCard className="col-span-6 md:col-span-3 row-span-3 p-4 bg-black/80 border-[#30D158]/30 shadow-[0_0_15px_rgba(48,209,88,0.1)]">
                    <SystemConsole location={currentLocation} />
                  </ProCard>
                  <div className={`col-span-6 md:col-span-6 row-span-3 grid grid-cols-2 gap-3`}>
                    <ActionButton icon={Mic} label={isListening ? "Listening" : "Voice"} active={isListening} color="text-[#0A84FF]" onClick={startListening} />
                    <div className="relative w-full h-full">
                      <ActionButton icon={isScanning ? Loader2 : ScanLine} label="Scan Rec" active={isScanning} color="text-[#30D158]" onClick={() => fileInputRef.current?.click()} />
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
                    </div>
                  </div>
                  <ProCard className="col-span-12 md:col-span-3 row-span-3 p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase"><Cloud size={14} /> Env</div>
                    <div className="flex justify-between items-end"><div><div className="text-3xl font-bold text-white">24°</div><div className="text-xs text-zinc-500">Sunny</div></div><Sun size={32} className="text-[#FFD60A]" /></div>
                  </ProCard>
                </>
              )}
            </motion.div>
          )}

          {/* 2. WALLET MODE */}
          {activeTab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 pt-16">
              <WalletPage />
            </motion.div>
          )}

          {/* 3. ADMIN MODE */}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="absolute inset-0 pt-16">
              <AdminDashboard />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <TrafficTicker />

      {/* --- Bottom Dock Navigation (Admin Style) --- */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <motion.div 
          initial={{ y: 100 }} animate={{ y: 0 }}
          className="bg-[#161618]/90 backdrop-blur-2xl border border-white/10 rounded-full px-4 py-3 flex items-center gap-4 shadow-2xl pointer-events-auto"
        >
          <button onClick={() => setActiveTab('drive')} className={`relative group p-3 rounded-full transition-all duration-300 ${activeTab === 'drive' ? 'bg-white text-black scale-110' : 'text-zinc-400 hover:bg-white/10'}`}>
            <Activity size={22} strokeWidth={activeTab === 'drive' ? 2.5 : 2} />
          </button>
          
          <div className="w-[1px] h-6 bg-white/10" />

          <button onClick={() => setActiveTab('wallet')} className={`relative group p-3 rounded-full transition-all duration-300 ${activeTab === 'wallet' ? 'bg-white text-black scale-110' : 'text-zinc-400 hover:bg-white/10'}`}>
            <Wallet size={22} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
          </button>

          <button onClick={() => setActiveTab('admin')} className={`relative group p-3 rounded-full transition-all duration-300 ${activeTab === 'admin' ? 'bg-[#FF453A] text-white scale-110 shadow-[0_0_15px_rgba(255,69,58,0.5)]' : 'text-zinc-400 hover:bg-white/10'}`}>
            <Terminal size={22} strokeWidth={2.5} />
          </button>
        </motion.div>
      </div>

    </div>
  );
};