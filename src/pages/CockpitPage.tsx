import React, { useState, useMemo, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Navigation, Mic, ScanLine, Loader2, Wallet, Activity, Settings, 
  ArrowRight, RefreshCw,
  CarFront, Trash2, 
  UtensilsCrossed,
  Cloud, Sun, CloudRain, Snowflake, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Widgets
import { MapWidget } from '../components/widgets/MapWidget';
import { NexcoWidget } from '../components/widgets/NexcoWidget';
import { TrafficTicker } from '../components/widgets/TrafficTicker';
import { HighwaySignWidget } from '../components/widgets/HighwaySignWidget';
import { WeatherWidget } from '../components/widgets/WeatherWidget';
import { InteractionOverlay } from '../components/cockpit/InteractionOverlay';
import { DynamicIsland } from '../components/widgets/DynamicIsland';

// Hooks
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

// --- Sub Components (Tabs) ---

// 1. Wallet Tab
const WalletTab = () => {
  const { expenses, addExpense } = useNavStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Naoto');
  const members = ['Naoto', 'Taira', 'Haga'];

  const { total, settlements } = useMemo(() => {
    const totalCalc = expenses.reduce((sum, item) => sum + item.amount, 0);
    const perPerson = totalCalc > 0 ? Math.ceil(totalCalc / members.length) : 0;
    const paidBy: Record<string, number> = { Naoto: 0, Taira: 0, Haga: 0 };
    expenses.forEach(e => { if (paidBy[e.payer] !== undefined) paidBy[e.payer] += e.amount; });
    const balances = members.map(name => ({ name, balance: paidBy[name] - perPerson }));
    const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
    const results: { from: string; to: string; amount: number }[] = [];
    let dIndex = 0, cIndex = 0;
    while (dIndex < debtors.length && cIndex < creditors.length) {
      const move = Math.min(Math.abs(debtors[dIndex].balance), creditors[cIndex].balance);
      if (move > 0) {
        results.push({ from: debtors[dIndex].name, to: creditors[cIndex].name, amount: move });
        debtors[dIndex].balance += move;
        creditors[cIndex].balance -= move;
      }
      if (Math.abs(debtors[dIndex].balance) < 1) dIndex++;
      if (creditors[cIndex].balance < 1) cIndex++;
    }
    return { total: totalCalc, settlements: results };
  }, [expenses]);

  const handleSubmit = () => {
    if (!title || !amount) return;
    addExpense(title, parseInt(amount), payer);
    setTitle('');
    setAmount('');
  };

  return (
    <div className="pt-24 px-4 pb-32 space-y-6 overflow-y-auto h-full bg-black text-white">
      <div className="p-6">
        <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">Total Expenses</div>
        <div className="text-5xl font-thin font-mono tracking-tighter">¥{total.toLocaleString()}</div>
      </div>
      
      <div className="bg-zinc-900 rounded-xl p-4 space-y-4">
        <div className="flex gap-3">
          <input type="text" placeholder="What" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-transparent border-b border-zinc-700 p-2 text-white outline-none placeholder:text-zinc-600" />
          <div className="w-10 flex items-center justify-center text-zinc-500"><ScanLine size={20} /></div>
        </div>
        <div className="flex gap-3">
          <input type="number" placeholder="¥0" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent border-b border-zinc-700 p-2 text-white font-mono outline-none placeholder:text-zinc-600" />
          <select value={payer} onChange={e => setPayer(e.target.value)} className="bg-transparent border-b border-zinc-700 p-2 text-blue-400 outline-none">
            {members.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <button onClick={handleSubmit} className="w-full bg-zinc-800 hover:bg-zinc-700 text-blue-400 font-bold py-3 rounded-lg transition-colors">Record Payment</button>
      </div>

      {settlements.length > 0 && (
        <div className="space-y-1 pt-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-2">Settlement Plan</h3>
          {settlements.map((s, i) => (
            <div key={i} className="flex justify-between items-center px-4 py-3 border-b border-zinc-900">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-white">{s.from}</span>
                <ArrowRight size={12} className="text-zinc-600"/>
                <span className="text-white">{s.to}</span>
              </div>
              <span className="font-mono text-zinc-400">¥{s.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 2. Guide Tab (Ultra Minimal Timeline)
const GuideTab = () => {
  const { waypoints, nextWaypoint } = useNavStore();
  const nextWaypointId = nextWaypoint?.id;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dayHeaders: Record<string, string> = {
    'start': 'DAY 0',
    'ise_jingu': 'DAY 1',
    'metasequoia': 'DAY 2',
    'hiroshima_okonomi': 'DAY 3'
  };

  const daySubHeaders: Record<string, string> = {
    'start': 'NIGHT CRUISE',
    'ise_jingu': 'MIE / GOD & BEEF',
    'metasequoia': 'SHIGA & KOBE',
    'hiroshima_okonomi': 'THE RETURN'
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="pt-24 px-0 pb-32 h-full bg-black overflow-y-auto">
      <div className="relative pb-10">
        {/* Timeline Line (Left) */}
        <div className="absolute left-[29px] top-0 bottom-0 w-[1px] bg-zinc-800" />

        {waypoints.map((spot, index) => {
          const isNext = spot.id === nextWaypointId;
          const isPast = index < waypoints.findIndex(w => w.id === nextWaypointId);
          const isExpanded = expandedId === spot.id;
          const dayHeader = dayHeaders[spot.id];
          
          return (
            <React.Fragment key={spot.id}>
              {/* Day Header */}
              {dayHeader && (
                <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-zinc-800 py-3 px-6 mb-2 mt-6 first:mt-0 flex justify-between items-baseline">
                  <h3 className="text-xl font-bold text-white tracking-tight">{dayHeader}</h3>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{daySubHeaders[spot.id]}</span>
                </div>
              )}

              {/* List Item */}
              <div className="relative pl-16 pr-4 py-4 group">
                {/* Timeline Dot */}
                <div 
                  onClick={() => toggleExpand(spot.id)}
                  className={`absolute left-[24px] top-6 w-3 h-3 rounded-full z-10 cursor-pointer transition-all duration-300 ${
                    isNext ? 'bg-blue-500 ring-4 ring-blue-500/20 scale-110' : 
                    isPast ? 'bg-zinc-800' : 
                    'bg-zinc-500 border-2 border-black'
                  }`}
                />

                <div onClick={() => toggleExpand(spot.id)} className="cursor-pointer">
                  {/* Time & Weather */}
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`text-sm font-mono font-medium ${isNext ? 'text-blue-400' : 'text-zinc-500'}`}>
                      {spot.scheduledTime}
                    </span>
                    {spot.weather && (
                       <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                         {spot.weather.type === 'rain' ? <CloudRain size={12} /> : 
                          spot.weather.type === 'snow' ? <Snowflake size={12} /> : 
                          spot.weather.type === 'cloudy' ? <Cloud size={12} /> : <Sun size={12} />}
                         {spot.weather.temp}
                       </div>
                    )}
                  </div>

                  {/* Spot Name */}
                  <div className="flex justify-between items-start">
                    <h4 className={`text-lg font-medium leading-tight transition-colors ${isNext ? 'text-white' : 'text-zinc-400'}`}>
                      {spot.name}
                    </h4>
                    {isExpanded ? <ChevronUp size={16} className="text-zinc-600" /> : <ChevronDown size={16} className="text-zinc-800" />}
                  </div>

                  {/* Summary Badges (Collapsed) */}
                  {!isExpanded && (
                    <div className="flex gap-3 mt-2">
                       {spot.type === 'hotel' && <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">STAY</span>}
                       {spot.quests && <span className="text-[10px] text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">{spot.quests.length} MISSIONS</span>}
                    </div>
                  )}

                  {/* Detailed Content (Expanded) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 space-y-4">
                          {/* Image (Full width) */}
                          {spot.image && (
                            <div className="rounded-xl overflow-hidden h-40 w-full relative">
                              <img src={spot.image} alt={spot.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                              <div className="absolute bottom-2 left-3">
                                <p className="text-xs text-zinc-300 font-medium">{spot.description}</p>
                              </div>
                            </div>
                          )}
                          {!spot.image && spot.description && (
                             <p className="text-sm text-zinc-400 italic pl-2 border-l-2 border-zinc-800">{spot.description}</p>
                          )}

                          {/* Info Blocks (Grid) */}
                          <div className="grid grid-cols-1 gap-3">
                            {/* Quests */}
                            {spot.quests && (
                              <div className="bg-zinc-900/50 rounded-lg p-3">
                                <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Missions</h5>
                                <ul className="space-y-2">
                                  {spot.quests.map((q, i) => (
                                    <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                      <div className="mt-1 w-2 h-2 rounded-full bg-zinc-700 shrink-0" />
                                      {q}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Driver Info */}
                            {spot.driverIntel && (
                              <div className="bg-blue-900/20 rounded-lg p-3 border-l-2 border-blue-500/50">
                                <h5 className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                                  <CarFront size={12} /> Driver Note
                                </h5>
                                <p className="text-xs text-zinc-300 leading-relaxed">{spot.driverIntel.parking}</p>
                                {spot.driverIntel.road && <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{spot.driverIntel.road}</p>}
                              </div>
                            )}

                            {/* Gourmet */}
                            {spot.gourmet && (
                              <div className="bg-orange-900/20 rounded-lg p-3 border-l-2 border-orange-500/50">
                                <h5 className="text-[10px] font-bold text-orange-400 uppercase mb-1 flex items-center gap-1">
                                  <UtensilsCrossed size={12} /> Gourmet
                                </h5>
                                <div className="flex justify-between items-baseline">
                                  <span className="text-xs font-bold text-zinc-200">{spot.gourmet.item}</span>
                                  <span className="text-[10px] font-mono text-zinc-400">{spot.gourmet.price}</span>
                                </div>
                                {spot.gourmet.tip && <p className="text-[10px] text-zinc-400 mt-1 italic">"{spot.gourmet.tip}"</p>}
                              </div>
                            )}

                             {/* Google Maps Link */}
                             <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="block w-full py-3 bg-zinc-800 text-center rounded-lg text-xs font-bold text-blue-400 hover:bg-zinc-700 transition-colors"
                            >
                              Open in Google Maps
                            </a>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// 3. Settings Tab
const SettingsTab = () => {
  const { currentUser, expenses, resetAllData, refreshRouteData } = useNavStore();
  return (
    <div className="pt-24 px-4 pb-32 overflow-y-auto h-full bg-black text-white">
      <h2 className="text-3xl font-bold mb-8 px-2 tracking-tight">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-2">Data Management</h3>
          <div className="bg-zinc-900 rounded-xl overflow-hidden">
            <div onClick={() => { if(refreshRouteData){ refreshRouteData(); window.location.reload(); } }} className="flex items-center justify-between p-4 active:bg-zinc-800 transition-colors cursor-pointer border-b border-black">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><RefreshCw size={18} className="text-white"/></div>
                 <div><div className="text-sm font-medium">Update Route</div></div>
               </div>
            </div>
            <div onClick={() => { if(resetAllData && confirm('Reset?')) resetAllData(); }} className="flex items-center justify-between p-4 active:bg-zinc-800 transition-colors cursor-pointer">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center"><Trash2 size={18} className="text-white"/></div>
                 <div><div className="text-sm font-medium text-red-100">Reset All Data</div></div>
               </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-2">Status</h3>
          <div className="bg-zinc-900 rounded-xl overflow-hidden p-4 space-y-3">
             <div className="flex justify-between items-center">
               <span className="text-sm text-zinc-400">Pilot</span>
               <span className="text-sm font-bold">{currentUser}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-sm text-zinc-400">Wallet Records</span>
               <span className="text-sm font-mono">{expenses.length}</span>
             </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] text-zinc-700 font-mono">Serena Navi Pro v3.0 (Grand Tour)</p>
      </div>
    </div>
  );
};

// --- MAIN COCKPIT PAGE ---

export const CockpitPage: React.FC = () => {
  const { trafficInfo, nextWaypoint, currentSpeed, nearestFacilityText, addExpense } = useNavStore();
  const safeTrafficInfo = trafficInfo || { riskLevel: 0, jamDistance: 0, nextReg: '--' };
  
  const [activeTab, setActiveTab] = useState<'drive' | 'wallet' | 'guide' | 'settings'>('drive');

  const { isListening, transcript, startListening } = useVoiceAssistant();
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = "ja-JP";
    uttr.rate = 1.2;
    window.speechSynthesis.speak(uttr);
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    speak("画像を解析しています。前方を見てお待ちください。");
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        const data = await res.json();
        if (data.title && data.amount) {
          addExpense(data.title, parseInt(data.amount), 'Naoto');
          speak(`${data.title}、${data.amount}円を登録しました。`);
        } else {
          speak("金額を読み取れませんでした。");
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      speak("エラーが発生しました。");
    }
  };

  const DriveView = () => (
    <div className="h-full flex flex-col gap-4 p-4 pb-24 overflow-y-auto md:overflow-hidden relative bg-cockpit-bg text-cockpit-text-primary font-sans">
      <InteractionOverlay />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[50vh] md:h-[300px]">
        <div className="md:col-span-4 flex flex-col gap-4 md:justify-between order-2 md:order-1">
          <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-6 border border-cockpit-border text-center md:text-left shadow-lg">
            <div className="text-cockpit-text-muted text-xs font-bold uppercase tracking-wider mb-1 font-mono">Current Speed</div>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-7xl md:text-8xl font-black text-white tracking-tighter font-display">
                {currentSpeed}
              </span>
              <span className="text-xl text-cockpit-text-secondary font-bold">km/h</span>
            </div>
          </div>

          <div className="bg-cockpit-panel backdrop-blur-md rounded-xl p-4 border border-cockpit-border">
            <div className="flex items-center gap-2 text-cockpit-text-secondary mb-2">
              <Navigation size={16} />
              <span className="text-xs font-bold tracking-wider">NEXT WAYPOINT</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white truncate">
              {nextWaypoint ? nextWaypoint.name : 'Destination Reached'}
            </div>
            <div className="text-sm text-cockpit-accent font-mono mt-1">
              {nearestFacilityText}
            </div>
          </div>
        </div>

        <div className="md:col-span-8 relative h-[300px] md:h-auto order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-cockpit-border bg-black">
          <MapWidget />
          <div className="absolute top-4 right-4 w-auto md:w-64 z-10">
            <NexcoWidget 
              riskLevel={safeTrafficInfo.riskLevel} 
              jamDistance={safeTrafficInfo.jamDistance} 
              nextReg={safeTrafficInfo.nextReg} 
            />
          </div>
          <div className="absolute top-4 left-4 z-10 hidden md:block">
            <HighwaySignWidget />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[200px]">
        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl border border-cockpit-border flex overflow-hidden relative">
          <button 
            onClick={startListening}
            className={`flex-1 flex flex-col items-center justify-center gap-2 border-r border-zinc-700/50 hover:bg-white/5 transition-all ${isListening ? 'bg-red-900/30' : ''}`}
          >
            <Mic size={28} className={isListening ? "text-red-500 animate-pulse" : "text-white"} />
            <span className="text-[10px] font-bold text-zinc-400 tracking-widest">VOICE</span>
            {isListening && transcript && (
              <span className="absolute bottom-2 text-[10px] text-white bg-black/50 px-2 rounded truncate max-w-full">
                {transcript}
              </span>
            )}
          </button>
          <div className="flex-1 relative">
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment" 
              onChange={handleScan} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full flex flex-col items-center justify-center gap-2 hover:bg-white/5 transition-all ${isScanning ? 'bg-green-900/30' : ''}`}
            >
              {isScanning ? (
                <Loader2 size={28} className="text-green-500 animate-spin" />
              ) : (
                <ScanLine size={28} className="text-green-400" />
              )}
              <span className="text-[10px] font-bold text-zinc-400 tracking-widest">
                {isScanning ? "ANALYZING..." : "SCAN RECEIPT"}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-4 border border-cockpit-border flex flex-col justify-between gap-2">
          <div className="text-cockpit-text-muted text-xs font-bold">ENERGY FLOW</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white font-display">4.2</span>
            <span className="text-sm text-cockpit-text-secondary mb-1">km/kWh</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '65%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />
          </div>
        </div>
        <WeatherWidget />
      </div>
      <TrafficTicker />
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden flex flex-col">
      {/* Dynamic Island (Always on top) */}
      <div className="absolute top-4 left-0 right-0 z-[60] flex justify-center pointer-events-none">
        <DynamicIsland />
      </div>

      <main className="flex-1 relative overflow-hidden h-full">
        {activeTab === 'drive' && <DriveView />}
        {activeTab === 'wallet' && <WalletTab />}
        {activeTab === 'guide' && <GuideTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-zinc-800 pb-safe z-50 h-20">
        <div className="flex justify-around items-center h-full max-w-md mx-auto px-2 pb-2">
          <button onClick={() => setActiveTab('drive')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'drive' ? 'text-blue-500' : 'text-zinc-600'}`}>
            <Navigation size={24} strokeWidth={activeTab === 'drive' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Drive</span>
          </button>
          <button onClick={() => setActiveTab('wallet')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'wallet' ? 'text-blue-500' : 'text-zinc-600'}`}>
            <Wallet size={24} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Wallet</span>
          </button>
          <button onClick={() => setActiveTab('guide')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'guide' ? 'text-blue-500' : 'text-zinc-600'}`}>
            <Activity size={24} strokeWidth={activeTab === 'guide' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Guide</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'settings' ? 'text-blue-500' : 'text-zinc-600'}`}>
            <Settings size={24} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[10px] font-medium tracking-wide mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
};