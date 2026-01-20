import React from 'react';
import { useNavStore } from '../store/useNavStore';
import { MapWidget } from '../components/widgets/MapWidget';
import { NexcoWidget } from '../components/widgets/NexcoWidget';
import { TrafficTicker } from '../components/widgets/TrafficTicker';
import { HighwaySignWidget } from '../components/widgets/HighwaySignWidget';
import { WeatherWidget } from '../components/widgets/WeatherWidget';
import { InteractionOverlay } from '../components/cockpit/InteractionOverlay'; // 追加
import { Navigation, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export const CockpitPage: React.FC = () => {
  const { trafficInfo, nextWaypoint, currentSpeed, nearestFacilityText } = useNavStore();
  const safeTrafficInfo = trafficInfo || { riskLevel: 0, jamDistance: 0, nextReg: '--' };

  return (
    <div className="h-full flex flex-col gap-4 p-4 pb-24 overflow-y-auto md:overflow-hidden relative bg-cockpit-bg text-cockpit-text-primary font-sans">
      
      {/* ★通知オーバーレイ (最前面) */}
      <InteractionOverlay />
      
      {/* メインエリア */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 min-h-[50vh] md:h-[300px]">
        
        {/* 左側：速度計 & 情報 */}
        <div className="md:col-span-4 flex flex-col gap-4 md:justify-between order-2 md:order-1">
          
          {/* Speedometer Panel */}
          <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-6 border border-cockpit-border text-center md:text-left shadow-lg">
            <div className="text-cockpit-text-muted text-xs font-bold uppercase tracking-wider mb-1 font-mono">Current Speed</div>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-7xl md:text-8xl font-black text-white tracking-tighter font-display">
                {currentSpeed}
              </span>
              <span className="text-xl text-cockpit-text-secondary font-bold">km/h</span>
            </div>
          </div>

          {/* Next Waypoint Panel */}
          <div className="bg-cockpit-panel backdrop-blur-md rounded-xl p-4 border border-cockpit-border">
            <div className="flex items-center gap-2 text-cockpit-text-secondary mb-2">
              <Navigation size={16} />
              <span className="text-xs font-bold tracking-wider">NEXT WAYPOINT</span>
            </div>
            <div className="text-lg md:text-xl font-bold text-white truncate">
              {nextWaypoint ? nextWaypoint.name : 'Destination Reached'}
            </div>
            <div className="text-sm text-cockpit-accent font-mono mt-1">
              {nearestFacilityText}
            </div>
          </div>
        </div>

        {/* 中央〜右側：地図ウィジェット */}
        <div className="md:col-span-8 relative h-[300px] md:h-auto order-1 md:order-2 rounded-2xl overflow-hidden shadow-2xl border border-cockpit-border bg-black">
          <MapWidget />
          
          {/* Right Overlay: NEXCO Info */}
          <div className="absolute top-4 right-4 w-auto md:w-64 z-10">
            <NexcoWidget 
              riskLevel={safeTrafficInfo.riskLevel} 
              jamDistance={safeTrafficInfo.jamDistance} 
              nextReg={safeTrafficInfo.nextReg} 
            />
          </div>

          {/* Left Overlay: Highway Signs */}
          <div className="absolute top-4 left-4 z-10 hidden md:block">
             <HighwaySignWidget />
          </div>
        </div>
      </div>

      {/* 下部：ステータスグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-[200px]">
        
        {/* ProPILOT Status */}
        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-4 border border-cockpit-border flex flex-row md:flex-col items-center justify-between md:justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cockpit-accent/5 animate-pulse group-hover:bg-cockpit-accent/10 transition-colors"></div>
          <div className="flex items-center gap-4 md:flex-col z-10">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-cockpit-accent flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Zap size={20} className="text-cockpit-accent md:scale-125" />
            </div>
            <div className="text-left md:text-center">
              <div className="text-cockpit-accent font-bold tracking-wider text-sm md:text-base">ProPILOT 2.0</div>
              <div className="text-xs text-cockpit-accent/50 font-mono">SYSTEM ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Energy Monitor */}
        <div className="bg-cockpit-panel backdrop-blur-md rounded-2xl p-4 border border-cockpit-border flex flex-col justify-between gap-2">
          <div className="text-cockpit-text-muted text-xs font-bold">ENERGY FLOW</div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-white font-display">4.2</span>
            <span className="text-sm text-cockpit-text-secondary mb-1">km/kWh</span>
          </div>
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: '0%' }}
              animate={{ width: '65%' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />
          </div>
        </div>

        {/* Weather Widget */}
        <WeatherWidget />
      </div>

      <TrafficTicker />
    </div>
  );
};