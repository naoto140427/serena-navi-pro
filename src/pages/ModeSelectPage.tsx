import React from 'react';
import { motion } from 'framer-motion';
import { Navigation, BookOpen, Map, Settings, ChevronRight } from 'lucide-react';

interface ModeSelectPageProps {
  onSelectMode: (mode: 'navigation' | 'journal') => void;
}

interface ModeCardProps {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  onClick: () => void;
  delay: number;
}

const ModeCard = ({ title, subtitle, icon: Icon, color, onClick, delay }: ModeCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={onClick}
    whileTap={{ scale: 0.98 }}
    className="relative h-64 rounded-[32px] overflow-hidden cursor-pointer group"
  >
    {/* Background with Blur */}
    <div className={`absolute inset-0 ${color} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
    <div className="absolute inset-0 backdrop-blur-3xl" />
    
    {/* Content */}
    <div className="relative z-10 h-full p-8 flex flex-col justify-between border border-white/10 rounded-[32px]">
      <div className="flex justify-between items-start">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/5">
          <Icon size={28} className="text-white" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight size={20} className="text-white/50" />
        </div>
      </div>

      <div>
        <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{title}</h3>
        <p className="text-zinc-400 font-medium text-sm">{subtitle}</p>
      </div>
    </div>
  </motion.div>
);

export const ModeSelectPage: React.FC<ModeSelectPageProps> = ({ onSelectMode }) => {
  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-5xl mx-auto">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="mb-12 text-center"
      >
        <h1 className="text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase mb-4">Serena Navi Pro OS</h1>
        <div className="text-5xl font-bold text-white tracking-tighter">
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Naoto</span>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Navigation Mode */}
        <ModeCard 
          title="Navigation" 
          subtitle="Real-time cockpit & co-pilot assistance."
          icon={Navigation}
          color="bg-blue-600"
          delay={0.1}
          onClick={() => onSelectMode('navigation')}
        />

        {/* Journal Mode */}
        <ModeCard 
          title="Journal" 
          subtitle="Relive your journey. The trace of memories."
          icon={BookOpen}
          color="bg-orange-500"
          delay={0.2}
          onClick={() => onSelectMode('journal')}
        />

      </div>

      {/* Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-12 flex justify-center gap-6 text-zinc-600"
      >
        <div className="flex items-center gap-2 text-xs font-mono">
          <Map size={12} />
          <span>LAST TRIP: 430KM (OITA)</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Settings size={12} />
          <span>SYSTEM: NORMAL</span>
        </div>
      </motion.div>
    </div>
  );
};