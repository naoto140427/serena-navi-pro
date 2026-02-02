import React from 'react';
import { Navigation } from 'lucide-react';
import type { Waypoint } from '../../types';

interface NavModuleProps {
  nextWaypoint: Waypoint | null;
  distance: string;
}

export const NavModule: React.FC<NavModuleProps> = ({ nextWaypoint, distance }) => (
  <div className="flex flex-col justify-between h-full p-1">
    <div className="flex items-start gap-4">
      <div className="w-14 h-14 bg-[#0A84FF] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(10,132,255,0.4)]">
        <Navigation size={32} className="text-white fill-white" />
      </div>
      <div>
        <div className="text-[11px] font-bold text-[#0A84FF] uppercase tracking-wider mb-1">Next Waypoint</div>
        <div className="text-2xl font-bold text-white leading-none tracking-tight line-clamp-1">
          {nextWaypoint?.name || "Destination"}
        </div>
        <div className="text-sm text-zinc-400 mt-1 font-mono">{distance}</div>
      </div>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden flex">
      <div className="w-1/3 h-full bg-[#30D158]" />
      <div className="w-1/3 h-full bg-[#FFD60A]" />
      <div className="w-1/3 h-full bg-zinc-700" />
    </div>
  </div>
);
