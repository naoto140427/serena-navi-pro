import React, { useState, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Mic, ScanLine, Loader2, Wallet, Activity,
  Cloud, Sun, Terminal, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrafficTicker } from '../components/widgets/TrafficTicker';
import { HighwaySignWidget } from '../components/widgets/HighwaySignWidget';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { WalletPage } from './WalletPage';

// Imported Components
import { ProCard } from '../components/ui/ProCard';
import { ActionButton } from '../components/ui/ActionButton';
import { Speedometer } from '../components/cockpit/Speedometer';
import { NavModule } from '../components/cockpit/NavModule';
import { SystemConsole } from '../components/cockpit/SystemConsole';
import { MapEngine } from '../components/cockpit/MapEngine';
import { AdminDashboard } from '../components/admin/AdminDashboard';

// --- Main Layout ---
export const CockpitPage: React.FC = () => {
  const { nextWaypoint, currentSpeed, nearestFacilityText, addExpense, currentLocation } = useNavStore();
  const [activeTab, setActiveTab] = useState<'drive' | 'wallet' | 'admin'>('drive');
  const [focusMode, setFocusMode] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
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
    // Dummy implementation
    setTimeout(() => {
       addExpense("Lunch", 1500, 'Naoto');
       speak("Expense registered.");
       setIsScanning(false);
    }, 2000);
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
            <motion.div key="drive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 p-4 pt-16 pb-24 grid grid-cols-12 grid-rows-12 gap-4">
              
              {/* Speedometer */}
              <ProCard className={`col-span-12 md:col-span-5 row-span-5 md:row-span-6 relative transition-all duration-500 ${focusMode ? 'scale-105 z-40 bg-black border-none' : ''}`}>
                <Speedometer speed={currentSpeed} />
                <div className="absolute bottom-6 left-12 right-12">
                  <div className="flex justify-between text-[9px] font-bold text-zinc-500 mb-1"><span>E-POWER</span><span>84%</span></div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden"><motion.div className="h-full bg-gradient-to-r from-[#30D158] to-[#30D158]" initial={{ width: '0%' }} animate={{ width: '84%' }} /></div>
                </div>
              </ProCard>

              {/* 🗺️ MAP ENGINE */}
              <ProCard className={`col-span-12 md:col-span-7 row-span-4 md:row-span-6 overflow-hidden relative group transition-all duration-500 ${focusMode ? 'opacity-20 blur-sm' : ''}`}>
                <div className="absolute inset-0 z-0">
                   <MapEngine
                     currentLocation={currentLocation}
                     currentSpeed={currentSpeed}
                     nextWaypoint={nextWaypoint}
                     onLoad={() => setIsMapLoaded(true)}
                   />
                </div>
                
                {/* Overlay UI */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10"><NavModule nextWaypoint={nextWaypoint} distance={nearestFacilityText} /></div>
                
                {/* Loading State */}
                {!isMapLoaded && (
                   <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
                     <Loader2 className="animate-spin text-blue-500" size={32} />
                   </div>
                )}
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

      {/* --- Bottom Dock Navigation --- */}
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
