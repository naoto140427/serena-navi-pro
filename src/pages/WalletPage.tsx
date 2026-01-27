import React, { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore';
import { ArrowRight, TrendingUp, PieChart, Edit2, Trash2, X, Check, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Expense } from '../types';

// Pro Card Component (Enhanced for Clarity)
const ProCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    onClick={onClick}
    whileTap={onClick ? { scale: 0.98 } : undefined}
    className={`bg-[#1c1c1e]/90 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-lg ${onClick ? 'cursor-pointer active:bg-[#2c2c2e]' : ''} ${className}`}
  >
    {children}
  </motion.div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-[#1c1c1e] w-full max-w-sm rounded-[32px] border border-white/10 p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-8 relative z-10">
          <h3 className="text-2xl font-bold text-white tracking-tight">Edit Transaction</h3>
          <button onClick={onClose} className="p-2 bg-zinc-800/50 rounded-full text-zinc-400 hover:text-white transition-colors backdrop-blur-sm">
            <X size={20} />
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-6 relative z-10">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Title</label>
            <input 
              value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 text-white text-lg font-medium outline-none focus:border-blue-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-600" 
              placeholder="Expense Name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg font-mono">¥</span>
              <input 
                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl p-4 pl-8 text-white text-lg font-mono outline-none focus:border-blue-500 focus:bg-zinc-900 transition-all placeholder:text-zinc-600" 
                placeholder="0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Paid By</label>
            <div className="bg-zinc-900/50 p-1 rounded-2xl border border-white/10 flex">
              {members.map(m => (
                <button 
                  key={m}
                  onClick={() => setPayer(m)}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${payer === m ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-10 relative z-10">
          <button onClick={handleDelete} className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500/20 active:scale-95 transition-all">
            <Trash2 size={24} />
          </button>
          <button onClick={handleSave} className="flex-1 bg-white text-black font-bold text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-zinc-200 active:scale-95 transition-all shadow-lg">
            <Check size={20} strokeWidth={3} /> Save Changes
          </button>
        </div>

        {/* Background Gradient */}
        <div className="absolute top-0 right-0 p-32 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
};

export const WalletPage: React.FC = () => {
  const { expenses } = useNavStore();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Analytics Logic
  const { total, settlements, categoryStats, filteredExpenses } = useMemo(() => {
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

    // Filter Logic
    const filtered = expenses.filter(ex => 
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ex.payer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return { total: totalCalc, settlements: results, categoryStats: paidBy, filteredExpenses: filtered };
  }, [expenses, searchQuery]);

  return (
    <div className="h-full bg-black text-white p-6 overflow-y-auto pb-32 selection:bg-blue-500/30">
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
      <div className="grid grid-cols-2 gap-4 mb-8">
        <ProCard className="col-span-2 p-6 bg-gradient-to-br from-green-900/30 to-[#1c1c1e] border-green-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-24 bg-green-500/10 blur-[60px] rounded-full pointer-events-none group-hover:bg-green-500/20 transition-colors duration-500" />
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
          <ProCard key={name} className="p-4 flex flex-col justify-between hover:bg-[#2c2c2e] transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-zinc-500 uppercase">{name}</span>
              {name === 'Naoto' && <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />}
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

      {/* Transaction History Section */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white tracking-tight">Recent Transactions</h3>
        <span className="text-xs font-bold text-zinc-500 bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-800">
          {filteredExpenses.length} Records
        </span>
      </div>

      {/* Search Bar (Apple Style) */}
      <div className="relative mb-4 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors" size={16} />
        <input 
          type="text" 
          placeholder="Search items or names" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1c1c1e] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:bg-[#2c2c2e] focus:border-white/10 transition-all"
        />
      </div>

      {/* List */}
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
                whileHover={{ scale: 1.01, backgroundColor: "rgba(44, 44, 46, 0.8)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setEditingExpense(ex)}
                className="cursor-pointer"
              >
                <ProCard className="p-4 flex justify-between items-center border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border border-white/5 shadow-inner ${
                      ex.payer === 'Naoto' ? 'bg-blue-900/30 text-blue-400' : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {ex.payer.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-white text-base leading-tight">{ex.title}</div>
                      <div className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5 font-medium">
                        {new Date(ex.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • <span className={ex.payer === 'Naoto' ? 'text-blue-400' : 'text-zinc-400'}>{ex.payer}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-white text-lg font-medium tracking-tight">¥{ex.amount.toLocaleString()}</span>
                    <Edit2 size={16} className="text-zinc-600" />
                  </div>
                </ProCard>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-zinc-600 text-sm">
              No transactions found.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Settlements List */}
      <h3 className="text-lg font-bold text-white tracking-tight mb-3">Settlement Plan</h3>
      <div className="space-y-3">
        {settlements.length > 0 ? (
          settlements.map((s, i) => (
            <ProCard key={i} className="p-4 flex justify-between items-center bg-[#1c1c1e] hover:bg-[#2c2c2e] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-400 border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                  {s.from.charAt(0)}
                </div>
                <ArrowRight size={14} className="text-zinc-600"/>
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.1)]">
                  {s.to.charAt(0)}
                </div>
              </div>
              <span className="font-mono text-white text-lg tracking-tight font-medium">¥{s.amount.toLocaleString()}</span>
            </ProCard>
          ))
        ) : (
          <div className="text-center p-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-2xl">
            All accounts are settled.
          </div>
        )}
      </div>
    </div>
  );
};