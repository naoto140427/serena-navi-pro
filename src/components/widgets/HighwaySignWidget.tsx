import React from 'react';
import { useNavStore } from '../../store/useNavStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Coffee, ArrowUp } from 'lucide-react';

export const HighwaySignWidget: React.FC = () => {
  const { nextWaypoint, waypoints } = useNavStore();

  // 次の目的地がない場合は表示しない
  if (!nextWaypoint) return null;

  // デモ用に、次のさらに次の目的地も取得してみる（疑似的な3段表示のため）
  const currentIndex = waypoints.findIndex(w => w.id === nextWaypoint.id);
  const upcomingWaypoints = waypoints.slice(currentIndex, currentIndex + 3);

  return (
    <div className="flex flex-col gap-1 font-sans select-none">
      
      {/* 支柱のような装飾 */}
      <div className="h-4 w-full flex justify-center items-end">
        <div className="w-[90%] h-2 bg-zinc-800 rounded-t-sm" />
      </div>

      {/* 看板本体 (NEXCO Green) */}
      <div className="bg-[#005E4D] text-white p-1 rounded-sm shadow-2xl border-2 border-white/20 min-w-[280px]">
        <div className="border border-white/30 rounded-sm p-3 flex flex-col gap-0 relative overflow-hidden">
          
          {/* 光沢エフェクト (Reflective Sheet) */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

          {/* ヘッダー: 方向 */}
          <div className="flex justify-center items-center mb-2 border-b border-white/30 pb-1">
             <div className="bg-white text-[#005E4D] px-2 py-0.5 text-xs font-bold rounded-sm flex items-center gap-1">
                <ArrowUp size={12} strokeWidth={4} />
                <span>本線</span>
             </div>
          </div>

          {/* リスト表示 */}
          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {upcomingWaypoints.map((wp, index) => {
                const isNext = index === 0; // 一番上が直近
                
                return (
                  <motion.div
                    key={wp.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between ${isNext ? 'py-1' : 'opacity-80 scale-95 origin-left'}`}
                  >
                    {/* 左側: 名称とアイコン */}
                    <div className="flex items-center gap-3">
                      {isNext && (
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center border border-white">
                          {wp.type === 'parking' ? <Coffee size={16} /> : <Navigation size={16} />}
                        </div>
                      )}
                      
                      <div className="flex flex-col">
                        <span className={`font-bold leading-none ${isNext ? 'text-xl' : 'text-base'}`}>
                          {wp.name.split(':')[0]} {/* "Pick:"などを除去して表示しても良い */}
                        </span>
                        {isNext && wp.address && (
                          <span className="text-[10px] text-white/80 scale-90 origin-left mt-0.5">
                            {wp.address}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 右側: 距離 */}
                    <div className="flex items-baseline gap-1">
                      <span className={`font-bold font-display ${isNext ? 'text-2xl text-yellow-300' : 'text-lg'}`}>
                        {isNext ? (Math.random() * 10 + 2).toFixed(1) : (Math.random() * 30 + 15).toFixed(0)}
                      </span>
                      <span className="text-xs">km</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

        </div>
      </div>
      
      {/* 支柱の下部分 */}
       <div className="h-2 w-full flex justify-center">
        <div className="w-[80%] h-full bg-zinc-800 rounded-b-sm shadow-md" />
      </div>
    </div>
  );
};