import type { TrackPoint, TripLog } from '../types';

// 入力を File から string (XMLテキスト) に変更
export const parseGPX = (xmlText: string): TripLog => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "application/xml");

  const trackPoints: TrackPoint[] = [];
  const trkpts = xml.getElementsByTagName('trkpt');

  // 1. 軌跡データの抽出
  for (let i = 0; i < trkpts.length; i++) {
    const pt = trkpts[i];
    const lat = parseFloat(pt.getAttribute('lat') || '0');
    const lon = parseFloat(pt.getAttribute('lon') || '0');
    const ele = parseFloat(pt.getElementsByTagName('ele')[0]?.textContent || '0');
    const timeStr = pt.getElementsByTagName('time')[0]?.textContent || '';
    
    if (lat && lon && timeStr) {
      trackPoints.push({
        lat,
        lon,
        ele,
        time: new Date(timeStr)
      });
    }
  }

  // 2. メタデータの生成
  const startTime = trackPoints[0]?.time;
  const endTime = trackPoints[trackPoints.length - 1]?.time;
  
  return {
    id: `trip_${startTime ? startTime.getTime() : Date.now()}`,
    title: 'Serena Touring 2026 Winter',
    date: startTime ? startTime.toLocaleDateString() : new Date().toLocaleDateString(),
    distance: 0,
    duration: endTime && startTime ? calculateDuration(startTime, endTime) : '00:00',
    trackPoints,
    waypoints: []
  };
};

const calculateDuration = (start: Date, end: Date) => {
  const diff = end.getTime() - start.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
};