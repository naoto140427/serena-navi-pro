import React, { useState, useMemo, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Coffee, Music, MapPin, Navigation, ArrowRight, 
  Wallet, Activity, AlertTriangle, ScanLine, 
  Clock, Radio, Loader2,
  Play, Pause, SkipForward, LogIn, X, ExternalLink,
  CheckCircle2, CarFront, UtensilsCrossed, Cigarette, Droplets, ShoppingBag,
  Settings, ChevronRight, User, Bell, Trash2, Info,
  Sun, Cloud, CloudRain, Snowflake, Moon, Gavel, ShieldCheck, Gauge
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpotify } from '../hooks/useSpotify';
import { TwitterFeed } from '../components/widgets/TwitterFeed';

// --- Telemetry Header ---
const TelemetryHeader = () => {
  const { currentSpeed, nextWaypointEta, currentAreaText, activeNotification, waypoints } = useNavStore();
  
  // 次のウェイポイント（観光地・PA・ホテル）を簡易的に取得
  const nextPoint = waypoints.find(w => 
    w.type === 'sightseeing' || w.type === 'parking' || w.type === 'hotel'
  ) || waypoints[1];

  const weather = nextPoint?.weather || { type: 'sunny', temp: '24°C' };

  const WeatherIcon = () => {
    switch (weather.type) {
      case 'rain': return <CloudRain size={14} className="text-blue-400" />;
      case 'cloudy': return <Cloud size={14} className="text-gray-400" />;
      case 'snow': return <Snowflake size={14} className="text-white" />;
      default: return <Sun size={14} className="text-orange-500" />;
    }
  };

  const scheduled = nextPoint?.scheduledTime || "--:--";
  
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 p-4 sticky top-0 z-30 backdrop-blur-xl bg-opacity-80">
      <div className="flex justify-between items-end mb-2">
        <div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={10} /> CURRENT LOCATION
          </div>
          <div className="text-sm font-bold text-white truncate max-w-[200px]">{currentAreaText}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500 uppercase tracking-widest">SPEED</div>
          <div className="text-2xl font-black text-white font-mono leading-none">
            {currentSpeed} <span className="text-xs font-normal text-zinc-600">km/h</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 bg-black/40 rounded-lg p-2 border border-zinc-800/50">
        <div className="flex-1 flex items-center gap-2 border-r border-zinc-800">
          <Clock size={14} className="text-blue-500" />
          <div>
            <div className="text-[9px] text-zinc-500 uppercase">PLAN / ETA</div>
            <div className="text-xs font-bold font-mono text-zinc-200">
              {scheduled} <span className="text-zinc-600">/</span> {nextWaypointEta}
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 border-r border-zinc-800">
          <WeatherIcon />
          <div>
            <div className="text-[9px] text-zinc-500 uppercase">WEATHER</div>
            <div className="text-xs font-bold font-mono text-zinc-200">{weather.temp}</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2">
          <Radio size={14} className={activeNotification ? "text-green-500 animate-pulse" : "text-zinc-600"} />
          <div>
            <div className="text-[9px] text-zinc-500 uppercase">LINK</div>
            <div className="text-xs font-bold text-zinc-200">{activeNotification ? "ACTIVE" : "READY"}</div>
          </div>
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
        <div className="w-16 h-16 bg-[#1DB954] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
          <Music className="text-black" size={32} />
        </div>
        <h3 className="text-white font-bold mb-2">Connect to Car Audio</h3>
        <p className="text-zinc-500 text-xs mb-4">Spotifyと連携してDJを始めよう</p>
        <button 
          onClick={handleLogin}
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 mx-auto transition-all active:scale-95"
        >
          <LogIn size={18} /> Login with Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-green-900/40 to-zinc-900/40 border border-[#1DB954]/30 rounded-2xl p-4 relative overflow-hidden">
        {track ? (
          <div className="flex items-center gap-4 relative z-10">
            <img 
              src={track.album.images[0]?.url} 
              alt="Album Art" 
              className={`w-20 h-20 rounded-xl shadow-xl ${isPlaying ? 'animate-pulse' : 'grayscale opacity-70'}`}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[#1DB954] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Music size={10} /> SPOTIFY LINKED
              </div>
              <h3 className="text-lg font-bold text-white leading-tight truncate">{track.name}</h3>
              <p className="text-sm text-zinc-400 truncate">{track.artists.map((a:any) => a.name).join(', ')}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-20 text-zinc-500 text-sm">
            停止中または広告再生中...
          </div>
        )}

        <div className="flex justify-around items-center mt-4 border-t border-white/10 pt-3">
          <button onClick={handlePlayPause} className="p-3 text-white hover:text-[#1DB954] transition-colors">
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button onClick={handleNext} className="p-3 text-white hover:text-[#1DB954] transition-colors active:scale-90">
            <SkipForward size={28} />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- The JUDGE ---
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
      if (count > 15) {
        clearInterval(interval);
        setIsSpinning(false);
        setResult(members[Math.floor(Math.random() * members.length)]);
      }
    }, 100);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl mb-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
           <Gavel size={14} /> THE JUDGE {mode ? `- ${mode}` : ''}
        </h3>
        <div className={`text-xl font-black font-mono tracking-wider ${isSpinning ? 'text-zinc-500 animate-pulse' : 'text-yellow-400'}`}>
          {result || "READY"}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => handleSpin('PAY')}
          disabled={isSpinning}
          className="bg-zinc-800 hover:bg-red-900/30 border border-zinc-700 hover:border-red-500 text-zinc-300 hover:text-red-400 p-3 rounded-lg font-bold text-xs transition-all active:scale-95 flex flex-col items-center gap-1 group"
        >
          <Wallet size={18} className="group-hover:animate-bounce" />
          WHO PAYS?
        </button>
        <button 
          onClick={() => handleSpin('DRIVE')}
          disabled={isSpinning}
          className="bg-zinc-800 hover:bg-blue-900/30 border border-zinc-700 hover:border-blue-500 text-zinc-300 hover:text-blue-400 p-3 rounded-lg font-bold text-xs transition-all active:scale-95 flex flex-col items-center gap-1 group"
        >
          <CarFront size={18} className="group-hover:animate-bounce" />
          NEXT DRIVER?
        </button>
      </div>

      {!isSpinning && result && (
        <div className="absolute inset-0 border-2 border-yellow-500/50 rounded-xl animate-pulse pointer-events-none" />
      )}
    </div>
  );
};

// --- Wallet Tab ---
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
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String }),
        });
        const data = await res.json();
        if (data.title && data.amount) {
          setTitle(data.title);
          setAmount(data.amount.toString());
        } else {
          alert('金額を読み取れませんでした。もう一度試してください。');
        }
        setIsScanning(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      alert('スキャンエラー');
    }
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
      if (move > 0) {
        results.push({ from: debt.name, to: cred.name, amount: move });
        debt.balance += move;
        cred.balance -= move;
      }
      if (Math.abs(debt.balance) < 1) dIndex++;
      if (cred.balance < 1) cIndex++;
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
    <div className="space-y-6 pb-24 px-4">
      <div className="bg-gradient-to-br from-green-900/50 to-zinc-900 border border-green-500/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Total Budget</div>
          <div className="text-4xl font-bold text-white font-mono">¥{total.toLocaleString()}</div>
        </div>
        <Wallet className="absolute -right-4 -bottom-4 text-green-500/10 w-32 h-32" />
      </div>

      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden">
        {isScanning && (
          <div className="absolute inset-0 bg-black/80 z-20 flex flex-col items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-green-500 mb-2" size={32} />
            <span className="text-xs font-bold text-green-400 animate-pulse">AI ANALYZING...</span>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="品目 (例: ガソリン)" value={title} onChange={e => setTitle(e.target.value)}
              className="flex-1 bg-black/50 border border-zinc-700 rounded-xl p-3 text-white focus:border-green-500 outline-none" />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment"
              onChange={handleFileChange} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-zinc-800 hover:bg-zinc-700 text-green-400 border border-zinc-700 rounded-xl w-12 flex items-center justify-center transition-colors"
            >
              <ScanLine size={20} />
            </button>
          </div>

          <div className="flex gap-3">
            <input type="number" placeholder="金額" value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-black/50 border border-zinc-700 rounded-xl p-3 text-white font-mono focus:border-green-500 outline-none" />
            <select value={payer} onChange={e => setPayer(e.target.value)}
              className="w-1/3 bg-black/50 border border-zinc-700 rounded-xl p-3 text-white outline-none">
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
            Add Expense
          </button>
        </div>
      </div>

      {settlements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-1">Settlement Plan</h3>
          {settlements.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-bold text-red-400">{s.from}</span>
                <ArrowRight size={12} className="text-zinc-600" />
                <span className="font-bold text-green-400">{s.to}</span>
              </div>
              <span className="font-mono font-bold text-white text-sm">¥{s.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- Guide Tab ---
const GuideTab = () => {
  const { waypoints } = useNavStore();
  const [selectedSpot, setSelectedSpot] = useState<any>(null);

  const guideSpots = waypoints.filter(w => 
    w.description || w.quests || w.type === 'sightseeing' || w.type === 'hotel' || w.driverIntel
  );

  return (
    <div className="pb-24 px-4 relative">
      <h3 className="text-xs font-bold text-zinc-500 uppercase mb-4 px-1">FIELD MANUAL</h3>
      
      <div className="grid gap-4">
        {guideSpots.map((spot) => (
          <motion.button
            key={spot.id}
            layoutId={`card-${spot.id}`}
            onClick={() => setSelectedSpot(spot)}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden text-left relative group w-full shadow-lg"
          >
            <div className="h-36 w-full relative overflow-hidden">
              {spot.image ? (
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              ) : (
                <div className="w-full h-full bg-zinc-800" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
              
              <div className="absolute top-2 right-2 bg-black/40 backdrop-blur-md p-2 rounded-lg border border-white/10 shadow-lg">
                 {spot.type === 'hotel' ? <div className="text-xs">🏨</div> : 
                  spot.type === 'sightseeing' ? <div className="text-xs">📸</div> : 
                  spot.type === 'parking' ? <div className="text-xs">🅿️</div> : 
                  <div className="text-xs">📍</div>}
              </div>
              
              {spot.budget && (
                <div className="absolute top-2 left-2 bg-green-900/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-green-400 border border-green-500/30">
                  {spot.budget}
                </div>
              )}
            </div>

            <div className="p-5 -mt-8 relative z-10">
              <h3 className="font-bold text-xl text-white leading-tight mb-2 drop-shadow-md">{spot.name}</h3>
              <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{spot.description || "詳細情報なし"}</p>
              
              {spot.specs && (
                <div className="mt-3 flex gap-2">
                   {spot.specs.toilet === 'clean' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/30">TOILET:OK</span>}
                   {spot.specs.smoking && <span className="text-[10px] bg-gray-500/20 text-gray-400 px-1.5 py-0.5 rounded border border-gray-500/30">SMOKING</span>}
                   {spot.gourmet && <span className="text-[10px] bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/30">EAT</span>}
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedSpot && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedSpot(null)}
              className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50"
            />
            <motion.div
              layoutId={`card-${selectedSpot.id}`}
              className="fixed inset-x-4 top-16 bottom-20 bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden z-50 flex flex-col shadow-2xl"
            >
              <div className="relative h-56 shrink-0">
                {selectedSpot.image && (
                  <img src={selectedSpot.image} alt={selectedSpot.name} className="w-full h-full object-cover" />
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedSpot(null); }}
                  className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white backdrop-blur-md z-10 hover:bg-black/70 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-zinc-900 to-transparent pt-12">
                   {selectedSpot.specs && (
                    <div className="flex gap-2 mb-3">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${selectedSpot.specs.toilet === 'clean' ? 'bg-blue-900/50 text-blue-400 border-blue-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                        <Droplets size={10} /> {selectedSpot.specs.toilet === 'clean' ? 'CLEAN' : 'NORMAL'}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${selectedSpot.specs.smoking ? 'bg-zinc-700 text-zinc-300 border-zinc-600' : 'bg-red-900/20 text-red-500 border-red-900/30 decoration-slice line-through'}`}>
                        <Cigarette size={10} /> SMOKE
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border ${selectedSpot.specs.vending ? 'bg-green-900/20 text-green-400 border-green-500/30' : 'bg-zinc-800 text-zinc-500 border-zinc-700'}`}>
                        <ShoppingBag size={10} /> STORE
                      </div>
                    </div>
                   )}
                  <h2 className="text-3xl font-black text-white leading-none">{selectedSpot.name}</h2>
                </div>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  {selectedSpot.description}
                </p>

                {selectedSpot.quests && selectedSpot.quests.length > 0 && (
                  <div className="bg-purple-900/10 border border-purple-500/30 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-purple-400 uppercase mb-3 flex items-center gap-2">
                      <CheckCircle2 size={14} /> Mission Objectives
                    </h4>
                    <ul className="space-y-3">
                      {selectedSpot.quests.map((quest: string, i: number) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="mt-0.5 w-4 h-4 rounded border border-purple-500/50 bg-black/20 shrink-0" />
                          <span className="text-sm text-zinc-200">{quest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSpot.driverIntel && (
                  <div className="bg-blue-900/10 border border-blue-500/30 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                      <CarFront size={14} /> Driver's Intel
                    </h4>
                    <div className="space-y-3 text-sm text-zinc-300">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold">PARKING STRATEGY</span>
                        {selectedSpot.driverIntel.parking}
                      </div>
                      {selectedSpot.driverIntel.road && (
                         <div>
                          <span className="block text-[10px] text-zinc-500 uppercase font-bold">ROAD CONDITION</span>
                          {selectedSpot.driverIntel.road}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                 {selectedSpot.gourmet && (
                  <div className="bg-orange-900/10 border border-orange-500/30 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-orange-400 uppercase mb-3 flex items-center gap-2">
                      <UtensilsCrossed size={14} /> Gourmet Sniper
                    </h4>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-white text-lg">{selectedSpot.gourmet.item}</span>
                      <span className="font-mono text-orange-400 font-bold">{selectedSpot.gourmet.price}</span>
                    </div>
                    {selectedSpot.gourmet.tip && (
                       <p className="text-xs text-zinc-400 border-l-2 border-orange-500/50 pl-2">
                        💡 {selectedSpot.gourmet.tip}
                       </p>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSpot.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between bg-blue-600 hover:bg-blue-500 p-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="text-white" />
                      <span className="font-bold text-white text-sm">Google Mapでナビ開始</span>
                    </div>
                    <ExternalLink size={16} className="text-white/70" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ★ Traffic Tab (Restored) ---
const TrafficTab = () => {
  const [region, setRegion] = useState<'kyushu' | 'chugoku' | 'kansai'>('kyushu');
  const [refreshKey, setRefreshKey] = useState(0);

  const accounts = {
    kyushu: { id: 'iHighwayKyushu', name: '九州エリア' },
    chugoku: { id: 'iHighwayChugoku', name: '中国エリア' },
    kansai: { id: 'iHighwayKansai', name: '関西エリア' },
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="pb-24 px-4 h-full flex flex-col">
      <div className="bg-gradient-to-br from-red-900/30 to-zinc-900 border border-red-500/30 p-4 rounded-2xl mb-4 shrink-0 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-bold text-red-500 flex items-center gap-2 mb-1">
            <AlertTriangle className="animate-pulse" size={20} /> TRAFFIC INTEL
          </h2>
          <p className="text-xs text-zinc-400">
            NEXCO西日本 公式ハイウェイ情報 (LIVE)
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700 active:scale-95 transition-all text-zinc-400"
        >
          <ScanLine size={18} />
        </button>
      </div>

      <div className="flex bg-zinc-900 p-1 rounded-xl mb-4 shrink-0 border border-zinc-800">
        {(Object.keys(accounts) as Array<keyof typeof accounts>).map((key) => (
          <button
            key={key}
            onClick={() => { setRegion(key); setRefreshKey(prev => prev + 1); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              region === key 
                ? 'bg-zinc-700 text-white shadow-lg' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {accounts[key].name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl">
        <TwitterFeed 
          key={`${region}-${refreshKey}`}
          id={accounts[region].id} 
        />
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] text-zinc-600">
          ※ 表示されない場合はブラウザの「トラッキング防止」をOFFにしてください
        </p>
      </div>
    </div>
  );
};

// --- Settings Tab ---
const SettingsTab = () => {
  const { currentUser } = useNavStore();
  const [tempUser, setTempUser] = useState(currentUser || 'Naoto');
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleUser = () => {
    const users = ['Naoto', 'Taira', 'Haga'];
    const next = users[(users.indexOf(tempUser) + 1) % users.length];
    setTempUser(next);
  };

  const handleReset = () => {
    if (confirm('【警告】本当に旅費データを全て消去しますか？\nこの操作は取り消せません。')) {
      alert('Memory wiped. Expenses cleared.');
    }
  };

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-10 h-6 rounded-full p-1 transition-colors relative ${active ? 'bg-green-500' : 'bg-zinc-600'}`}
    >
      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${active ? 'translate-x-4' : 'translate-x-0'}`} />
    </button>
  );

  const ListItem = ({ icon, color, label, value, onClick, isDestructive = false, hasToggle, toggleState, onToggle }: any) => (
    <div 
      onClick={!hasToggle ? onClick : undefined}
      className={`w-full flex items-center justify-between p-4 border-b border-zinc-800 last:border-0 ${!hasToggle && 'active:bg-zinc-800'} transition-colors cursor-pointer`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-md flex items-center justify-center text-white ${color}`}>
          {icon}
        </div>
        <span className={`text-sm font-medium ${isDestructive ? 'text-red-500' : 'text-white'}`}>
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {hasToggle ? (
          <Toggle active={toggleState} onToggle={onToggle} />
        ) : (
          <>
            {value && <span className="text-zinc-500 text-sm">{value}</span>}
            <ChevronRight size={16} className="text-zinc-600" />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="pb-24 px-4">
      <h2 className="text-2xl font-bold text-white mb-6 px-2">Settings</h2>

      {/* Group 1: Vehicle Specs */}
      <h3 className="text-zinc-500 text-xs uppercase font-normal ml-4 mb-2">Vehicle Specs</h3>
      <div className="bg-zinc-900 rounded-xl overflow-hidden mb-6">
        <ListItem 
          icon={<CarFront size={16} />} 
          color="bg-blue-600" 
          label="Model" 
          value="SERENA (C27)" 
        />
        <ListItem 
          icon={<Gauge size={16} />} 
          color="bg-purple-600" 
          label="Fuel Type" 
          value="Regular" 
        />
         <ListItem 
          icon={<ShieldCheck size={16} />} 
          color="bg-orange-500" 
          label="Insurance" 
          value="Full Coverage" 
        />
      </div>

      {/* Group 2: Pilot Profile */}
      <h3 className="text-zinc-500 text-xs uppercase font-normal ml-4 mb-2">Pilot Profile</h3>
      <div className="bg-zinc-900 rounded-xl overflow-hidden mb-6">
        <ListItem 
          icon={<User size={16} />} 
          color="bg-blue-500" 
          label="Current Pilot" 
          value={tempUser} 
          onClick={toggleUser}
        />
        <ListItem 
          icon={<Bell size={16} />} 
          color="bg-red-500" 
          label="Notifications" 
          hasToggle={true}
          toggleState={true}
          onToggle={() => {}} 
        />
      </div>

      {/* Group 3: System */}
      <h3 className="text-zinc-500 text-xs uppercase font-normal ml-4 mb-2">System</h3>
      <div className="bg-zinc-900 rounded-xl overflow-hidden mb-6">
        <ListItem 
          icon={<Moon size={16} />} 
          color="bg-indigo-500" 
          label="Dark Mode" 
          hasToggle={true}
          toggleState={isDarkMode}
          onToggle={() => setIsDarkMode(!isDarkMode)}
        />
        <ListItem 
          icon={<Info size={16} />} 
          color="bg-gray-500" 
          label="Version" 
          value="2.1.0 (Grand Tour)" 
        />
      </div>

      {/* Group 4: Danger Zone */}
      <h3 className="text-zinc-500 text-xs uppercase font-normal ml-4 mb-2">Danger Zone</h3>
      <div className="bg-zinc-900 rounded-xl overflow-hidden mb-8">
        <ListItem 
          icon={<Trash2 size={16} />} 
          color="bg-red-900" 
          label="Reset Expenses" 
          isDestructive={true}
          onClick={handleReset}
        />
      </div>
      
      <div className="text-center text-zinc-600 text-xs mb-8">
        Serena Navi Pro System<br/>
        Grand Tour Edition 2026
      </div>
    </div>
  );
};

// --- Main Component ---
export const CoPilotPage: React.FC = () => {
  const { sendNotification, setNextWaypoint, waypoints, currentUser } = useNavStore();
  const [activeTab, setActiveTab] = useState<'command' | 'wallet' | 'guide' | 'traffic' | 'settings'>('command');

  const handleSend = (type: 'rest' | 'music' | 'info', msg: string) => {
    sendNotification({
      id: crypto.randomUUID(),
      type,
      message: msg,
      sender: currentUser || "Co-Pilot",
      payload: { timestamp: Date.now() }
    });
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col">
      <TelemetryHeader />

      <main className="flex-1 pt-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'command' && (
            <motion.div key="command" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="px-4 pb-24">
              <div className="mb-6">
                <DJPanel />
              </div>
              
              <JudgePanel />

              <h2 className="text-xs font-bold text-zinc-500 uppercase mb-3 px-1">NAVIGATION HACK</h2>
              <div className="space-y-3">
                {waypoints.filter(w => w.type !== 'start').map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setNextWaypoint(wp.id)}
                    className="w-full flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl active:bg-zinc-800 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        wp.type === 'parking' ? 'bg-green-900/20 text-green-500' :
                        wp.type === 'sightseeing' ? 'bg-purple-900/20 text-purple-500' :
                        'bg-blue-900/20 text-blue-500'
                      }`}>
                        <Navigation size={14} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm text-zinc-200">{wp.name}</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button onClick={() => handleSend('rest', 'トイレ行きたい')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 active:bg-zinc-800">
                  <Coffee className="text-orange-400" /> <span className="text-xs font-bold">Rest Request</span>
                </button>
                <button onClick={() => handleSend('info', 'コンビニ寄りたい')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 active:bg-zinc-800">
                  <Wallet className="text-blue-400" /> <span className="text-xs font-bold">Store Request</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <WalletTab />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <GuideTab />
            </motion.div>
          )}

          {activeTab === 'traffic' && (
            <motion.div key="traffic" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <TrafficTab />
            </motion.div>
          )}
          
          {activeTab === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <SettingsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-zinc-800 pb-safe z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
          <button 
            onClick={() => setActiveTab('command')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'command' ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Navigation size={20} strokeWidth={activeTab === 'command' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">CMD</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('traffic')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'traffic' ? 'text-red-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <AlertTriangle size={20} strokeWidth={activeTab === 'traffic' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">TRAFFIC</span>
          </button>

          <button 
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'wallet' ? 'text-green-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Wallet size={20} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">WALLET</span>
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'guide' ? 'text-purple-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Activity size={20} strokeWidth={activeTab === 'guide' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">GUIDE</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'settings' ? 'text-zinc-100' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Settings size={20} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">SETTING</span>
          </button>
        </div>
      </nav>
    </div>
  );
};