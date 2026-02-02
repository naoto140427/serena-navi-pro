import React, { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import type { Coordinates } from '../../types';

interface SystemConsoleProps {
  location: Coordinates;
}

export const SystemConsole: React.FC<SystemConsoleProps> = ({ location }) => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const msgs = ["GPS_LOCK_OK", "NET_STABLE", "MEM_OPTIMAL", "FUEL_ECO_MODE", "TRAFFIC_UPDATED"];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
      setLogs(prev => [`[${time}] ${msg}`, ...prev].slice(0, 4));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full font-mono text-[9px] text-[#30D158] leading-relaxed opacity-80 overflow-hidden">
      <div className="flex justify-between border-b border-[#30D158]/20 pb-1 mb-1">
        <span className="flex items-center gap-1"><Terminal size={10} /> SYS.LOG</span>
        <span>ADMIN: NAOTO</span>
      </div>
      <div className="flex justify-between mb-2 text-[8px] text-zinc-500">
        <span>LAT: {location.lat.toFixed(4)}</span>
        <span>LNG: {location.lng.toFixed(4)}</span>
      </div>
      <div className="space-y-0.5">
        {logs.map((log, i) => <div key={i} className="opacity-70">{log}</div>)}
      </div>
    </div>
  );
};
