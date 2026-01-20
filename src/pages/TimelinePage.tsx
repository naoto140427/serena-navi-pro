import React from 'react';
import { useNavStore } from '../store/useNavStore';
import { TimelineItem } from '../components/widgets/TimelineItem';

export const TimelinePage: React.FC = () => {
  const { waypoints, nextWaypoint } = useNavStore();

  return (
    <div className="p-4 pt-12">
      <h1 className="text-2xl font-bold mb-6 px-2">Itinerary</h1>
      <div className="space-y-4 pb-24">
        {waypoints.map((point, index) => {
          // 現在地（次の目的地の一つ前）かどうかを判定
          const isNext = nextWaypoint?.id === point.id;
          // 通過済みかどうか（簡易的にindexで判定）
          const nextIndex = waypoints.findIndex(p => p.id === nextWaypoint?.id);
          const isPassed = index < nextIndex;

          return (
            <TimelineItem 
              key={point.id} 
              item={point}
              // ↓不足していたPropsを追加
              mode="driver" 
              isActive={isNext} 
              isPassed={isPassed}
            />
          );
        })}
      </div>
    </div>
  );
};