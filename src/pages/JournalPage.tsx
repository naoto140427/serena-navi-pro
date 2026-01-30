import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl';
import { motion, AnimatePresence } from 'framer-motion';
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
  const currentIdxRef = useRef(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.05);
  
  // UI Throttling
  const [displayTime, setDisplayTime] = useState<string>("--:--");
  const [displayProgress, setDisplayProgress] = useState(0);
  const lastUiUpdateRef = useRef<number>(0);

  const animationRef = useRef<number | null>(null);

  // 現在のDayデータ
  const currentDayLog = useMemo(() => {
    if (!tripData) return null;
    return tripData.days[selectedDayIndex];
  }, [tripData, selectedDayIndex]);

  // Day切り替え時のリセット処理
  useEffect(() => {
    if (currentDayLog && mapRef.current) {
      setIsPlaying(false);
      currentIdxRef.current = 0;
      setDisplayProgress(0);
      
      const startPt = currentDayLog.trackPoints[0];
      
      mapRef.current.flyTo({
        center: [startPt.lon, startPt.lat],
        zoom: 13,
        pitch: 60,
        bearing: 0,
        duration: 2000
      });

      // マーカー位置リセット
      const source = mapRef.current.getSource('cursor-source') as any;
      if (source) {
        source.setData({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [startPt.lon, startPt.lat] }
        });
      }
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
        if (log.days.length > 0) setSelectedDayIndex(log.days.length - 1);
      } catch (err) {
        console.error('Failed to load GPX', err);
        setError('ログ読み込み失敗');
      } finally {
        setIsLoading(false);
      }
    };
    loadTripData();
  }, []);

  const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const y = Math.sin(endLng * (Math.PI/180) - startLng * (Math.PI/180)) * Math.cos(endLat * (Math.PI/180));
    const x = Math.cos(startLat * (Math.PI/180)) * Math.sin(endLat * (Math.PI/180)) -
              Math.sin(startLat * (Math.PI/180)) * Math.cos(endLat * (Math.PI/180)) * Math.cos(endLng * (Math.PI/180) - startLng * (Math.PI/180));
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  // 🚀 高性能アニメーションループ
  const animate = useCallback((timestamp: number) => {
    if (!currentDayLog || !mapRef.current) return;

    let current = currentIdxRef.current;
    const nextIdx = current + playbackSpeed;
    
    if (nextIdx >= currentDayLog.trackPoints.length - 1) {
      setIsPlaying(false);
      return;
    }

    currentIdxRef.current = nextIdx;

    const idxFloor = Math.floor(nextIdx);
    const idxCeil = Math.min(idxFloor + 1, currentDayLog.trackPoints.length - 1);
    const t = nextIdx - idxFloor;

    const p1 = currentDayLog.trackPoints[idxFloor];
    const p2 = currentDayLog.trackPoints[idxCeil];
    
    const currentLat = lerp(p1.lat, p2.lat, t);
    const currentLon = lerp(p1.lon, p2.lon, t);

    // 1. WebGLマーカー更新
    const source = mapRef.current.getSource('cursor-source') as any;
    if (source) {
      source.setData({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [currentLon, currentLat] }
      });
    }

    // 2. スマートカメラ制御
    const lookAheadDistance = Math.max(20, playbackSpeed * 200); 
    const lookAheadIdx = Math.min(idxFloor + Math.floor(lookAheadDistance), currentDayLog.trackPoints.length - 1);
    const pLook = currentDayLog.trackPoints[lookAheadIdx];
    
    // 速度に応じてズームとピッチを動的に変える（Adaptive Camera）
    // 遅い時: Zoom 14.5, Pitch 50 (俯瞰)
    // 速い時: Zoom 11.0, Pitch 75 (疾走感)
    const speedFactor = Math.min(1, playbackSpeed / 1.0); // 0.0 ~ 1.0
    const targetZoom = lerp(14.5, 11.0, speedFactor);
    const targetPitch = lerp(50, 75, speedFactor);

    if (pLook) {
      const bearing = calculateBearing(currentLat, currentLon, pLook.lat, pLook.lon);
      mapRef.current.getMap().jumpTo({
        center: [currentLon, currentLat],
        bearing: bearing,
        pitch: targetPitch,
        zoom: targetZoom
      });
    }

    // 3. UI更新間引き (300ms)
    if (timestamp - lastUiUpdateRef.current > 300) {
      setDisplayTime(p1.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDisplayProgress(nextIdx);
      lastUiUpdateRef.current = timestamp;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [currentDayLog, playbackSpeed]);

  useEffect(() => {
    if (isPlaying) animationRef.current = requestAnimationFrame(animate);
    else if (animationRef.current !== null) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, animate]);

  // ルートラインGeoJSON
  const routeGeoJson = useMemo(() => {
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

  const initialCursorGeoJson = useMemo(() => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [0, 0] }
  }), []);

  const cycleSpeed = () => {
    setPlaybackSpeed(prev => {
      if (prev === 0.05) return 0.2;
      if (prev === 0.2) return 1.0;
      if (prev === 1.0) return 0.01;
      return 0.05;
    });
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  if (error || !tripData) return <div className="min-h-screen bg-black text-white p-8">{error}</div>;

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden group">
      
      {/* 🗺️ MAP */}
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 135.0, latitude: 34.5, zoom: 8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={viewMode === 'velocity' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/satellite-streets-v12"}
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={viewMode === 'altitude' ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
        // 空気感の演出 (Fog & Sky)
        fog={{
          "range": [1, 10],
          "color": "#0a0a0a",
          "horizon-blend": 0.2,
          "high-color": "#222" // 空の色
        }}
      >
        {viewMode === 'altitude' && <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />}
        
        {/* ルートライン */}
        {routeGeoJson && (
          <Source id="route-source" type="geojson" data={routeGeoJson as any}>
            <Layer id="route-layer" type="line" layout={{'line-join':'round', 'line-cap':'round'}} paint={{'line-color': viewMode === 'velocity' ? '#007AFF' : '#FF9500', 'line-width': 4, 'line-opacity': 0.8}} />
            {viewMode === 'velocity' && <Layer id="route-glow" type="line" paint={{'line-color': '#007AFF', 'line-width': 12, 'line-opacity': 0.3, 'line-blur': 10}} />}
          </Source>
        )}

        {/* 🚗 カーソル (WebGL) */}
        <Source id="cursor-source" type="geojson" data={initialCursorGeoJson as any}>
           <Layer id="cursor-glow" type="circle" paint={{'circle-radius': 20, 'circle-color': '#007AFF', 'circle-opacity': 0.3, 'circle-blur': 1}} />
           <Layer id="cursor-dot" type="circle" paint={{'circle-radius': 6, 'circle-color': '#FFFFFF', 'circle-stroke-width': 2, 'circle-stroke-color': '#007AFF'}} />
        </Source>
      </Map>

      {/* 🎬 Cinematic Letterbox (黒帯) */}
      <AnimatePresence>
        {isPlaying && (
          <>
            <motion.div 
              initial={{ height: 0 }} animate={{ height: '10vh' }} exit={{ height: 0 }}
              className="absolute top-0 left-0 right-0 bg-black z-20 pointer-events-none"
            />
            <motion.div 
              initial={{ height: 0 }} animate={{ height: '10vh' }} exit={{ height: 0 }}
              className="absolute bottom-0 left-0 right-0 bg-black z-20 pointer-events-none"
            />
          </>
        )}
      </AnimatePresence>

      {/* UI Overlay (再生中は薄くなる) */}
      <motion.div 
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: isPlaying ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-30">
          <motion.button onClick={() => setAppMode('launcher')} className="pointer-events-auto w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10">
            <ArrowLeft size={20} />
          </motion.button>

          <motion.div className="pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 flex gap-1">
            <button onClick={() => setViewMode('velocity')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'velocity' ? 'bg-blue-600 text-white' : 'text-zinc-400'}`}><Activity size={14} /> Velocity</button>
            <button onClick={() => setViewMode('altitude')} className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 ${viewMode === 'altitude' ? 'bg-orange-500 text-white' : 'text-zinc-400'}`}><Mountain size={14} /> Altitude</button>
          </motion.div>
        </div>

        {/* Day Selector */}
        <div className="absolute top-24 left-0 right-0 flex justify-center z-30">
          <motion.div className="pointer-events-auto bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex gap-1 shadow-2xl overflow-x-auto max-w-[90vw]">
            {tripData.days.map((day, idx) => (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedDayIndex === idx ? 'bg-white text-black shadow-lg' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
              >
                <div className="flex flex-col items-center">
                  <span className="opacity-50 text-[10px] uppercase">DAY {idx + 1}</span>
                  <span>{day.date.slice(5)}</span>
                </div>
              </button>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* 🎬 Bottom Controls (Always visible but styled differently) */}
      <div className={`absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4 z-30 transition-all duration-500 ${isPlaying ? 'translate-y-[-5vh] opacity-80 hover:opacity-100' : ''}`}>
        
        <div className="pointer-events-auto bg-black/60 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl">
          <button onClick={() => { setIsPlaying(false); currentIdxRef.current = 0; setDisplayProgress(0); }} className="text-zinc-400 hover:text-white"><RotateCcw size={20} /></button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={cycleSpeed} className="text-zinc-400 hover:text-white flex flex-col items-center gap-1 min-w-[30px]">
            <FastForward size={20} /> <span className="text-[10px] font-mono">x{playbackSpeed}</span>
          </button>
        </div>

        {/* Info Bar - Show only when needed or simplified */}
        <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4">
           <div className="text-xs font-mono text-zinc-400 w-12">{displayTime}</div>
           <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative">
             <motion.div className="absolute top-0 bottom-0 left-0 bg-blue-500" style={{ width: `${(displayProgress / (currentDayLog?.trackPoints.length || 1)) * 100}%` }} />
           </div>
           <div className="text-xs font-mono text-zinc-400 w-24 text-right">{currentDayLog?.duration}</div>
        </div>
      </div>
    </div>
  );
};