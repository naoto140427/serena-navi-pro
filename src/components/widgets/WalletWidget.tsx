import React, { useState, useMemo, useRef } from 'react';
import { useNavStore } from '../../store/useNavStore';
import { ArrowRight, TrendingUp, PieChart, Edit2, Trash2, X, Check, Search, ScanLine, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense } from '../../types';

// Pro Card コンポーネント (カード型UIのベース)
const ProCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div
    onClick={onClick}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    className={`bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-lg ${onClick ? 'cursor-pointer active:bg-[#2c2c2e]' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

// セグメントコントロール (選択肢の切り替え)
const SegmentedControl = ({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) => (
  <div className="flex bg-[#767680]/24 p-0.5 rounded-[9px] relative w-full h-8">
    {options.map((option) => {
      const isActive = value === option;
      return (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`relative flex-1 flex items-center justify-center text-[13px] font-semibold capitalize z-10 transition-colors duration-200 ${isActive ? 'text-white' : 'text-zinc-400'}`}
        >
          {isActive && (
            <motion.div
              layoutId="segment-active-wallet"
              className="absolute inset-0 bg-[#636366] rounded-[7px] shadow-[0_1px_2px_rgba(0,0,0,0.2)] z-[-1]"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          {option}
        </button>
      );
    })}
  </div>
);

// 編集モーダル
const EditModal = ({ expense, onClose }: { expense: Expense | null, onClose: () => void }) => {
  const { updateExpense, removeExpense } = useNavStore();
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [payer, setPayer] = useState(expense?.payer || 'Naoto');
  const members = ['Naoto', 'Taira', 'Haga'];

  if (!expense) return null;

  const handleSave = () => {
    updateExpense(expense.id, { title, amount: parseInt(amount), payer });
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Delete this record?')) {
      removeExpense(expense.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-[#1c1c1e] w-full max-w-sm rounded-[32px] border border-white/10 p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6 relative z-10">
          <h3 className="text-xl font-bold text-white">Edit Transaction</h3>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4 relative z-10">
          <SegmentedControl options={members} value={payer} onChange={setPayer} />
          <input value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors" />
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white font-mono outline-none focus:border-blue-500 transition-colors" />
        </div>
        <div className="flex gap-3 mt-8 relative z-10">
          <button onClick={handleDelete} className="p-3 bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={20} /></button>
          <button onClick={handleSave} className="flex-1 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200"><Check size={20} /> Save</button>
        </div>
      </motion.div>
    </div>
  );
};

interface WalletWidgetProps {
  className?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const WalletWidget: React.FC<WalletWidgetProps> = ({ className = "", isModal = false, onClose }) => {
  const { expenses, addExpense } = useNavStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 入力フォームの状態管理
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState('Naoto');
  const members = ['Naoto', 'Taira', 'Haga'];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if(!newTitle || !newAmount) return;
    addExpense(newTitle, parseInt(newAmount), newPayer);
    setNewTitle('');
    setNewAmount('');
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: reader.result }) });
        if (!res.ok) throw new Error('Scan failed');
        const data = await res.json();
        if(data.title) { setNewTitle(data.title); setNewAmount(data.amount); }
      } catch (err) {
        console.error('Receipt scan failed:', err);
        // Fallback or user notification could be added here
      }
    };
    reader.readAsDataURL(file);
  };

  // 統計ロジック (合計、精算、カテゴリ別)
  const { total, settlements, categoryStats, filteredExpenses } = useMemo(() => {
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
    const filtered = expenses.filter(ex =>
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.payer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { total: totalCalc, settlements: results, categoryStats: paidBy, filteredExpenses: filtered };
  }, [expenses, searchQuery]);

  return (
    <div className={`bg-black text-white overflow-y-auto selection:bg-blue-500/30 ${className}`}>
      <AnimatePresence>
        {editingExpense && <EditModal expense={editingExpense} onClose={() => setEditingExpense(null)} />}
      </AnimatePresence>

      <div className="flex justify-between items-end mb-8 sticky top-0 bg-black/80 backdrop-blur-xl z-20 pb-4 pt-2">
        <div>
          <h2 className="text-[34px] font-bold tracking-tight leading-none">Financials</h2>
          <p className="text-zinc-500 font-medium text-sm mt-2">Admin Overview</p>
        </div>
        <div className="flex gap-2">
           <div className="bg-zinc-900 rounded-full p-2 border border-white/5">
             <PieChart size={20} className="text-zinc-400" />
           </div>
           {isModal && onClose && (
             <button onClick={onClose} className="bg-zinc-800 rounded-full p-2 hover:bg-zinc-700 transition-colors">
               <X size={20} className="text-white" />
             </button>
           )}
        </div>
      </div>

      <div className="pb-32">
        {/* メイン統計表示 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            <ProCard className="col-span-2 p-6 bg-gradient-to-br from-green-900/30 to-[#1c1c1e] border-green-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-24 bg-green-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-colors duration-500" />
            <div className="flex items-center gap-2 text-[#30D158] font-bold text-xs uppercase tracking-widest mb-1">
                <TrendingUp size={14} /> Total Expenditure
            </div>
            <div className="text-5xl font-thin font-mono tracking-tighter">¥{total.toLocaleString()}</div>
            </ProCard>
            {Object.entries(categoryStats).map(([name, val]) => (
            <ProCard key={name} className="p-4 flex flex-col justify-between hover:bg-[#2c2c2e] transition-colors">
                <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-zinc-500 uppercase">{name}</span>
                {name === 'Naoto' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />}
                </div>
                <div>
                <div className="text-xl font-bold font-mono">¥{val.toLocaleString()}</div>
                <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${(val / (total || 1)) * 100}%` }} className={`h-full ${name === 'Naoto' ? 'bg-blue-500' : 'bg-zinc-600'}`} />
                </div>
                </div>
            </ProCard>
            ))}
        </div>

        {/* 新規支出の追加フォーム */}
        <div className="mb-8">
            <h3 className="text-lg font-bold text-white tracking-tight mb-3">Add Transaction</h3>
            <div className="bg-[#1c1c1e] rounded-[24px] p-4 shadow-lg border border-white/5">
            <div className="mb-4">
                <SegmentedControl options={members} value={newPayer} onChange={setNewPayer} />
            </div>
            <div className="space-y-3">
                <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors h-12 w-12 flex items-center justify-center shrink-0">
                    <ScanLine size={20} />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleScan} />
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Item Name" className="bg-zinc-900/50 text-white px-4 h-12 rounded-xl outline-none w-full text-base font-medium placeholder:text-zinc-600 border border-white/5 focus:border-blue-500/50 transition-colors" />
                </div>
                <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-mono">¥</span>
                    <input value={newAmount} onChange={e => setNewAmount(e.target.value)} placeholder="0" type="number" className="bg-zinc-900/50 text-white pl-8 pr-4 h-12 rounded-xl outline-none w-full text-base font-mono placeholder:text-zinc-600 border border-white/5 focus:border-blue-500/50 transition-colors" />
                </div>
                <button onClick={handleAdd} className="bg-[#007AFF] text-white px-6 h-12 rounded-xl font-bold text-sm hover:bg-[#0062cc] active:scale-95 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-1">
                    <Plus size={18} strokeWidth={3} /> Add
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* リストヘッダー & 検索 */}
        <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">History</h3>
            <div className="relative group w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={14} />
            <input
                type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1e] border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-zinc-600 outline-none focus:bg-[#2c2c2e] focus:border-white/10 transition-all"
            />
            </div>
        </div>

        {/* 取引履歴リスト */}
        <div className="space-y-2 mb-8">
            <AnimatePresence mode="popLayout">
            {filteredExpenses.length > 0 ? (
                filteredExpenses.slice().reverse().map((ex) => (
                <motion.div
                    key={ex.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                >
                    <ProCard onClick={() => setEditingExpense(ex)} className="p-4 flex justify-between items-center border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 shadow-inner ${
                        ex.payer === 'Naoto' ? 'bg-blue-900/30 text-blue-400' : 'bg-zinc-800 text-zinc-400'
                        }`}>
                        {ex.payer.charAt(0)}
                        </div>
                        <div>
                        <div className="font-bold text-white text-base leading-tight">{ex.title}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-medium">{ex.payer}</span>
                            <span className="text-[10px] text-zinc-600 font-mono">
                            {new Date(ex.timestamp).toLocaleDateString([], {month:'numeric', day:'numeric'})} {new Date(ex.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-mono text-white text-lg font-medium tracking-tight">¥{ex.amount.toLocaleString()}</span>
                        <Edit2 size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    </ProCard>
                </motion.div>
                ))
            ) : (
                <div className="text-center py-10 text-zinc-600 text-sm">No transactions found.</div>
            )}
            </AnimatePresence>
        </div>

        {/* 精算プランリスト */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-3">Settlement Plan</h3>
        <div className="space-y-3">
            {settlements.length > 0 ? (
            settlements.map((s, i) => (
                <ProCard key={i} className="p-4 flex justify-between items-center bg-[#1c1c1e]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400 border border-red-500/20">{s.from.charAt(0)}</div>
                    <ArrowRight size={14} className="text-zinc-600"/>
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-400 border border-green-500/20">{s.to.charAt(0)}</div>
                </div>
                <span className="font-mono text-white text-lg tracking-tight font-medium">¥{s.amount.toLocaleString()}</span>
                </ProCard>
            ))
            ) : (
            <div className="text-center p-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-2xl">All accounts are settled.</div>
            )}
        </div>
      </div>
    </div>
  );
};