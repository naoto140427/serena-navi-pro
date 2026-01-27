import React, { useState, useMemo, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Music, MapPin, Navigation, ArrowRight, 
  Wallet, Activity, AlertTriangle, ScanLine, 
  Clock, Radio, Loader2,
  Play, Pause, SkipForward, LogIn,
  CheckCircle2, CarFront, UtensilsCrossed, Cigarette, Droplets, ShoppingBag,
  Settings, ChevronRight, User, Trash2,
  Sun, Cloud, CloudRain, Snowflake, 
  Gavel, ChevronUp, Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotify } from '../hooks/useSpotify';
import { TwitterFeed } from '../components/widgets/TwitterFeed';

// --- Shared Components ---

// Apple-style Glass Card
const GlassCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-[20px] shadow-sm ${className}`}>
    {children}
  </div>
);

// --- Telemetry Header ---
const TelemetryHeader = () => {
  const { currentSpeed, nextWaypointEta, currentAreaText, activeNotification, waypoints } = useNavStore();
  const nextPoint = waypoints.find(w => 
    w.type === 'sightseeing' || w.type === 'parking' || w.type === 'hotel'
  ) || waypoints[1];
  const weather = nextPoint?.weather || { type: 'sunny', temp: '--' };
  
  const WeatherIcon = () => {
    switch (weather.type) {
      case 'rain': return <CloudRain size={16} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />;
      case 'cloudy': return <Cloud size={16} className="text-gray-400" />;
      case 'snow': return <Snowflake size={16} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />;
      default: return <Sun size={16} className="text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />;
    }
  };
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 pt-safe-top pb-3 px-4 transition-all duration-500">
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
            <MapPin size={10} /> Location
          </div>
          <div className="text-base font-bold text-white tracking-tight">{currentAreaText}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Ground Speed</div>
          <div className="text-3xl font-bold text-white font-mono leading-none tracking-tighter">
            {currentSpeed} <span className="text-xs font-medium text-zinc-600 tracking-normal">km/h</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-800/50 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5">
          <Clock size={14} className="text-blue-500" />
          <div className="text-xs font-bold font-mono text-zinc-200">{nextWaypointEta}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5">
          <WeatherIcon />
          <div className="text-xs font-bold font-mono text-zinc-200">{weather.temp}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5">
          <Radio size={14} className={activeNotification ? "text-green-500 animate-pulse" : "text-zinc-600"} />
          <div className="text-xs font-bold text-zinc-200">{activeNotification ? "LINKED" : "READY"}</div>
        </div>
      </div>
    </div>
  );
};

// --- DJ Panel ---
const DJPanel = () => {
  const { token, track, isPlaying, handleLogin, handleNext, handlePlayPause } = useSpotify();
  
  if (!token) {
    return (
      <GlassCard className="p-6 text-center">
        <div className="w-14 h-14 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(29,185,84,0.3)]">
          <Music className="text-black" size={28} />
        </div>
        <h3 className="text-white font-bold mb-1">Apple CarPlay Style</h3>
        <p className="text-zinc-500 text-xs mb-4">Connect Spotify for sync.</p>
        <button onClick={handleLogin} className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
          <LogIn size={18} /> Connect
        </button>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-0 overflow-hidden relative group">
      {/* Background Blur Image */}
      {track && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 blur-2xl scale-110 transition-all duration-1000"
          style={{ backgroundImage: `url(${track.album.images[0]?.url})` }}
        />
      )}
      
      <div className="p-5 relative z-10">
        <div className="flex items-center gap-4">
          <motion.div 
            animate={{ scale: isPlaying ? 1.05 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative"
          >
            <img 
              src={track?.album.images[0]?.url} 
              alt="Art" 
              className="w-20 h-20 rounded-xl shadow-2xl object-cover"
            />
            <div className="absolute -bottom-2 -right-2 bg-black/80 rounded-full p-1.5 border border-white/10">
              <Music size={10} className="text-[#1DB954]" />
            </div>
          </motion.div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-white leading-tight truncate">{track?.name || "Not Playing"}</h3>
            <p className="text-sm text-zinc-400 truncate mt-0.5">{track?.artists.map((a:any) => a.name).join(', ')}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 px-4">
          <button onClick={handlePlayPause} className="text-white hover:text-zinc-300 transition-colors">
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
          </button>
          <button onClick={handleNext} className="text-white hover:text-zinc-300 transition-colors active:scale-90">
            <SkipForward size={32} fill="currentColor" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
};

// --- Judge Panel (Revived & Restyled) ---
const JudgePanel = () => {
  const [result, setResult] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [mode, setMode] = useState<'PAY' | 'DRIVE' | null>(null);
  const members = ['Naoto', 'Taira', 'Haga'];

  const handleSpin = (selectedMode: 'PAY' | 'DRIVE') => {
    if (isSpinning) return;
    setMode(selectedMode);
    setIsSpinning(true);
    setResult(null);
    let count = 0;
    const interval = setInterval(() => {
      setResult(members[Math.floor(Math.random() * members.length)]);
      count++;
      if (count > 15) { clearInterval(interval); setIsSpinning(false); setResult(members[Math.floor(Math.random() * members.length)]); }
    }, 100);
  };

  return (
    <GlassCard className="p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
          <Gavel size={14} /> The Judge {mode ? `- ${mode}` : ''}
        </h3>
        <div className={`text-xl font-black font-mono tracking-wider ${isSpinning ? 'text-zinc-500 animate-pulse' : 'text-[#FFD60A]'}`}>
          {result || "READY"}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => handleSpin('PAY')} disabled={isSpinning} className="bg-zinc-800/50 hover:bg-red-900/30 border border-white/5 hover:border-red-500 text-zinc-300 hover:text-red-400 p-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] flex flex-col items-center gap-1 group">
          <Wallet size={20} className="group-hover:animate-bounce mb-1" />
          Who Pays?
        </button>
        <button onClick={() => handleSpin('DRIVE')} disabled={isSpinning} className="bg-zinc-800/50 hover:bg-blue-900/30 border border-white/5 hover:border-blue-500 text-zinc-300 hover:text-blue-400 p-3 rounded-xl font-bold text-xs transition-all active:scale-[0.98] flex flex-col items-center gap-1 group">
          <CarFront size={20} className="group-hover:animate-bounce mb-1" />
          Next Driver?
        </button>
      </div>
    </GlassCard>
  );
};

// --- Guide Tab (Apple Maps Level) ---
const GuideTab = () => {
  // ★修正: nextWaypoint から安全にIDを取得
  const { waypoints, nextWaypoint } = useNavStore();
  const nextWaypointId = nextWaypoint?.id;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const dayHeaders: Record<string, string> = {
    'start': 'Day 0',
    'ise_jingu': 'Day 1',
    'metasequoia': 'Day 2',
    'hiroshima_okonomi': 'Day 3'
  };
  
  const daySubHeaders: Record<string, string> = {
    'start': 'Departure Night',
    'ise_jingu': 'Mie & Matsusaka',
    'metasequoia': 'Shiga & Kobe',
    'hiroshima_okonomi': 'The Return'
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 現在の進捗indexを取得
  const activeIndex = waypoints.findIndex(w => w.id === nextWaypointId);

  return (
    <div className="pt-32 pb-32 px-0 min-h-screen bg-black">
      <div className="relative">
        
        {/* Timeline Line (Dynamic) */}
        <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-zinc-800 rounded-full" />
        {/* Progress Line (Blue) */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${(Math.max(0, activeIndex) / waypoints.length) * 100}%` }}
          className="absolute left-[39px] top-0 w-[2px] bg-[#0A84FF] rounded-full z-0 shadow-[0_0_10px_#0A84FF]"
        />

        {waypoints.map((spot, index) => {
          const isNext = spot.id === nextWaypointId;
          const isPast = index < activeIndex;
          const isExpanded = expandedId === spot.id;
          const dayHeader = dayHeaders[spot.id];
          
          return (
            <React.Fragment key={spot.id}>
              {/* Sticky Header with Blur */}
              {dayHeader && (
                <div className="sticky top-[130px] z-30 mb-6 mt-8 first:mt-0">
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-y border-white/5" />
                  <div className="relative px-6 py-3 flex justify-between items-baseline">
                    <h2 className="text-2xl font-bold text-white tracking-tight">{dayHeader}</h2>
                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">{daySubHeaders[spot.id]}</span>
                  </div>
                </div>
              )}

              <motion.div 
                layout 
                className="relative pl-20 pr-4 py-3 group"
              >
                {/* Time Stamp (Left) */}
                <div className="absolute left-4 top-[18px] w-10 text-right">
                  <span className={`text-[11px] font-mono font-bold tracking-tight ${isNext ? 'text-[#0A84FF]' : isPast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {spot.scheduledTime}
                  </span>
                </div>

                {/* Timeline Node (The Dot) */}
                <div 
                  onClick={() => toggleExpand(spot.id)}
                  className="absolute left-[34px] top-[20px] z-10 cursor-pointer"
                >
                  <motion.div 
                    animate={{ 
                      scale: isNext ? 1.2 : 1,
                      backgroundColor: isNext ? '#0A84FF' : isPast ? '#27272a' : '#52525b',
                      borderColor: isNext ? 'rgba(10, 132, 255, 0.3)' : '#000'
                    }}
                    className={`w-3 h-3 rounded-full border-[3px] box-content shadow-lg transition-colors duration-500`}
                  />
                  {/* Pulse Effect for Next Waypoint */}
                  {isNext && (
                    <motion.div 
                      animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 bg-[#0A84FF] rounded-full -z-10"
                    />
                  )}
                </div>

                {/* Card Content */}
                <motion.div 
                  layout
                  onClick={() => toggleExpand(spot.id)}
                  className={`relative overflow-hidden rounded-[18px] cursor-pointer border transition-all duration-300 ${
                    isExpanded 
                      ? 'bg-zinc-900 border-zinc-700 shadow-2xl z-20' 
                      : 'bg-transparent border-transparent hover:bg-zinc-900/30'
                  }`}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-center">
                      <h4 className={`text-[17px] font-semibold tracking-tight transition-colors ${isNext || isExpanded ? 'text-white' : 'text-zinc-400'}`}>
                        {spot.name}
                      </h4>
                      {isExpanded && (
                        <button className="bg-zinc-800 rounded-full p-1 text-zinc-400">
                          <ChevronUp size={16} />
                        </button>
                      )}
                    </div>

                    {/* Collapsed Badges */}
                    {!isExpanded && (
                      <div className="flex items-center gap-3 mt-1 pl-0.5">
                        {spot.type === 'hotel' && <span className="text-[10px] text-zinc-500 font-medium">Hotel</span>}
                        {spot.quests && spot.quests.length > 0 && <span className="text-[10px] text-[#0A84FF] font-medium flex items-center gap-1"><CheckCircle2 size={10}/> {spot.quests.length}</span>}
                      </div>
                    )}
                  </div>

                  {/* Expanded Content Area */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      >
                        {/* Hero Image */}
                        {spot.image && (
                          <div className="h-40 w-full relative mt-1">
                            <img src={spot.image} alt="Location" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
                            <div className="absolute bottom-3 left-4 right-4">
                              <p className="text-sm font-medium text-white/90 leading-snug drop-shadow-md">{spot.description}</p>
                            </div>
                          </div>
                        )}
                        
                        {!spot.image && spot.description && (
                          <div className="px-4 pb-2">
                            <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">{spot.description}</p>
                          </div>
                        )}

                        {/* Action Grid */}
                        <div className="p-4 space-y-4">
                          {/* 1. Missions */}
                          {spot.quests && (
                            <div className="bg-black/40 rounded-xl p-3 border border-white/5">
                              <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-2 flex items-center gap-1">
                                <CheckCircle2 size={10} /> Mission Objectives
                              </h5>
                              <ul className="space-y-2">
                                {spot.quests.map((q, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs font-medium text-zinc-300">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A84FF] mt-1.5 shrink-0 shadow-[0_0_5px_#0A84FF]" />
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 2. Info Columns */}
                          <div className="grid grid-cols-2 gap-3">
                            {spot.driverIntel && (
                              <div className="bg-blue-500/10 rounded-xl p-3 border border-blue-500/20">
                                <h5 className="text-[10px] font-bold text-blue-400 uppercase mb-1 flex items-center gap-1">
                                  <CarFront size={12} /> Driver
                                </h5>
                                <p className="text-[11px] text-blue-100/80 leading-snug">{spot.driverIntel.parking}</p>
                              </div>
                            )}
                            
                            {spot.gourmet && (
                              <div className="bg-orange-500/10 rounded-xl p-3 border border-orange-500/20">
                                <h5 className="text-[10px] font-bold text-orange-400 uppercase mb-1 flex items-center gap-1">
                                  <UtensilsCrossed size={12} /> Eat
                                </h5>
                                <div className="text-[11px] font-bold text-orange-100">{spot.gourmet.item}</div>
                                <div className="text-[10px] text-orange-200/60 mt-0.5">{spot.gourmet.price}</div>
                              </div>
                            )}
                          </div>

                          {/* 3. Facilities */}
                          {spot.specs && (
                            <div className="flex items-center gap-3 py-2 border-t border-white/5">
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold ${spot.specs.toilet === 'clean' ? 'text-blue-400' : 'text-zinc-500'}`}>
                                <Droplets size={12} /> {spot.specs.toilet === 'clean' ? 'CLEAN WC' : 'WC'}
                              </div>
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold ${spot.specs.smoking ? 'text-zinc-400' : 'text-zinc-700 line-through'}`}>
                                <Cigarette size={12} /> SMOKE
                              </div>
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold ${spot.specs.vending ? 'text-green-400' : 'text-zinc-700'}`}>
                                <ShoppingBag size={12} /> SHOP
                              </div>
                            </div>
                          )}

                          {/* 4. Action Button */}
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#007AFF] hover:bg-[#0062cc] active:scale-[0.98] rounded-xl text-xs font-bold text-white shadow-lg shadow-blue-900/30 transition-all"
                          >
                            <MapPin size={14} /> 
                            Open in Maps
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --- Wallet & Settings & Traffic ---

const WalletTab = () => {
  const { expenses, addExpense } = useNavStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Naoto');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const members = ['Naoto', 'Taira', 'Haga'];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: base64String }) });
        const data = await res.json();
        if (data.title && data.amount) { setTitle(data.title); setAmount(data.amount.toString()); } else { alert('金額を読み取れませんでした。'); }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) { console.error(error); setIsScanning(false); alert('スキャンエラー'); }
  };

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
      const debt = debtors[dIndex];
      const cred = creditors[cIndex];
      const move = Math.min(Math.abs(debt.balance), cred.balance);
      if (move > 0) { results.push({ from: debt.name, to: cred.name, amount: move }); debt.balance += move; cred.balance -= move; }
      if (Math.abs(debt.balance) < 1) dIndex++;
      if (cred.balance < 1) cIndex++;
    }
    return { total: totalCalc, settlements: results };
  }, [expenses]);

  const handleSubmit = () => { if (!title || !amount) return; addExpense(title, parseInt(amount), payer); setTitle(''); setAmount(''); };

  return (
    <div className="pt-32 pb-32 px-4 min-h-screen bg-black">
      <GlassCard className="p-6 mb-6 bg-gradient-to-br from-green-900/40 to-zinc-900/60 border-green-500/20">
        <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Total Budget</div>
        <div className="text-5xl font-thin font-mono text-white tracking-tighter">¥{total.toLocaleString()}</div>
      </GlassCard>

      <GlassCard className="p-4 mb-6">
        {isScanning && <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm rounded-[20px]"><Loader2 className="animate-spin text-green-500 mb-2" size={32} /><span className="text-xs font-bold text-green-400 animate-pulse">Scanning...</span></div>}
        <div className="space-y-4">
          <div className="flex gap-3 items-center border-b border-white/5 pb-2">
            <input type="text" placeholder="Description" value={title} onChange={e => setTitle(e.target.value)} className="flex-1 bg-transparent text-white outline-none placeholder:text-zinc-600" />
            <button onClick={() => fileInputRef.current?.click()} className="text-zinc-400 hover:text-white transition-colors"><ScanLine size={20}/></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <div className="flex gap-3 items-center border-b border-white/5 pb-2">
            <span className="text-zinc-500">¥</span>
            <input type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} className="flex-1 bg-transparent text-white font-mono text-lg outline-none placeholder:text-zinc-600" />
            <select value={payer} onChange={e => setPayer(e.target.value)} className="bg-transparent text-blue-400 font-bold outline-none text-right">
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full bg-white text-black font-bold py-3 rounded-xl active:scale-[0.98] transition-transform">Add Expense</button>
        </div>
      </GlassCard>

      {settlements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-2">Settlements</h3>
          {settlements.map((s, i) => (
            <GlassCard key={i} className="p-4 flex justify-between items-center bg-zinc-900/40">
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="text-red-400">{s.from}</span>
                <ArrowRight size={14} className="text-zinc-600"/>
                <span className="text-green-400">{s.to}</span>
              </div>
              <span className="font-mono text-white">¥{s.amount.toLocaleString()}</span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};

const TrafficTab = () => {
  const [region, setRegion] = useState<'kyushu' | 'chugoku' | 'kansai'>('kyushu');
  const [refreshKey, setRefreshKey] = useState(0);
  const accounts = { kyushu: { id: 'iHighwayKyushu', name: '九州エリア' }, chugoku: { id: 'iHighwayChugoku', name: '中国エリア' }, kansai: { id: 'iHighwayKansai', name: '関西エリア' }, };
  const handleRefresh = () => { setRefreshKey(prev => prev + 1); };
  return (
    <div className="pt-32 pb-32 px-4 h-full flex flex-col bg-black">
      <GlassCard className="p-4 mb-4 flex justify-between items-center bg-gradient-to-br from-red-900/30 to-zinc-900 border-red-500/30">
        <div><h2 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-1"><AlertTriangle className="animate-pulse" size={20} /> Traffic Intel</h2><p className="text-xs text-zinc-400">NEXCO West Live</p></div>
        <button onClick={handleRefresh} className="bg-zinc-800/50 p-2 rounded-full hover:bg-zinc-700 active:scale-95 transition-all text-zinc-400"><ScanLine size={18} /></button>
      </GlassCard>
      <GlassCard className="p-1 mb-4 flex gap-1">
        {(Object.keys(accounts) as Array<keyof typeof accounts>).map((key) => (
          <button key={key} onClick={() => { setRegion(key); setRefreshKey(prev => prev + 1); }} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${region === key ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>{accounts[key].name}</button>
        ))}
      </GlassCard>
      <div className="flex-1 overflow-y-auto rounded-xl"><TwitterFeed key={`${region}-${refreshKey}`} id={accounts[region].id} /></div>
    </div>
  );
};

const SettingsTab = () => {
  const { currentUser, expenses, resetAllData, refreshRouteData } = useNavStore();
  const MenuLink = ({ icon: Icon, label, value, color = "bg-zinc-700", onClick, destructive }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-zinc-900/40 backdrop-blur-md active:bg-zinc-800 transition-colors cursor-pointer border-b border-white/5 last:border-0 first:rounded-t-2xl last:rounded-b-2xl">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center text-white shadow-sm`}>
          <Icon size={14} />
        </div>
        <span className={`text-sm font-medium ${destructive ? 'text-red-500' : 'text-white'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-zinc-500">{value}</span>}
        <ChevronRight size={14} className="text-zinc-600" />
      </div>
    </div>
  );

  return (
    <div className="pt-32 pb-32 px-4 min-h-screen bg-black">
      <div className="mb-8 px-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">Settings</h2>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2">Sync</h3>
          <div className="rounded-2xl overflow-hidden">
            <MenuLink icon={Activity} label="Refresh Route" color="bg-blue-500" onClick={() => { if(refreshRouteData){ refreshRouteData(); window.location.reload(); }}} />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2">Profile</h3>
          <div className="rounded-2xl overflow-hidden">
            <MenuLink icon={User} label="Pilot Name" value={currentUser} color="bg-zinc-600" />
            <MenuLink icon={Wallet} label="Records" value={`${expenses.length} recs`} color="bg-green-500" />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2">Danger Zone</h3>
          <div className="rounded-2xl overflow-hidden">
            <MenuLink icon={Trash2} label="Reset All Data" color="bg-red-500" destructive onClick={() => { if(resetAllData && confirm('Reset?')) resetAllData(); }} />
          </div>
        </div>
      </div>
      <div className="mt-12 text-center text-[10px] text-zinc-600 font-mono">
        Designed by Apple Inspiration<br/>v3.0.1
      </div>
    </div>
  );
};

// --- Bottom Navigation (Apple Style) ---
const BottomNav = ({ active, onChange }: { active: string, onChange: (t: any) => void }) => {
  const NavItem = ({ id, icon: Icon, label }: any) => {
    const isActive = active === id;
    return (
      <button 
        onClick={() => onChange(id)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-[#0A84FF]' : 'text-zinc-500 hover:text-zinc-300'}`}
      >
        <motion.div
          animate={{ y: isActive ? -2 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon size={24} strokeWidth={isActive ? 2.5 : 2} fill={isActive ? "currentColor" : "none"} className={isActive ? "opacity-100" : "opacity-80"} />
        </motion.div>
        <span className="text-[10px] font-medium mt-1 tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[88px] bg-black/80 backdrop-blur-xl border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center h-full max-w-md mx-auto px-2 pb-4">
        <NavItem id="command" icon={Navigation} label="Command" />
        <NavItem id="traffic" icon={AlertTriangle} label="Traffic" />
        <NavItem id="wallet" icon={Wallet} label="Wallet" />
        <NavItem id="guide" icon={Activity} label="Guide" />
        <NavItem id="settings" icon={Settings} label="Settings" />
      </div>
    </div>
  );
};

// --- Main Component ---
export const CoPilotPage: React.FC = () => {
  const { sendNotification, currentUser } = useNavStore();
  const [activeTab, setActiveTab] = useState<'command' | 'wallet' | 'guide' | 'traffic' | 'settings'>('command');

  const handleSend = (type: 'rest' | 'music' | 'info', msg: string) => {
    sendNotification({ id: crypto.randomUUID(), type, message: msg, sender: currentUser || "Co-Pilot" });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500/30">
      <TelemetryHeader />

      <main className="min-h-screen">
        <AnimatePresence mode="wait">
          {activeTab === 'command' && (
            <motion.div key="command" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-32 pb-32 px-4">
              <div className="mb-6"><DJPanel /></div>
              <JudgePanel />
              <h2 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-1 mt-8">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <GlassCard className="p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform" >
                  <button onClick={() => handleSend('rest', 'トイレ行きたい')} className="w-full h-full flex flex-col items-center"><Coffee className="text-orange-400 mb-1" size={24} /> <span className="text-xs font-bold">Rest</span></button>
                </GlassCard>
                <GlassCard className="p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform">
                  <button onClick={() => handleSend('info', 'コンビニ寄りたい')} className="w-full h-full flex flex-col items-center"><Wallet className="text-blue-400 mb-1" size={24} /> <span className="text-xs font-bold">Store</span></button>
                </GlassCard>
              </div>
            </motion.div>
          )}

          {activeTab === 'wallet' && <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WalletTab /></motion.div>}
          {activeTab === 'guide' && <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GuideTab /></motion.div>}
          {activeTab === 'traffic' && <motion.div key="traffic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TrafficTab /></motion.div>}
          {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SettingsTab /></motion.div>}
        </AnimatePresence>
      </main>

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
};