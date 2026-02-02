import React from 'react';
import { motion } from 'framer-motion';

interface SpeedometerProps {
  speed: number;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ speed }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      <div className="absolute inset-2 rounded-full border border-white/5" />
      <div className="absolute inset-8 rounded-full border border-dashed border-white/10 opacity-50" />
      <svg className="absolute inset-0 w-full h-full -rotate-90 p-4">
        <circle cx="50%" cy="50%" r="42%" fill="none" stroke="#333" strokeWidth="6" strokeDasharray="75 25" strokeDashoffset="0" strokeLinecap="round" />
        <motion.circle cx="50%" cy="50%" r="42%" fill="none" stroke={speed > 100 ? '#FF453A' : '#0A84FF'} strokeWidth="6" strokeDasharray="75 25" strokeDashoffset="0" initial={{ pathLength: 0 }} animate={{ pathLength: Math.min(speed / 180, 0.75) }} strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(10,132,255,0.5)]" />
      </svg>
      <div className="flex flex-col items-center z-10">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1">Ground Speed</span>
        <div className="flex items-baseline gap-1">
          <span className="text-7xl font-bold text-white font-mono tracking-tighter tabular-nums">{Math.round(speed)}</span>
          <span className="text-lg font-medium text-zinc-500">km/h</span>
        </div>
      </div>
    </div>
  );
};
