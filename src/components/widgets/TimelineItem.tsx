import React from 'react';
import type { Waypoint } from '../../types';
import { MapPin, Coffee, Camera, Hotel, Home, Flag } from 'lucide-react';

interface TimelineItemProps {
  item: Waypoint;
  isLast?: boolean;
  // ★追加: 呼び出し元(TimelinePage)から渡されるPropsを受け入れる
  mode?: string;
  isActive?: boolean;
  isPassed?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  item, 
  isLast, 
  isActive = false, 
  isPassed = false 
}) => {
  
  // アイコンの出し分け
  const getIcon = () => {
    switch (item.type) {
      case 'start': return <Home size={18} />;
      case 'goal': return <Flag size={18} />;
      case 'parking': return <Coffee size={18} />;
      case 'sightseeing': return <Camera size={18} />;
      case 'hotel': return <Hotel size={18} />;
      case 'pickup': return <MapPin size={18} />;
      default: return <MapPin size={18} />;
    }
  };

  // ステータスに応じた色設定
  const getColorClass = () => {
    if (isActive) return 'bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]';
    if (isPassed) return 'bg-zinc-800 text-zinc-500'; // 通過済みは暗く
    
    // まだ来ていない場所の色分け
    switch (item.type) {
      case 'start':
      case 'goal': return 'bg-indigo-600 text-white';
      case 'parking': return 'bg-emerald-600 text-white';
      case 'sightseeing': return 'bg-amber-600 text-white';
      case 'pickup': return 'bg-orange-600 text-white';
      default: return 'bg-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className={`flex gap-4 relative ${isPassed ? 'opacity-60' : 'opacity-100'}`}>
      {/* タイムラインの線 */}
      {!isLast && (
        <div className={`absolute left-[19px] top-10 bottom-[-16px] w-0.5 ${isPassed ? 'bg-blue-900/30' : 'bg-zinc-800'}`} />
      )}

      {/* アイコンバッジ */}
      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-black transition-all duration-300 ${getColorClass()} ${isActive ? 'scale-110' : ''}`}>
        {getIcon()}
      </div>

      {/* コンテンツ */}
      <div className="flex-1 pb-8">
        <div className={`border rounded-xl p-4 transition-colors ${
          isActive 
            ? 'bg-zinc-900/80 border-blue-500/50 shadow-lg shadow-blue-900/20' 
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex justify-between items-start mb-1">
            <h3 className={`font-bold ${isPassed ? 'text-zinc-500' : 'text-white'}`}>
              {item.name}
            </h3>
            {/* time または eta を表示 */}
            {(item.time || item.eta) && (
              <span className={`text-xs font-mono px-2 py-1 rounded ${
                isActive ? 'bg-blue-900/30 text-blue-300' : 'bg-zinc-950 text-zinc-500'
              }`}>
                {item.time || `ETA ${item.eta}`}
              </span>
            )}
          </div>
          {item.address && (
            <p className="text-xs text-zinc-600 truncate">{item.address}</p>
          )}
        </div>
      </div>
    </div>
  );
};