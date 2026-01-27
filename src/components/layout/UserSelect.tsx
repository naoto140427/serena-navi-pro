import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, ChevronRight, Lock } from 'lucide-react';
import { useNavStore } from '../../store/useNavStore';

// Apple-style Glass Card
const GlassCard = ({ children, className = "", onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <motion.div 
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    whileHover={{ scale: 1.02 }}
    className={`relative overflow-hidden rounded-[24px] border border-white/10 shadow-2xl backdrop-blur-xl bg-[#161618]/80 cursor-pointer transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
);

// Props type definition added
interface UserSelectProps {
  onSelect: () => void;
}

export const UserSelect: React.FC<UserSelectProps> = ({ onSelect }) => {
  const { setCurrentUser, setMode } = useNavStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (user: string, role: 'driver' | 'passenger') => {
    if (user === 'Naoto') {
      setIsAuthenticating(true);
      setTimeout(() => {
        setCurrentUser(user);
        setMode(role);
        onSelect(); // Notify parent component
      }, 1500); 
    } else {
      setCurrentUser(user);
      setMode(role);
      onSelect(); // Notify parent component
    }
  };

  if (isAuthenticating) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
        {/* FaceID Scan Animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-24 h-24 mb-8"
        >
          <div className="absolute inset-0 rounded-full border-4 border-[#0A84FF] opacity-30 animate-ping" />
          <div className="absolute inset-2 rounded-full border-4 border-[#0A84FF] opacity-50 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Lock size={32} className="text-[#0A84FF]" />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h2 className="text-xl font-bold text-white mb-1">Authenticating...</h2>
          <p className="text-zinc-500 text-sm font-mono">System Admin: Naoto</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-blue-900/10 via-black to-purple-900/10 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/5 rounded-[18px] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)]">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome to Serena OS</h1>
          <p className="text-zinc-500 text-sm">Select your identity to continue.</p>
        </div>

        <div className="space-y-4">
          {/* Admin / Driver Login */}
          <GlassCard onClick={() => handleLogin('Naoto', 'driver')} className="p-1 group">
            <div className="flex items-center p-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#0055D4] flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
                <span className="text-lg font-bold">N</span>
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Naoto</h3>
                  <span className="bg-blue-500/20 text-blue-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">ADMIN</span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">Full System Access • Pilot</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-colors">
                <ChevronRight size={16} />
              </div>
            </div>
          </GlassCard>

          {/* Passenger Logins */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <GlassCard onClick={() => handleLogin('Taira', 'passenger')} className="p-4 flex flex-col items-center gap-3 hover:bg-white/5">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5">
                <User size={20} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white">Taira</div>
                <div className="text-[10px] text-zinc-500">Co-Pilot</div>
              </div>
            </GlassCard>

            <GlassCard onClick={() => handleLogin('Haga', 'passenger')} className="p-4 flex flex-col items-center gap-3 hover:bg-white/5">
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 border border-white/5">
                <User size={20} />
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-white">Haga</div>
                <div className="text-[10px] text-zinc-500">Co-Pilot</div>
              </div>
            </GlassCard>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-[10px] text-zinc-700 font-mono">System v3.0.1 (Pro Build)</p>
        </div>
      </motion.div>
    </div>
  );
};