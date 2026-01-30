import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl';
import { motion } from 'framer-motion';
import { Activity, Mountain, ArrowLeft, Loader2, Play, Pause, FastForward, RotateCcw } from 'lucide-react';
import { parseGPX, type MultiDayTripLog } from '../utils/gpxParser';
import { useNavStore } from '../store/useNavStore';

// Mapbox Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type ViewMode = 'velocity' | 'altitude';

export const JournalPage: React.FC = () => {
  const { setAppMode } = useNavStore(); 
  const mapRef = useRef<MapRef>(null);
  
  const [tripData, setTripData] = useState<MultiDayTripLog | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); 
  
  const [viewMode, setViewMode] = useState<ViewMode>('velocity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0); 
  
  // 🚀 初期値を 0.05 (3倍速) に変更。これが「酔わない」黄金比です。
  const [playbackSpeed, setPlaybackSpeed] = useState(0.05); 
  
  const animationRef = useRef<number | null>(null);

  // 現在選択されている日のデータ
  const currentDayLog = useMemo(() => {
    if (!tripData) return null;
    return tripData.days[selectedDayIndex];
  }, [tripData, selectedDayIndex]);

  // Day切り替え時の処理
  useEffect(() => {
    if (currentDayLog && mapRef.current) {
      setIsPlaying(false);
      setCurrentIdx(0);
      const startPt = currentDayLog.trackPoints[0];
      mapRef.current.flyTo({
        center: [startPt.lon, startPt.lat],
        zoom: 14,
        pitch: 0,
        bearing: 0,
        duration: 2000
      });
    }
  }, [selectedDayIndex, currentDayLog]);

  // GPXロード
  useEffect(() => {
    const loadTripData = async () => {
      try {
        const response = await fetch('/trip.gpx');
        if (!response.ok) throw new Error('Trip data not found');
        const text = await response.text();
        const log = parseGPX(text);
        setTripData(log);
        if (log.days.length > 0) {
            setSelectedDayIndex(log.days.length - 1);
        }
      } catch (err) {
        console.error('Failed to load GPX', err);
        setError('ログ読み込み失敗');
      } finally {
        setIsLoading(false);
      }
    };
    loadTripData();
  }, []);

  // 線形補間
  const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

  // Bearing計算
  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const y = Math.sin(endLng * (Math.PI/180) - startLng * (Math.PI/180)) * Math.cos(endLat * (Math.PI/180));
    const x = Math.cos(startLat * (Math.PI/180)) * Math.sin(endLat * (Math.PI/180)) -
              Math.sin(startLat * (Math.PI/180)) * Math.cos(endLat * (Math.PI/180)) * Math.cos(endLng * (Math.PI/180) - startLng * (Math.PI/180));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  // アニメーションループ
  const animate = useCallback(() => {
    if (!currentDayLog || !mapRef.current) return;

    setCurrentIdx(prev => {
      const nextIdx = prev + playbackSpeed;
      
      if (nextIdx >= currentDayLog.trackPoints.length - 1) {
        setIsPlaying(false);
        return currentDayLog.trackPoints.length - 1;
      }

      const idxFloor = Math.floor(nextIdx);
      const idxCeil = Math.min(idxFloor + 1, currentDayLog.trackPoints.length - 1);
      const t = nextIdx - idxFloor;

      const p1 = currentDayLog.trackPoints[idxFloor];
      const p2 = currentDayLog.trackPoints[idxCeil];
      
      const currentLat = lerp(p1.lat, p2.lat, t);
      const currentLon = lerp(p1.lon, p2.lon, t);

      // 🎥 カメラスタビライザー
      // 速度に応じて「視線の先」を調整（速いときは遠くを見る＝ブレない）
      const lookAheadDistance = Math.max(20, playbackSpeed * 200); 
      const lookAheadIdx = Math.min(idxFloor + Math.floor(lookAheadDistance), currentDayLog.trackPoints.length - 1);
      const pLook = currentDayLog.trackPoints[lookAheadIdx];

      // 🎥 ダイナミックズーム
      // スピードが出ている時は少し引く（Zoom Out）
      const targetZoom = Math.max(11, 14.5 - (playbackSpeed * 2)); 

      if (pLook) {
        const bearing = calculateBearing(currentLat, currentLon, pLook.lat, pLook.lon);
        
        mapRef.current?.easeTo({
          center: [currentLon, currentLat],
          bearing: bearing,
          pitch: 60, // 常に斜め視点
          zoom: targetZoom, 
          duration: 0,
          padding: { top: 0, bottom: 0, left: 0, right: 0 }
        });
      }

      animationRef.current = requestAnimationFrame(animate);
      return nextIdx;
    });
  }, [currentDayLog, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) animationRef.current = requestAnimationFrame(animate);
    else if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, animate]);

  // GeoJSON
  const geoJsonData = useMemo(() => {
    if (!currentDayLog) return null;
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: currentDayLog.trackPoints.map(pt => [pt.lon, pt.lat, pt.ele])
      }
    };
  }, [currentDayLog]);

  const currentPositionGeoJson = useMemo(() => {
    if (!currentDayLog) return null;
    const idxFloor = Math.floor(currentIdx);
    const idxCeil = Math.min(idxFloor + 1, currentDayLog.trackPoints.length - 1);
    const t = currentIdx - idxFloor;
    const p1 = currentDayLog.trackPoints[idxFloor];
    const p2 = currentDayLog.trackPoints[idxCeil];
    
    if (!p1 || !p2) return null;
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lerp(p1.lon, p2.lon, t), lerp(p1.lat, p2.lat, t)]
      }
    };
  }, [currentDayLog, currentIdx]);

  // 速度変更ロジック (もっと細かく設定)
  const cycleSpeed = () => {
    setPlaybackSpeed(prev => {
      if (prev === 0.05) return 0.2;  // 快走
      if (prev === 0.2) return 1.0;   // 早送り
      if (prev === 1.0) return 0.01;  // 超スロー
      return 0.05;                    // デフォルトに戻る
    });
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (error || !tripData) return <div className="min-h-screen bg-black text-white p-8">{error}</div>;

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      
      {/* 🗺️ MAP */}
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 135.0, latitude: 34.5, zoom: 8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={viewMode === 'velocity' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/satellite-streets-v12"}
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={viewMode === 'altitude' ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
      >
        {viewMode === 'altitude' && <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />}
        
        {geoJsonData && (
          <Source id="route-source" type="geojson" data={geoJsonData as any}>
            <Layer id="route-layer" type="line" layout={{'line-join':'round', 'line-cap':'round'}} paint={{'line-color': viewMode === 'velocity' ? '#007AFF' : '#FF9500', 'line-width': 4, 'line-opacity': 0.8}} />
            {viewMode === 'velocity' && <Layer id="route-glow" type="line" paint={{'line-color': '#007AFF', 'line-width': 12, 'line-opacity': 0.3, 'line-blur': 10}} />}
          </Source>
        )}

        {currentPositionGeoJson && (
          <Source id="current-pos" type="geojson" data={currentPositionGeoJson as any}>
             <Layer id="point-glow" type="circle" paint={{'circle-radius': 15, 'circle-color': '#FFFFFF', 'circle-opacity': 0.3, 'circle-blur': 1}} />
             <Layer id="point-center" type="circle" paint={{'circle-radius': 6, 'circle-color': '#FFFFFF', 'circle-stroke-width': 2, 'circle-stroke-color': '#007AFF'}} />
          </Source>
        )}
      </Map>

      {/* 🎮 UI: Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none z-10">
        <motion.button onClick={() => setAppMode('launcher')} className="pointer-events-auto w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </motion.button>

        <motion.div className="pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 flex gap-1">
          <button onClick={() => setViewMode('velocity')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'velocity' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}><Activity size={14} /> Velocity</button>
          <button onClick={() => setViewMode('altitude')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'altitude' ? 'bg-orange-500 text-white' : 'text-zinc-400'}`}><Mountain size={14} /> Altitude</button>
        </motion.div>
      </div>

      {/* 📅 Day Selector */}
      <div className="absolute top-24 left-0 right-0 flex justify-center z-10 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-2xl overflow-x-auto max-w-[90vw]"
        >
          {tripData.days.map((day, idx) => (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedDayIndex === idx 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="opacity-50 text-[10px] uppercase">DAY {idx + 1}</span>
                <span>{day.date.slice(5)}</span>
              </div>
            </button>
          ))}
        </motion.div>
      </div>

      {/* 🎬 Bottom Controls */}
      <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4 pointer-events-none z-10">
        
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl">
          <button onClick={() => { setIsPlaying(false); setCurrentIdx(0); }} className="text-zinc-400 hover:text-white"><RotateCcw size={20} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={cycleSpeed} className="text-zinc-400 hover:text-white flex flex-col items-center gap-1 min-w-[30px]">
            <FastForward size={20} /> <span className="text-[10px] font-mono">x{playbackSpeed}</span>
          </button>
        </div>

        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4">
           <div className="text-xs font-mono text-zinc-400 w-12">
             {currentDayLog?.trackPoints[Math.floor(currentIdx)]?.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
           <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
             <motion.div className="absolute top-0 bottom-0 left-0 bg-blue-500" style={{ width: `${(currentIdx / (currentDayLog?.trackPoints.length || 1)) * 100}%` }} />
           </div>
           <div className="text-xs font-mono text-zinc-400 w-24 text-right">
             {currentDayLog?.duration}
           </div>
        </div>
      </div>
    </div>
  );
};