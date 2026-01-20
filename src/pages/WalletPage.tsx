import React, { useState, useMemo } from 'react';
import { useNavStore } from '../store/useNavStore'; // Expense を削除
import { Plus, Trash2, Wallet, ArrowRight, DollarSign, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// 参加者リスト（固定）
const MEMBERS = ['Naoto', 'Taira', 'Haga'];

export const WalletPage: React.FC = () => {
  const { expenses, addExpense, removeExpense } = useNavStore();

  // 入力フォームの状態
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState(MEMBERS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- 自動計算ロジック (Magic) ---
  const { total, perPerson, settlements } = useMemo(() => { // balances を削除
    // 1. 合計と一人当たり
    const totalCalc = expenses.reduce((sum, item) => sum + item.amount, 0);
    const perPersonCalc = totalCalc > 0 ? Math.ceil(totalCalc / MEMBERS.length) : 0;

    // 2. 各自の支払額
    const paidBy: Record<string, number> = { Naoto: 0, Taira: 0, Haga: 0 };
    expenses.forEach(e => {
      if (paidBy[e.payer] !== undefined) paidBy[e.payer] += e.amount;
    });

    // 3. 貸し借りバランス（プラス＝もらう人、マイナス＝払う人）
    const balancesList = MEMBERS.map(name => ({
      name,
      paid: paidBy[name],
      balance: paidBy[name] - perPersonCalc
    }));

    // 4. 精算プランの作成（誰 → 誰）
    let debtors = balancesList.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance); // 払う人
    let creditors = balancesList.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance); // もらう人
    
    const settlementsList: { from: string; to: string; amount: number }[] = [];

    // 借金相殺アルゴリズム
    let dIndex = 0;
    let cIndex = 0;

    while (dIndex < debtors.length && cIndex < creditors.length) {
      const debtor = debtors[dIndex];
      const creditor = creditors[cIndex];
      
      const moveAmount = Math.min(Math.abs(debtor.balance), creditor.balance);
      
      if (moveAmount > 0) {
        settlementsList.push({ from: debtor.name, to: creditor.name, amount: moveAmount });
        debtor.balance += moveAmount;
        creditor.balance -= moveAmount;
      }

      if (Math.abs(debtor.balance) < 1) dIndex++;
      if (creditor.balance < 1) cIndex++;
    }

    return { total: totalCalc, perPerson: perPersonCalc, settlements: settlementsList };
  }, [expenses]);

  // 送信処理
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      addExpense(title, parseInt(amount), payer);
      setTitle('');
      setAmount('');
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="h-full flex flex-col p-4 pb-24 max-w-4xl mx-auto overflow-y-auto">
      
      {/* ヘッダー */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-500/20 rounded-full">
          <Wallet className="text-green-500" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Trip Wallet</h1>
          <p className="text-zinc-500 text-xs">Total Expenses: ¥{total.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 左側：入力フォーム & 精算情報 */}
        <div className="space-y-6">
          
          {/* 入力フォーム */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
            <h2 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
              <Plus size={16} /> NEW EXPENSE
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">What for?</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Gas, Lunch, Hotel..."
                  className="w-full bg-zinc-800 text-white p-3 rounded-xl border border-zinc-700 focus:border-green-500 outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-zinc-400">¥</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-zinc-800 text-white p-3 pl-8 rounded-xl border border-zinc-700 focus:border-green-500 outline-none font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-zinc-500 mb-1 block">Paid By</label>
                  <select 
                    value={payer}
                    onChange={(e) => setPayer(e.target.value)}
                    className="w-full bg-zinc-800 text-white p-3 rounded-xl border border-zinc-700 outline-none appearance-none"
                  >
                    {MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <button 
                disabled={isSubmitting || !title || !amount}
                className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Saving...' : 'Add Expense'}
              </button>
            </form>
          </div>

          {/* 精算サマリー */}
          {expenses.length > 0 && (
            <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl">
              <h2 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2">
                <Users size={16} /> SETTLEMENT
              </h2>
              
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-800">
                <span className="text-zinc-500 text-sm">Per Person</span>
                <span className="text-xl font-mono font-bold text-white">¥{perPerson.toLocaleString()}</span>
              </div>

              <div className="space-y-3">
                {settlements.length === 0 ? (
                  <div className="text-center text-zinc-500 text-sm py-2">
                    Settled! No payments needed.
                  </div>
                ) : (
                  settlements.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-zinc-800/50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-red-400">{s.from}</span>
                        <ArrowRight size={14} className="text-zinc-600" />
                        <span className="font-bold text-green-400">{s.to}</span>
                      </div>
                      <span className="font-mono font-bold text-white">¥{s.amount.toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* 右側：履歴リスト */}
        <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl h-fit max-h-[600px] overflow-y-auto">
          <h2 className="text-sm font-bold text-zinc-400 mb-4 flex items-center gap-2 sticky top-0 bg-zinc-900/95 py-2 z-10">
            <DollarSign size={16} /> HISTORY
          </h2>
          
          <div className="space-y-3">
            <AnimatePresence>
              {expenses.length === 0 ? (
                <div className="text-center text-zinc-600 py-10">No expenses yet.</div>
              ) : (
                expenses.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-white text-sm md:text-base">{item.title}</div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span className="bg-zinc-700 text-zinc-300 px-1.5 rounded text-[10px]">{item.payer}</span>
                        <span>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-white">¥{item.amount.toLocaleString()}</span>
                      <button 
                        onClick={() => removeExpense(item.id)}
                        className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};