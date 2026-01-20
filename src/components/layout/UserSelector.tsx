import React from 'react';
import { useNavStore } from '../../store/useNavStore';
import { motion } from 'framer-motion';
import { User, Users, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserSelectorProps {
  onSelect: () => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ onSelect }) => {
  const { setCurrentUser, setMode } = useNavStore();
  const navigate = useNavigate();

  const handleSelect = (user: string, role: 'driver' | 'passenger') => {
    setCurrentUser(user);
    setMode(role);
    if (role === 'passenger') {
      navigate('/copilot');
    } else {
      navigate('/');
    }
    onSelect();
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[90] flex flex-col items-center justify-center p-6">
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-2xl text-center"
      >
        <h2 className="text-2xl text-white font-bold mb-8 tracking-widest uppercase">Select Profile</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Driver: Naoto */}
          <motion.button
            variants={item}
            onClick={() => handleSelect('Naoto', 'driver')}
            className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center gap-4 hover:border-blue-500 hover:bg-zinc-800 transition-all active:scale-95"
          >
            <div className="w-20 h-20 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 group-hover:border-blue-500 group-hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all">
              <ShieldCheck size={40} className="text-blue-500" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">NAOTO</div>
              <div className="text-blue-500 text-xs tracking-wider font-mono">CHIEF PILOT</div>
            </div>
          </motion.button>

          {/* Co-Pilot: Taira */}
          <motion.button
            variants={item}
            onClick={() => handleSelect('Taira', 'passenger')}
            className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center gap-4 hover:border-purple-500 hover:bg-zinc-800 transition-all active:scale-95"
          >
            <div className="w-20 h-20 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/30 group-hover:border-purple-500 group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all">
              <Users size={40} className="text-purple-500" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">TAIRA</div>
              <div className="text-purple-500 text-xs tracking-wider font-mono">CO-PILOT</div>
            </div>
          </motion.button>

          {/* Co-Pilot: Haga */}
          <motion.button
            variants={item}
            onClick={() => handleSelect('Haga', 'passenger')}
            className="group relative bg-zinc-900 border border-zinc-800 p-8 rounded-2xl flex flex-col items-center gap-4 hover:border-pink-500 hover:bg-zinc-800 transition-all active:scale-95"
          >
            <div className="w-20 h-20 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/30 group-hover:border-pink-500 group-hover:shadow-[0_0_30px_rgba(236,72,153,0.3)] transition-all">
              <User size={40} className="text-pink-500" />
            </div>
            <div>
              <div className="text-white font-bold text-lg">HAGA</div>
              <div className="text-pink-500 text-xs tracking-wider font-mono">CO-PILOT</div>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};