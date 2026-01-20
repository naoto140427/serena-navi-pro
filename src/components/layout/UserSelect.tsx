import React from 'react';
import { motion } from 'framer-motion';
import { User, Car, Shield, Camera, Utensils, ChevronRight } from 'lucide-react';
import { useNavStore } from '../../store/useNavStore';
// soundManagerのインポートを削除しました

interface Props {
  onSelect: () => void;
}

export const UserSelect: React.FC<Props> = ({ onSelect }) => {
  const { setMode, setCurrentUser } = useNavStore();

  const handleSelect = (name: string, mode: 'driver' | 'passenger') => {
    // soundManagerの呼び出しもコメントアウト済みなので削除不要ですが、
    // インポートを消すだけでOKです。
    
    setCurrentUser(name);
    setMode(mode);
    onSelect();
  };

  const users = [
    {
      id: 'naoto',
      name: 'Naoto Watanabe',
      role: 'Driver',
      mode: 'driver',
      icon: Car,
      color: 'bg-zinc-800',
      desc: 'Cockpit View',
      subIcon: Shield
    },
    {
      id: 'kousuke',
      name: 'Kousuke Taira',
      role: 'Passenger',
      mode: 'passenger',
      icon: Utensils,
      color: 'bg-orange-900/40 border-orange-500/30',
      desc: 'Gourmet Guide',
      subIcon: User
    },
    {
      id: 'syunsuke',
      name: 'Syunsuke Haga',
      role: 'Passenger',
      mode: 'passenger',
      icon: Camera,
      color: 'bg-blue-900/40 border-blue-500/30',
      desc: 'Sightseeing Guide',
      subIcon: User
    }
  ] as const;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center p-6"
    >
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-zinc-500 text-xs font-bold tracking-[0.3em] uppercase">Authentication</h2>
          <h1 className="text-3xl font-bold text-white">Welcome Aboard</h1>
        </div>

        <div className="grid gap-3">
          {users.map((u) => (
            <motion.button
              key={u.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(u.name, u.mode)}
              className={`group relative overflow-hidden ${u.color} border border-transparent rounded-2xl p-4 text-left hover:border-white/20 transition-all`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center backdrop-blur-sm">
                  <u.icon size={24} className="text-white/80" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-white leading-tight">{u.name}</div>
                  <div className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                    <u.subIcon size={10} />
                    {u.role} • {u.desc}
                  </div>
                </div>
                <ChevronRight size={20} className="text-white/30 group-hover:text-white transition-colors" />
              </div>
            </motion.button>
          ))}
        </div>
        
        <div className="text-center">
          <p className="text-[10px] text-zinc-600">Sound System Active</p>
        </div>
      </div>
    </motion.div>
  );
};