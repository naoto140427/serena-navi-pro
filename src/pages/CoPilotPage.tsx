import React, { useState, useMemo, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Coffee, Music, MapPin, Navigation, ArrowRight, 
  Wallet, Utensils, Camera, Activity,
  Thermometer, Clock, Radio, ScanLine, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- サブコンポーネント: Telemetry Header ---
const TelemetryHeader = () => {
  const { currentSpeed, nextWaypointEta, currentAreaText, activeNotification } = useNavStore();
  
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
            <div className="text-[9px] text-zinc-500 uppercase">ETA</div>
            <div className="text-xs font-bold font-mono text-zinc-200">{nextWaypointEta}</div>
          </div>
        </div>
        <div className="flex-1 flex items-center gap-2 border-r border-zinc-800">
          <Thermometer size={14} className="text-orange-500" />
          <div>
            <div className="text-[9px] text-zinc-500 uppercase">TEMP</div>
            <div className="text-xs font-bold font-mono text-zinc-200">24°C</div>
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

// --- サブコンポーネント: DJ Panel ---
const DJPanel = ({ onSend }: { onSend: any }) => {
  const [playlist, setPlaylist] = useState([
    { id: 1, title: "Driving Home 2026", artist: "Chill Vibes", votes: 2 },
    { id: 2, title: "Highway Star", artist: "Rock Legends", votes: 0 },
    { id: 3, title: "Night Cruising", artist: "City Pop", votes: 1 },
  ]);

  const handleVote = (id: number) => {
    setPlaylist(prev => prev.map(item => 
      item.id === id ? { ...item, votes: item.votes + 1 } : item
    ).sort((a,b) => b.votes - a.votes));
    onSend('music', 'プレイリストに投票しました');
  };

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-pink-900/40 to-purple-900/40 border border-pink-500/20 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/20 to-transparent"></div>
        <div className="w-20 h-20 rounded-xl bg-zinc-800 shadow-xl flex items-center justify-center shrink-0 relative z-10">
          <div className="absolute inset-0 bg-pink-500/20 blur-xl"></div>
          <Music className="text-white relative z-10" size={32} />
        </div>
        <div className="relative z-10 flex-1">
          <div className="text-[10px] text-pink-300 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse"></span> NOW PLAYING
          </div>
          <h3 className="text-lg font-bold text-white leading-tight">Midnight City</h3>
          <p className="text-sm text-zinc-400">M83</p>
        </div>
      </div>
      <div>
        <h3 className="text-xs font-bold text-zinc-500 uppercase mb-2 px-1">UP NEXT (VOTE)</h3>
        <div className="space-y-2">
          {playlist.map((track, i) => (
            <div key={track.id} className="flex items-center justify-between bg-zinc-900/50 border border-zinc-800 p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="text-xs font-bold text-zinc-600 font-mono">0{i+1}</div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">{track.title}</div>
                  <div className="text-xs text-zinc-500">{track.artist}</div>
                </div>
              </div>
              <button 
                onClick={() => handleVote(track.id)}
                className="flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-full transition-colors"
              >
                <div className="text-[10px] text-zinc-400">👍</div>
                <div className="text-xs font-bold text-white">{track.votes}</div>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- ★修正箇所: WALLET (Gemini Scan搭載) ---
const WalletTab = () => {
  const { expenses, addExpense } = useNavStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Naoto');
  const [isScanning, setIsScanning] = useState(false); // スキャン中フラグ
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const members = ['Naoto', 'Taira', 'Haga'];

  // 画像スキャン処理
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      // 画像をBase64に変換
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Vercel API (Gemini) に送信
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
      {/* Total Card */}
      <div className="bg-gradient-to-br from-green-900/50 to-zinc-900 border border-green-500/30 p-6 rounded-2xl relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Total Budget</div>
          <div className="text-4xl font-bold text-white font-mono">¥{total.toLocaleString()}</div>
        </div>
        <Wallet className="absolute -right-4 -bottom-4 text-green-500/10 w-32 h-32" />
      </div>

      {/* Input */}
      <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 relative overflow-hidden">
        {/* スキャン中オーバーレイ */}
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
            
            {/* Camera Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              capture="environment" // スマホの背面カメラを優先起動
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

      {/* Settlement */}
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

// --- サブコンポーネント: GUIDE ---
const GuideTab = () => {
  const plans = [
    { title: "関門海峡", desc: "本州と九州を結ぶ要衝。夜景が綺麗。", icon: <Camera />, time: "Day 1", color: "from-blue-500 to-cyan-500" },
    { title: "伊勢神宮 内宮", desc: "日本人の心のふるさと。五十鈴川で清める。", icon: <MapPin />, time: "Day 2", color: "from-green-500 to-emerald-600" },
    { title: "おかげ横丁", desc: "赤福氷、松阪牛串、伊勢うどん...", icon: <Utensils />, time: "Day 2", color: "from-orange-500 to-red-500" },
    { title: "鈴鹿サーキット", desc: "F1開催地。レーシングコースを疾走？", icon: <Activity />, time: "Goal", color: "from-red-600 to-rose-600" },
  ];
  return (
    <div className="space-y-4 pb-24 px-4">
      <div className="grid gap-4">
        {plans.map((p, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group">
            <div className={`h-24 bg-gradient-to-r ${p.color} p-4 relative`}>
              <div className="absolute right-4 top-4 bg-black/30 backdrop-blur-md px-2 py-1 rounded text-xs text-white font-bold">{p.time}</div>
              <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl bg-zinc-900 border-4 border-zinc-900 flex items-center justify-center text-white shadow-lg">
                {p.icon}
              </div>
            </div>
            <div className="pt-8 pb-4 px-4">
              <h3 className="font-bold text-lg text-white mb-1">{p.title}</h3>
              <p className="text-sm text-zinc-500">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- メインコンポーネント ---
export const CoPilotPage: React.FC = () => {
  const { sendNotification, setNextWaypoint, waypoints, currentUser } = useNavStore();
  const [activeTab, setActiveTab] = useState<'command' | 'wallet' | 'guide'>('command');

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
              <div className="mb-8">
                <DJPanel onSend={handleSend} />
              </div>
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
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-zinc-800 pb-safe z-40">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button 
            onClick={() => setActiveTab('command')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'command' ? 'text-blue-500' : 'text-zinc-600 hover:text-zinc-400'}`}
          >
            <Navigation size={20} strokeWidth={activeTab === 'command' ? 2.5 : 2} />
            <span className="text-[9px] font-bold tracking-wider">COMMAND</span>
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
        </div>
      </nav>
    </div>
  );
};