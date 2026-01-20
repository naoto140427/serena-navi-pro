import React, { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
import { 
  Coffee, Music, MapPin, Navigation, ArrowRight, 
  Wallet, Receipt, Plus, Users, Utensils, Camera, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- サブコンポーネント: WALLET (割り勘) ---
const WalletTab = () => {
  const { expenses, addExpense, removeExpense } = useNavStore();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('Naoto');
  const members = ['Naoto', 'Taira', 'Haga'];

  // 精算ロジック (簡易版)
  const { total, settlements } = useMemo(() => {
    const totalCalc = expenses.reduce((sum, item) => sum + item.amount, 0);
    const perPerson = totalCalc > 0 ? Math.ceil(totalCalc / members.length) : 0;
    
    // 支払った額
    const paidBy: Record<string, number> = { Naoto: 0, Taira: 0, Haga: 0 };
    expenses.forEach(e => { if (paidBy[e.payer] !== undefined) paidBy[e.payer] += e.amount; });
    
    // 貸し借り計算
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
    <div className="space-y-6 pb-24">
      {/* Total Card */}
      <div className="bg-gradient-to-br from-green-900/50 to-zinc-900 border border-green-500/30 p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">Total Budget</div>
          <div className="text-4xl font-bold text-white font-mono">¥{total.toLocaleString()}</div>
          <div className="text-green-400 text-xs mt-2 flex items-center gap-1">
            <Users size={12} /> 3人で割り勘中
          </div>
        </div>
        <Wallet className="absolute -right-4 -bottom-4 text-green-500/10 w-32 h-32" />
      </div>

      {/* Input Form */}
      <div className="bg-zinc-900/80 p-5 rounded-2xl border border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
          <Plus size={16} /> 支払いを追加
        </h3>
        <div className="space-y-3">
          <input 
            type="text" placeholder="品目 (例: ガソリン, SAランチ)" 
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-black/50 border border-zinc-700 rounded-xl p-3 text-white focus:border-green-500 outline-none"
          />
          <div className="flex gap-3">
            <input 
              type="number" placeholder="金額" 
              value={amount} onChange={e => setAmount(e.target.value)}
              className="flex-1 bg-black/50 border border-zinc-700 rounded-xl p-3 text-white focus:border-green-500 outline-none font-mono"
            />
            <select 
              value={payer} onChange={e => setPayer(e.target.value)}
              className="w-1/3 bg-black/50 border border-zinc-700 rounded-xl p-3 text-white outline-none"
            >
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <button 
            onClick={handleSubmit}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            登録する
          </button>
        </div>
      </div>

      {/* Settlement (精算プラン) */}
      {settlements.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-zinc-500 uppercase px-1">現在の精算状況</h3>
          {settlements.map((s, i) => (
            <div key={i} className="flex items-center justify-between bg-zinc-800/40 p-3 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <span className="font-bold text-red-400">{s.from}</span>
                <ArrowRight size={14} className="text-zinc-600" />
                <span className="font-bold text-green-400">{s.to}</span>
              </div>
              <span className="font-mono font-bold text-white">¥{s.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-zinc-500 uppercase px-1">履歴</h3>
        {expenses.map((e) => (
          <div key={e.id} className="flex items-center justify-between p-3 border-b border-zinc-800 last:border-0">
            <div>
              <div className="font-bold text-sm text-zinc-300">{e.title}</div>
              <div className="text-xs text-zinc-500">{e.payer} • {new Date(e.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-zinc-300">¥{e.amount.toLocaleString()}</span>
              <button onClick={() => removeExpense(e.id)} className="text-zinc-600 hover:text-red-500"><Receipt size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- サブコンポーネント: GUIDE (旅のしおり) ---
const GuideTab = () => {
  const plans = [
    { title: "関門海峡", desc: "本州と九州を結ぶ要衝。夜景が綺麗。", icon: <Camera />, time: "Day 1" },
    { title: "伊勢神宮 内宮", desc: "日本人の心のふるさと。五十鈴川で清める。", icon: <MapPin />, time: "Day 2" },
    { title: "おかげ横丁", desc: "赤福氷、松阪牛串、伊勢うどん...", icon: <Utensils />, time: "Day 2" },
    { title: "鈴鹿サーキット", desc: "F1開催地。レーシングコースを疾走？", icon: <Activity />, time: "Goal" },
  ];
  return (
    <div className="space-y-4 pb-24">
      <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 p-6 rounded-2xl border border-white/10">
        <h2 className="text-xl font-bold text-white mb-2">Grand Tour Guide</h2>
        <p className="text-sm text-zinc-300">Oita → Mie → Yamaguchi</p>
      </div>
      <div className="grid gap-3">
        {plans.map((p, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl flex items-start gap-4 hover:bg-zinc-800 transition-colors">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
              {p.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold bg-zinc-700 px-2 py-0.5 rounded text-zinc-300">{p.time}</span>
                <h3 className="font-bold text-zinc-200">{p.title}</h3>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">{p.desc}</p>
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
      {/* Header */}
      <header className="p-6 pb-2 bg-gradient-to-b from-zinc-900 to-transparent sticky top-0 z-20 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Co-Pilot OS
            </h1>
            <p className="text-zinc-600 text-[10px] tracking-widest uppercase">Connected to SERENA-001</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
            <span className="text-xs font-bold">{currentUser?.substring(0,2) || "G"}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'command' && (
            <motion.div key="command" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              
              {/* Music Widget (Dummy) */}
              <div className="mb-6 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Music className="text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Now Playing</div>
                  <div className="font-bold text-sm truncate">Driving Mode Playlist</div>
                  <div className="text-xs text-zinc-400">Spotify / Apple Music</div>
                </div>
                <button 
                  onClick={() => handleSend('music', '次の曲お願い！')}
                  className="p-3 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform"
                >
                  <ArrowRight size={16} />
                </button>
              </div>

              {/* Quick Actions */}
              <h2 className="text-xs font-bold text-zinc-500 uppercase mb-3">Quick Requests</h2>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <button onClick={() => handleSend('rest', 'トイレ行きたい')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 active:bg-zinc-800">
                  <Coffee className="text-orange-400" /> <span className="text-xs font-bold">Restroom</span>
                </button>
                <button onClick={() => handleSend('info', 'コンビニ寄りたい')} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex flex-col items-center gap-2 active:bg-zinc-800">
                  <Wallet className="text-blue-400" /> <span className="text-xs font-bold">Conveni</span>
                </button>
              </div>

              {/* Remote Navigation */}
              <h2 className="text-xs font-bold text-zinc-500 uppercase mb-3">Reroute Navigation</h2>
              <div className="space-y-3 pb-24">
                {waypoints.filter(w => w.type !== 'start').map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => setNextWaypoint(wp.id)}
                    className="w-full flex items-center justify-between bg-zinc-900/40 border border-zinc-800 p-4 rounded-xl active:bg-zinc-800 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        wp.type === 'parking' ? 'bg-green-900/30 text-green-400' :
                        wp.type === 'sightseeing' ? 'bg-purple-900/30 text-purple-400' :
                        'bg-blue-900/30 text-blue-400'
                      }`}>
                        <Navigation size={14} />
                      </div>
                      <div className="text-left">
                        <div className="font-bold text-sm text-zinc-200">{wp.name}</div>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-zinc-800 rounded text-[10px] text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">SET</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <WalletTab />
            </motion.div>
          )}

          {activeTab === 'guide' && (
            <motion.div key="guide" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
              <GuideTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 pb-safe">
        <div className="flex justify-around items-center h-16">
          <button 
            onClick={() => setActiveTab('command')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'command' ? 'text-blue-500' : 'text-zinc-600'}`}
          >
            <Navigation size={20} />
            <span className="text-[10px] font-bold">COMMAND</span>
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'wallet' ? 'text-green-500' : 'text-zinc-600'}`}
          >
            <Wallet size={20} />
            <span className="text-[10px] font-bold">WALLET</span>
          </button>
          <button 
            onClick={() => setActiveTab('guide')}
            className={`flex flex-col items-center gap-1 w-full h-full justify-center ${activeTab === 'guide' ? 'text-purple-500' : 'text-zinc-600'}`}
          >
            <Activity size={20} />
            <span className="text-[10px] font-bold">GUIDE</span>
          </button>
        </div>
      </nav>
    </div>
  );
};