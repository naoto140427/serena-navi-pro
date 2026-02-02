import type { TrackPoint } from '../types';

export interface DailyLog {
  date: string; // "2026/01/26"
  trackPoints: TrackPoint[];
  distance: number;
  duration: string;
}

export interface MultiDayTripLog {
  id: string;
  title: string;
  totalDistance: number;
  totalDuration: string;
  days: DailyLog[]; // 日ごとの配列
}

export const parseGPX = (xmlText: string): MultiDayTripLog => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  const trkpts = xml.getElementsByTagName('trkpt');
  const allPoints: TrackPoint[] = [];

  // 1. 全ポイント抽出
  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    const ele = parseFloat(pt.getElementsByTagName('ele')[0]?.textContent || '0');
    const timeStr = pt.getElementsByTagName('time')[0]?.textContent || '';
    
    if (lat && lon && timeStr) {
      const time = new Date(timeStr);
      if (!isNaN(time.getTime())) {
        allPoints.push({ lat, lon, ele, time });
      }
    }
  }

  // 2. 日付ごとにグループ化
  const daysMap = new Map<string, TrackPoint[]>();
  
  allPoints.forEach(pt => {
    try {
      // 日本時間での日付文字列を生成
      const dateKey = pt.time.toLocaleDateString('ja-JP', {
        year: 'numeric', month: '2-digit', day: '2-digit'
      });

      if (!daysMap.has(dateKey)) {
        daysMap.set(dateKey, []);
      }
      daysMap.get(dateKey)?.push(pt);
    } catch (e) {
      console.warn('Invalid date encountered during grouping:', pt);
    }
  });

  // 3. 配列に変換して整形
  const days: DailyLog[] = Array.from(daysMap.entries()).map(([date, points]) => {
    const start = points[0].time;
    const end = points[points.length - 1].time;
    return {
      date,
      trackPoints: points,
      distance: 0, // 簡易版なので0
      duration: calculateDuration(start, end)
    };
  });

  // 日付順にソート
  days.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return {
    id: `trip_${Date.now()}`,
    title: 'Serena Grand Touring',
    totalDistance: 0,
    totalDuration: '4 Days',
    days
  };
};

const calculateDuration = (start: Date, end: Date) => {
  if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) {
    return "0h 0m";
  }
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};