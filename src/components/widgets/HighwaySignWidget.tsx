import React, { useMemo } from 'react';
import { useNavStore } from '../../store/useNavStore';
import { ChevronUp, Clock, MapPin } from 'lucide-react';

// 距離計算のヘルパー関数（Storeから借りる形ではなく、ここでも計算できるように定義）
const calculateDist = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; // 地球の半径 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const HighwaySignWidget: React.FC = () => {
  const { waypoints, nextWaypoint, currentLocation, currentSpeed } = useNavStore();

  // 次の3つの目的地を算出するロジック
  const upcomingWaypoints = useMemo(() => {
    if (!nextWaypoint || !currentLocation) return [];

    // 現在の目的地のインデックスを探す
    const currentIndex = waypoints.findIndex(w => w.id === nextWaypoint.id);
    if (currentIndex === -1) return [];

    // 現在地〜その先2つ、合計3つを取得
    // ※ typeが 'pickup' や 'ic' などの主要ポイントだけを表示したい場合はここでフィルタリングも可能
    return waypoints.slice(currentIndex, currentIndex + 3).map(wp => {
      const dist = calculateDist(
        currentLocation.lat, 
        currentLocation.lng, 
        wp.coords.lat, 
        wp.coords.lng
      );
      
      // 所要時間計算 (時速80km固定、または現在の速度を使用)
      // ※渋滞時は速度が落ちるので、currentSpeedを使うとリアルになります（ただし0km/hの時は80km/h計算にする）
      const speed = currentSpeed > 10 ? currentSpeed : 80;
      const timeHours = dist / speed;
      const minutes = Math.round(timeHours * 60);

      return {
        ...wp,
        distance: dist,
        minutes: minutes
      };
    });
  }, [waypoints, nextWaypoint, currentLocation, currentSpeed]);

  if (upcomingWaypoints.length === 0) return null;

  return (
    <div className="w-full md:w-64 overflow-hidden rounded-lg shadow-lg border-2 border-white/20">
      {/* 看板ヘッダー（緑色） */}
      <div className="bg-[#006633] p-3 text-center border-b border-white/20">
        <div className="text-white font-bold text-sm tracking-wider flex items-center justify-center gap-2">
          <MapPin size={14} />
          HIGHWAY INFO
        </div>
      </div>

      {/* 看板の中身 */}
      <div className="bg-[#006633] bg-opacity-90 backdrop-blur-sm p-1">
        <div className="flex flex-col gap-[1px] bg-white/10"> {/* 1px gap for separator lines */}
          
          {upcomingWaypoints.map((wp, index) => (
            <div key={wp.id} className="bg-[#006633] p-3 flex items-center justify-between">
              
              {/* 左側：矢印と名前 */}
              <div className="flex items-center gap-3">
                {index === 0 ? (
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white shrink-0 animate-pulse">
                    <ChevronUp size={20} />
                  </div>
                ) : (
                  <div className="w-8 h-8 flex items-center justify-center text-white/50 shrink-0">
                    <span className="font-mono text-xs">{index + 1}</span>
                  </div>
                )}
                
                <div className="flex flex-col">
                  <span className="text-white font-bold text-sm md:text-base leading-tight truncate max-w-[120px]">
                    {wp.name.split(':')[0]} {/* "Pick: 芳賀" の "Pick" のようなプレフィックスがあれば消してもいいが、今回はそのまま表示 */}
                  </span>
                  {/* サブテキスト（種類） */}
                  <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider">
                    {wp.type}
                  </span>
                </div>
              </div>

              {/* 右側：距離と時間 */}
              <div className="flex flex-col items-end">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white font-mono">{Math.round(wp.distance)}</span>
                  <span className="text-xs text-white/70">km</span>
                </div>
                <div className="flex items-center gap-1 text-orange-300">
                  {wp.minutes > 0 ? (
                    <>
                      <Clock size={10} />
                      <span className="text-xs font-bold font-mono">{wp.minutes} min</span>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-green-300">ARRIVING</span>
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};