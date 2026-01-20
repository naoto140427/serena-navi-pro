import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

// ↓↓↓ ここが重要！受け取るデータの形を定義します（窓口を作る）
interface Props {
  riskLevel: number;   // 0:順調, 1:注意, 2:危険
  jamDistance: number; // 渋滞距離(km)
  nextReg: string;     // 次の規制情報
}

export const NexcoWidget: React.FC<Props> = ({ riskLevel, jamDistance, nextReg }) => {
  
  // 危険度に応じて色を変えるロジック
  const getStatusColor = () => {
    if (riskLevel >= 2) return 'text-red-500';
    if (riskLevel === 1) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getBgColor = () => {
    if (riskLevel >= 2) return 'bg-red-500/10 border-red-500/30';
    if (riskLevel === 1) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-green-500/10 border-green-500/30';
  };

  return (
    <div className={`rounded-xl p-3 border backdrop-blur-md ${getBgColor()} transition-colors duration-500`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* NEXCOロゴっぽい装飾 */}
          <div className="bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded">
            iHighway
          </div>
          <span className="text-xs font-bold text-zinc-300">Traffic Info</span>
        </div>
        
        {/* ステータスアイコン */}
        <div className={`${getStatusColor()} animate-pulse`}>
          {riskLevel > 0 ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between items-end">
          <span className="text-xs text-zinc-400">Status</span>
          <span className={`text-sm font-bold ${getStatusColor()}`}>
            {riskLevel === 0 ? 'ALL CLEAR' : riskLevel === 1 ? 'TRAFFIC JAM' : 'ACCIDENT'}
          </span>
        </div>

        {/* 渋滞がある時だけ表示 */}
        {jamDistance > 0 && (
          <div className="flex justify-between items-end">
            <span className="text-xs text-zinc-400">Delay</span>
            <span className="text-sm font-mono font-bold text-white">
              +{jamDistance} <span className="text-xs text-zinc-500">km</span>
            </span>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-white/10">
           <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-500">Regulation</span>
            <span className="text-xs font-medium text-white truncate max-w-[100px]">
              {nextReg}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};