import React, { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
import { ArrowRight, TrendingUp, PieChart, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense } from '../types';

// Pro Card Component
const ProCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div onClick={onClick} className={`bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/5 rounded-[20px] shadow-lg ${className}`}>
    {children}
  </div>
);

// Edit Modal Component
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#1c1c1e] w-full max-w-sm rounded-[24px] border border-white/10 p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Edit Record</h3>
          <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Title</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Amount</label>
            <input 
              type="number" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white font-mono outline-none focus:border-blue-500" 
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Payer</label>
            <div className="flex gap-2 mt-1">
              {members.map(m => (
                <button 
                  key={m}
                  onClick={() => setPayer(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${payer === m ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={handleDelete} className="p-4 bg-red-900/20 text-red-500 rounded-xl hover:bg-red-900/40 transition-colors">
            <Trash2 size={20} />
          </button>
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-colors">
            <Check size={20} /> Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const WalletPage: React.FC = () => {
  const { expenses } = useNavStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  // Analytics Logic
  const { total, settlements, categoryStats } = useMemo(() => {
    const totalCalc = expenses.reduce((sum, item) => sum + item.amount, 0);
    
    // Settlement Logic
    const members = ['Naoto', 'Taira', 'Haga'];
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

    return { total: totalCalc, settlements: results, categoryStats: paidBy };
  }, [expenses]);

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-32">
      <AnimatePresence>
        {editingExpense && <EditModal expense={editingExpense} onClose={() => setEditingExpense(null)} />}
      </AnimatePresence>

      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[34px] font-bold tracking-tight leading-none">Financials</h2>
          <p className="text-zinc-500 font-medium text-sm mt-2">Admin Overview</p>
        </div>
        <div className="bg-zinc-900 rounded-full p-2 border border-white/5">
          <PieChart size={20} className="text-zinc-400" />
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <ProCard className="col-span-2 p-6 bg-gradient-to-br from-green-900/30 to-[#1c1c1e] border-green-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-24 bg-green-500/10 blur-[60px] rounded-full pointer-events-none" />
          <div className="flex items-center gap-2 text-[#30D158] font-bold text-xs uppercase tracking-widest mb-1">
            <TrendingUp size={14} /> Total Expenditure
          </div>
          <div className="text-5xl font-thin font-mono tracking-tighter">¥{total.toLocaleString()}</div>
          <div className="mt-4 flex gap-2">
             <span className="text-xs text-zinc-400">Since Departure</span>
          </div>
        </ProCard>

        {/* Individual Stats */}
        {Object.entries(categoryStats).map(([name, val]) => (
          <ProCard key={name} className="p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-zinc-500 uppercase">{name}</span>
              {name === 'Naoto' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />}
            </div>
            <div>
              <div className="text-xl font-bold font-mono">¥{val.toLocaleString()}</div>
              <div className="h-1 w-full bg-zinc-800 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${(val / (total || 1)) * 100}%` }}
                  className={`h-full ${name === 'Naoto' ? 'bg-blue-500' : 'bg-zinc-600'}`}
                />
              </div>
            </div>
          </ProCard>
        ))}
      </div>

      {/* --- Transaction History List --- */}
      <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-3 mt-8 flex justify-between items-center">
        Transaction History
        <span className="text-[10px] bg-zinc-800 px-2 py-1 rounded text-zinc-400">{expenses.length} records</span>
      </h3>
      <div className="space-y-2 mb-8">
        {expenses.slice().reverse().map((ex) => (
          <ProCard 
            key={ex.id} 
            onClick={() => setEditingExpense(ex)}
            className="p-4 flex justify-between items-center bg-[#1c1c1e] hover:bg-[#2c2c2e] cursor-pointer transition-colors group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-400 border border-white/5">
                {ex.payer.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-white text-sm">{ex.title}</div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                  {new Date(ex.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {ex.payer}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-white text-lg tracking-tight">¥{ex.amount.toLocaleString()}</span>
              <Edit2 size={14} className="text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </ProCard>
        ))}
      </div>

      {/* Settlements List */}
      <h3 className="text-xs font-bold text-zinc-500 uppercase px-2 mb-3 mt-8">Pending Settlements</h3>
      <div className="space-y-3">
        {settlements.length > 0 ? (
          settlements.map((s, i) => (
            <ProCard key={i} className="p-4 flex justify-between items-center bg-[#1c1c1e]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center text-xs font-bold text-red-400 border border-red-500/20">
                  {s.from.charAt(0)}
                </div>
                <ArrowRight size={14} className="text-zinc-600"/>
                <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center text-xs font-bold text-green-400 border border-green-500/20">
                  {s.to.charAt(0)}
                </div>
              </div>
              <span className="font-mono text-white text-lg tracking-tight">¥{s.amount.toLocaleString()}</span>
            </ProCard>
          ))
        ) : (
          <div className="text-center p-8 text-zinc-600 text-sm">All accounts are settled.</div>
        )}
      </div>
    </div>
  );
};