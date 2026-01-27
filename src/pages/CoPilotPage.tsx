import React, { useState, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Music, MapPin, Navigation, 
  Wallet, Activity, AlertTriangle, ScanLine, 
  Play, Pause, SkipForward,
  CheckCircle2, UtensilsCrossed, ShoppingBag,
  Settings, ChevronRight, User, Trash2,
  Sun, CloudRain, 
  Gavel, Coffee, Wind,
  ChevronUp, CarFront, Cigarette, Droplets
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotify } from '../hooks/useSpotify';
import { TwitterFeed } from '../components/widgets/TwitterFeed';

// --- Apple UI Components ---

const IOSCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    layout
    whileTap={{ scale: 0.98 }}
    transition={{ type: "spring", stiffness: 400, damping: 30 }}
    onClick={onClick}
    className={`bg-[#1c1c1e]/80 backdrop-blur-xl border border-white/5 rounded-[24px] shadow-lg overflow-hidden ${className}`}
  >
    {children}
  </motion.div>
);

const IOSTitle = ({ children, subtitle }: { children: React.ReactNode, subtitle?: string }) => (
  <div className="mb-6 px-2">
    <h2 className="text-[34px] font-bold text-white leading-tight tracking-tight">{children}</h2>
    {subtitle && <p className="text-zinc-500 font-medium text-[17px] mt-1">{subtitle}</p>}
  </div>
);

// --- Telemetry Dynamic Island ---
const DynamicHeader = () => {
  const { currentSpeed, nextWaypointEta, currentAreaText, activeNotification, waypoints } = useNavStore();
  const nextPoint = waypoints.find(w => w.type !== 'start' && w.type !== 'pickup') || waypoints[1];
  const weather = nextPoint?.weather || { type: 'sunny', temp: '--' };

  return (
    <motion.div 
      initial={{ y: -100 }} animate={{ y: 0 }} 
      className="fixed top-safe left-4 right-4 z-50 flex justify-center pointer-events-none"
    >
      <div className="bg-black/80 backdrop-blur-2xl border border-white/10 rounded-full py-3 px-6 flex items-center gap-6 shadow-2xl pointer-events-auto min-w-[320px] justify-between">
        
        {/* Speed */}
        <div className="flex flex-col items-center min-w-[60px]">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Km/h</span>
          <span className="text-2xl font-black text-white font-mono leading-none">{currentSpeed}</span>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-white/10" />

        {/* Location & ETA */}
        <div className="flex-1 flex flex-col items-center text-center">
          <div className="flex items-center gap-1.5 text-white font-bold text-sm truncate max-w-[140px]">
            <Navigation size={12} className="text-blue-500 fill-blue-500" />
            {currentAreaText}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-zinc-400 font-mono">ETA {nextWaypointEta}</span>
            <span className="text-[11px] text-zinc-600">•</span>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400">
              {weather.type === 'rain' ? <CloudRain size={10} /> : <Sun size={10} />}
              {weather.temp}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-8 bg-white/10" />

        {/* Status */}
        <div className="flex flex-col items-center min-w-[40px]">
          <div className={`w-2 h-2 rounded-full mb-1 ${activeNotification ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-[9px] text-zinc-500 font-bold">LINK</span>
        </div>
      </div>
    </motion.div>
  );
};

// --- Widget: Now Playing ---
const NowPlayingWidget = () => {
  const { token, track, isPlaying, handleLogin, handleNext, handlePlayPause } = useSpotify();

  if (!token) return (
    <IOSCard className="col-span-2 aspect-[2/1] flex flex-col items-center justify-center bg-gradient-to-br from-green-900/20 to-[#1c1c1e]">
      <button onClick={handleLogin} className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 bg-[#1DB954] rounded-full flex items-center justify-center shadow-lg shadow-green-900/50">
          <Music className="text-black ml-1" size={24} />
        </div>
        <span className="text-sm font-bold text-white">Connect Spotify</span>
      </button>
    </IOSCard>
  );

  return (
    <IOSCard className="col-span-2 relative group overflow-hidden">
      {track?.album.images[0]?.url && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 blur-3xl scale-150 transition-all duration-1000 group-hover:opacity-40"
          style={{ backgroundImage: `url(${track.album.images[0].url})` }}
        />
      )}
      <div className="relative z-10 p-5 flex items-center gap-5 h-full">
        <motion.img 
          key={track?.id}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={track?.album.images[0]?.url} 
          alt="Art" 
          className={`w-28 h-28 rounded-xl shadow-2xl ${isPlaying ? 'scale-100' : 'scale-95 grayscale opacity-80'} transition-all duration-700`}
        />
        <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-2">
          <div>
            <h3 className="text-xl font-bold text-white leading-tight truncate">{track?.name || "Not Playing"}</h3>
            <p className="text-base text-white/60 truncate mt-1">{track?.artists.map((a:any) => a.name).join(', ')}</p>
          </div>
          <div className="flex items-center gap-6 mt-5">
            <button onClick={handlePlayPause} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>
            <button onClick={handleNext} className="text-white/70 hover:text-white transition-colors">
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>
    </IOSCard>
  );
};

// --- Widget: Quick Actions ---
const QuickActionWidget = ({ icon: Icon, label, color, onClick }: any) => (
  <IOSCard onClick={onClick} className="aspect-square flex flex-col justify-between p-4 bg-[#2c2c2e]/50 hover:bg-[#3a3a3c] transition-colors border-none">
    <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white`}>
      <Icon size={20} />
    </div>
    <span className="font-bold text-sm text-white leading-tight">{label}</span>
  </IOSCard>
);

// --- Widget: The Judge ---
const JudgeWidget = () => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const members = ['Naoto', 'Taira', 'Haga'];

  const spin = () => {
    if(loading) return;
    setLoading(true);
    setResult(null);
    let i = 0;
    const interval = setInterval(() => {
      setResult(members[Math.floor(Math.random() * members.length)]);
      i++;
      if (i > 12) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 80);
  };

  return (
    <IOSCard className="col-span-2 p-5 bg-gradient-to-br from-[#FFD60A]/10 to-[#1c1c1e]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-1">The Judge</h3>
          <div className="text-2xl font-black text-white">{result || "Ready?"}</div>
        </div>
        <Gavel className="text-[#FFD60A]" size={24} />
      </div>
      <div className="flex gap-3">
        <button onClick={() => spin()} className="flex-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] py-3 rounded-xl text-xs font-bold text-white transition-all active:scale-95">
          Who Pays?
        </button>
        <button onClick={() => spin()} className="flex-1 bg-[#2c2c2e] hover:bg-[#3a3a3c] py-3 rounded-xl text-xs font-bold text-white transition-all active:scale-95">
          Next Driver
        </button>
      </div>
    </IOSCard>
  );
};

// --- Screen: Dashboard ---
const DashboardScreen = () => {
  const { sendNotification, currentUser } = useNavStore();
  const handleSend = (type: string, msg: string) => {
    sendNotification({ id: crypto.randomUUID(), type: type as any, message: msg, sender: currentUser || "Co-Pilot" });
  };

  return (
    <div className="p-4 pt-32 pb-32 space-y-6">
      <IOSTitle subtitle="Command Center">Dashboard</IOSTitle>
      
      <div className="grid grid-cols-2 gap-4">
        <NowPlayingWidget />
        <QuickActionWidget icon={Coffee} label="Rest Request" color="bg-orange-500" onClick={() => handleSend('rest', 'トイレ休憩希望')} />
        <QuickActionWidget icon={ShoppingBag} label="Store Stop" color="bg-blue-500" onClick={() => handleSend('info', 'コンビニ寄りたい')} />
        <QuickActionWidget icon={Wind} label="Smoke Break" color="bg-zinc-500" onClick={() => handleSend('rest', 'タバコ休憩')} />
        <QuickActionWidget icon={UtensilsCrossed} label="Food Search" color="bg-red-500" onClick={() => handleSend('info', 'ご飯探して')} />
        <JudgeWidget />
      </div>
    </div>
  );
};

// --- ★ Guide Tab (Layout Fixed Ver.) ---
const GuideScreen = () => {
  const { waypoints, nextWaypoint } = useNavStore();
  const nextWaypointId = nextWaypoint?.id;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const days = [
    { id: 'start', label: 'Day 0', sub: 'Night Cruise' },
    { id: 'ise_jingu', label: 'Day 1', sub: 'Mie & Ise' },
    { id: 'metasequoia', label: 'Day 2', sub: 'Shiga & Kobe' },
    { id: 'hiroshima_okonomi', label: 'Day 3', sub: 'Return' },
  ];

  const activeIndex = waypoints.findIndex(w => w.id === nextWaypointId);

  // レイアウト設定: 左側のスペースを十分に取る
  const TIMELINE_LEFT = 70; // 線の左位置
  const DOT_LEFT = 65;      // ドットの左位置 (LINE - 5px)
  const CONTENT_PAD = 96;   // コンテンツの左パディング

  return (
    <div className="pt-28 pb-32 bg-black min-h-screen">
      <div className="px-6 mb-4">
        <h2 className="text-[34px] font-bold text-white">Timeline</h2>
      </div>
      
      <div className="relative">
        {/* Timeline Line (Static Gray) */}
        <div 
          className="absolute top-0 bottom-0 w-[2px] bg-zinc-800 rounded-full" 
          style={{ left: TIMELINE_LEFT }} 
        />
        
        {/* Progress Line (Blue Dynamic) */}
        <motion.div 
          initial={{ height: 0 }}
          animate={{ height: `${(Math.max(0, activeIndex) / waypoints.length) * 100}%` }}
          className="absolute top-0 w-[2px] bg-[#0A84FF] rounded-full z-0 shadow-[0_0_10px_#0A84FF]"
          style={{ left: TIMELINE_LEFT }}
        />

        {waypoints.map((spot, index) => {
          const isNext = spot.id === nextWaypointId;
          const isPast = index < activeIndex;
          const isDayHeader = days.find(d => d.id === spot.id);
          const isExpanded = expandedId === spot.id;

          return (
            <React.Fragment key={spot.id}>
              {/* Day Header (Sticky) */}
              {isDayHeader && (
                <div className="sticky top-[110px] z-20 bg-black/90 backdrop-blur-xl border-y border-white/10 py-2 px-6 mb-6 mt-2 flex items-baseline justify-between shadow-md">
                  <span className="text-lg font-bold text-white">{isDayHeader.label}</span>
                  <span className="text-xs font-semibold text-zinc-500 uppercase">{isDayHeader.sub}</span>
                </div>
              )}

              <div className="relative mb-4 group" style={{ minHeight: '60px' }}>
                {/* 1. Time Stamp (Left Side) */}
                <div className="absolute left-0 top-3 w-[60px] text-right pr-2">
                  <span className={`text-[11px] font-mono font-bold tracking-tight ${isNext ? 'text-[#0A84FF]' : isPast ? 'text-zinc-600' : 'text-zinc-400'}`}>
                    {spot.scheduledTime}
                  </span>
                </div>

                {/* 2. Timeline Dot (Center) */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : spot.id)}
                  className="absolute top-[14px] z-10 cursor-pointer"
                  style={{ left: DOT_LEFT }}
                >
                  <motion.div 
                    animate={{ 
                      scale: isNext ? 1.3 : 1,
                      backgroundColor: isNext ? '#0A84FF' : isPast ? '#27272a' : '#52525b',
                      borderColor: isNext ? 'rgba(10, 132, 255, 0.3)' : '#000'
                    }}
                    className={`w-3 h-3 rounded-full border-[3px] box-content shadow-lg transition-colors duration-500`}
                  />
                  {/* Pulse Animation for Next WP */}
                  {isNext && (
                    <motion.div 
                      animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                      className="absolute inset-0 bg-[#0A84FF] rounded-full -z-10"
                    />
                  )}
                </div>

                {/* 3. Content Card (Right Side) */}
                <motion.div
                  layout
                  onClick={() => setExpandedId(isExpanded ? null : spot.id)}
                  className={`relative mr-4 rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer
                    ${isExpanded ? 'bg-[#1c1c1e] border-zinc-700 shadow-2xl z-20' : 'bg-transparent border-transparent hover:bg-zinc-900/30'}
                  `}
                  style={{ marginLeft: CONTENT_PAD }}
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start">
                      <h3 className={`text-[16px] font-semibold leading-snug ${isNext || isExpanded ? 'text-white' : 'text-zinc-400'}`}>
                        {spot.name}
                      </h3>
                      {isExpanded && <ChevronUp size={16} className="text-zinc-500 ml-2 shrink-0" />}
                    </div>
                    
                    {!isExpanded && (
                      <div className="flex items-center gap-2 mt-1">
                        {spot.type === 'hotel' && <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold">HOTEL</span>}
                        {spot.quests && spot.quests.length > 0 && <span className="text-[9px] text-[#0A84FF] flex items-center gap-0.5 font-bold"><CheckCircle2 size={10}/> {spot.quests.length}</span>}
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        {spot.image && (
                          <div className="h-32 w-full relative">
                            <img src={spot.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e] to-transparent opacity-80" />
                            <div className="absolute bottom-2 left-3 right-3">
                              <p className="text-xs text-zinc-300 leading-relaxed font-medium drop-shadow-md">{spot.description}</p>
                            </div>
                          </div>
                        )}
                        {!spot.image && spot.description && (
                          <div className="px-3 pb-2 text-xs text-zinc-400 leading-relaxed border-l-2 border-zinc-700 ml-3 mb-2">
                            {spot.description}
                          </div>
                        )}

                        {/* Specs (Toilet, Smoking, Vending) */}
                        {spot.specs && (
                          <div className="flex flex-wrap gap-2 mb-3 px-3">
                            {spot.specs.toilet && (
                              <div className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded border ${spot.specs.toilet === 'clean' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                <Droplets size={12} />
                                {spot.specs.toilet === 'clean' ? 'Clean WC' : 'Restroom'}
                              </div>
                            )}
                            {spot.specs.smoking && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                <Cigarette size={12} />
                                Smoking Area
                              </div>
                            )}
                            {spot.specs.vending && (
                              <div className="flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded bg-green-900/20 text-green-400 border border-green-500/20">
                                <ShoppingBag size={12} />
                                Vending
                              </div>
                            )}
                          </div>
                        )}

                        <div className="p-3 pt-0 space-y-3">
                          {/* Missions */}
                          {spot.quests && (
                            <div className="bg-black/30 rounded-xl p-2 border border-white/5">
                              <div className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Missions</div>
                              <ul className="space-y-1">
                                {spot.quests.map((q, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                                    <span className="w-1 h-1 rounded-full bg-[#0A84FF] mt-1.5 shrink-0" />
                                    {q}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Driver & Info */}
                          <div className="grid grid-cols-2 gap-2">
                            {spot.driverIntel && (
                              <div className="bg-blue-900/10 rounded-lg p-2 border border-blue-500/20">
                                <div className="text-[9px] font-bold text-blue-400 uppercase mb-0.5 flex items-center gap-1"><CarFront size={10}/> Driver</div>
                                <p className="text-[10px] text-blue-100/80 leading-tight">{spot.driverIntel.parking}</p>
                              </div>
                            )}
                            {/* Gourmet */}
                            {spot.gourmet && (
                              <div className="bg-orange-500/10 rounded-lg p-2 border border-orange-500/20">
                                <div className="text-[9px] font-bold text-orange-400 uppercase mb-0.5 flex items-center gap-1"><UtensilsCrossed size={10}/> Eat</div>
                                <div className="text-[10px] font-bold text-orange-100 leading-tight">{spot.gourmet.item}</div>
                                <div className="text-[9px] text-orange-200/60 leading-tight">{spot.gourmet.price}</div>
                              </div>
                            )}
                          </div>

                          {/* Map Button */}
                          <a 
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name)}`}
                            target="_blank" rel="noreferrer"
                            className="flex items-center justify-center w-full py-2.5 bg-[#007AFF] text-white text-xs font-bold rounded-lg active:scale-[0.98] transition-transform shadow-lg shadow-blue-900/20"
                          >
                            <Navigation size={14} className="mr-1.5" /> Open Maps
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

// --- Screen: Wallet ---
const WalletScreen = () => {
  const { expenses, addExpense } = useNavStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const payer = 'Naoto'; 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: reader.result }) });
      const data = await res.json();
      if(data.title) { setTitle(data.title); setAmount(data.amount); }
    };
    reader.readAsDataURL(file);
  };

  const add = () => {
    if(!title || !amount) return;
    addExpense(title, parseInt(amount), payer);
    setTitle(''); setAmount('');
  };

  return (
    <div className="pt-28 pb-32 px-4 bg-black min-h-screen">
      <IOSTitle subtitle="Shared Expenses">Wallet</IOSTitle>

      <div className="relative h-48 rounded-[24px] bg-gradient-to-br from-[#1c1c1e] to-black border border-white/10 p-6 flex flex-col justify-between overflow-hidden mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-32 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="relative z-10 flex justify-between items-start">
          <Wallet className="text-white/50" />
          <span className="text-xs font-bold text-zinc-500 border border-zinc-700 px-2 py-1 rounded-full">TRAVEL CARD</span>
        </div>
        <div className="relative z-10">
          <span className="text-zinc-400 text-sm font-medium">Total Spent</span>
          <div className="text-4xl font-bold text-white font-mono tracking-tight mt-1">¥{total.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-[#1c1c1e] rounded-[20px] p-1 mb-6 flex items-center shadow-lg">
        <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-800 rounded-2xl text-zinc-400 hover:text-white transition-colors">
          <ScanLine size={20} />
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Item" className="bg-transparent text-white px-3 py-2 outline-none w-full text-sm font-medium placeholder:text-zinc-600" />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="¥0" type="number" className="bg-transparent text-white px-2 py-2 outline-none w-24 text-sm font-mono placeholder:text-zinc-600" />
        <button onClick={add} className="bg-blue-600 text-white p-3 rounded-2xl font-bold text-sm ml-1 hover:bg-blue-500 transition-colors">Add</button>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-bold text-zinc-500 uppercase px-4 mb-2">Recent Activity</h3>
        {expenses.slice().reverse().map((ex) => (
          <div key={ex.id} className="flex justify-between items-center p-4 bg-[#1c1c1e]/50 border-b border-white/5 last:border-0 first:rounded-t-2xl last:rounded-b-2xl backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">{ex.payer.charAt(0)}</div>
              <span className="text-sm font-medium text-white">{ex.title}</span>
            </div>
            <span className="text-sm font-mono text-zinc-300">- ¥{ex.amount.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Screen: Settings ---
const SettingsScreen = () => {
  const { currentUser, resetAllData } = useNavStore();
  const Cell = ({ label, value, icon: Icon, color, isDestructive, onClick }: any) => (
    <div onClick={onClick} className="flex items-center justify-between p-4 bg-[#1c1c1e] active:bg-[#2c2c2e] transition-colors border-b border-white/5 last:border-0 cursor-pointer">
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-[6px] ${color} flex items-center justify-center text-white`}><Icon size={16} /></div>
        <span className={`text-[17px] ${isDestructive ? 'text-red-500' : 'text-white'}`}>{label}</span>
      </div>
      <div className="flex items-center gap-2">{value && <span className="text-[17px] text-zinc-500">{value}</span>}<ChevronRight size={16} className="text-zinc-600" /></div>
    </div>
  );

  return (
    <div className="pt-28 pb-32 px-4 bg-black min-h-screen">
      <IOSTitle>Settings</IOSTitle>
      <div className="rounded-[12px] overflow-hidden mb-6"><Cell label="User Profile" value={currentUser} icon={User} color="bg-blue-500" /><Cell label="Notifications" icon={Activity} color="bg-red-500" /></div>
      <div className="rounded-[12px] overflow-hidden mb-6"><Cell label="Traffic Data" icon={AlertTriangle} color="bg-green-500" /><Cell label="Display" icon={Sun} color="bg-blue-600" /></div>
      <div className="rounded-[12px] overflow-hidden"><Cell label="Reset All Data" icon={Trash2} color="bg-zinc-700" isDestructive onClick={() => { if(confirm('Reset?')) resetAllData(); }} /></div>
      <p className="text-center text-zinc-600 text-xs mt-8">Serena Navi Pro v3.0<br/>Designed in California Style</p>
    </div>
  );
};

// --- Bottom Dock ---
const Dock = ({ active, onChange }: { active: string, onChange: (v: any) => void }) => {
  const items = [
    { id: 'dashboard', icon: Activity },
    { id: 'guide', icon: MapPin },
    { id: 'traffic', icon: AlertTriangle },
    { id: 'wallet', icon: Wallet },
    { id: 'settings', icon: Settings },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-[#1c1c1e]/80 backdrop-blur-2xl border border-white/10 rounded-full px-2 py-2 flex items-center gap-1 shadow-2xl pointer-events-auto">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onChange(item.id)}
              whileTap={{ scale: 0.85 }}
              animate={{ width: isActive ? 50 : 44, backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent' }}
              className="h-11 rounded-full flex items-center justify-center text-white relative"
            >
              <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-white' : 'text-zinc-400'} />
              {isActive && <motion.div layoutId="active-dot" className="absolute -bottom-1 w-1 h-1 bg-white rounded-full" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

// --- Main Page Component ---
export const CoPilotPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const TrafficScreen = () => (
    <div className="pt-28 pb-32 px-4 bg-black min-h-screen">
      <IOSTitle>Traffic Intel</IOSTitle>
      <div className="h-[60vh] bg-[#1c1c1e] rounded-[24px] overflow-hidden border border-white/5"><TwitterFeed id="iHighwayKyushu" /></div>
    </div>
  );

  return (
    <div className="bg-black min-h-screen text-white font-sans selection:bg-blue-500/30">
      <DynamicHeader />
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><DashboardScreen /></motion.div>}
          {activeTab === 'guide' && <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><GuideScreen /></motion.div>}
          {activeTab === 'wallet' && <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><WalletScreen /></motion.div>}
          {activeTab === 'traffic' && <motion.div key="traffic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><TrafficScreen /></motion.div>}
          {activeTab === 'settings' && <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><SettingsScreen /></motion.div>}
        </AnimatePresence>
      </main>
      <Dock active={activeTab} onChange={setActiveTab} />
    </div>
  );
};