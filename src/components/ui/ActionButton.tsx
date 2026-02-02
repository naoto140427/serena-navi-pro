import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  onClick?: () => void;
  color?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
  color = "text-white"
}) => (
  <button
    onClick={onClick}
    className={`relative group flex flex-col items-center justify-center gap-1 w-full aspect-square rounded-2xl border transition-all duration-200 ${active ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.4)]' : 'bg-zinc-900/50 text-zinc-400 border-white/5 hover:bg-zinc-800'}`}
  >
    <Icon size={24} className={active ? "text-black" : color} strokeWidth={2.5} />
    <span className="text-[9px] font-bold uppercase tracking-wide">{label}</span>
    {active && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#FF453A] rounded-full animate-pulse" />}
  </button>
);
