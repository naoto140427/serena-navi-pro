import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl';
import type { GeoJSONSource } from 'mapbox-gl';
import type { Feature, LineString } from 'geojson';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2, Play, Pause, FastForward, RotateCcw, CloudRain, Sun, Moon, MapPin } from 'lucide-react';
import { parseGPX, type MultiDayTripLog } from '../utils/gpxParser';
import { useNavStore } from '../store/useNavStore';

// Mapbox Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface Memory {
  progress: number;
  type: 'photo' | 'receipt' | 'weather';
  title?: string;
  image?: string;
  msg?: string;
  amount?: string;
  item?: string;
  condition?: 'sunny' | 'rain' | 'sunset' | 'night';
}

// 🎭 MEMORY ASSETS (Demo Data)
const MEMORIES: Memory[] = [
  { progress: 0.1, type: 'photo', title: 'Start: 宝塚', image: 'https://images.unsplash.com/photo-1565675402246-86d708f50c76?q=80&w=800', msg: '伝説の旅、開始。' },
  { progress: 0.25, type: 'receipt', title: 'Highway Toll', amount: '¥3,450', item: '明石海峡大橋' },
  { progress: 0.3, type: 'photo', title: '淡路SA', image: 'https://images.unsplash.com/photo-1596545738622-540c15383501?q=80&w=800', msg: '絶景のスタバ休憩。風強すぎ。' },
  { progress: 0.45, type: 'weather', condition: 'rain' }, // 雨エリア突入
  { progress: 0.6, type: 'receipt', title: 'Gasoline', amount: '¥6,200', item: 'Regular 168/L' },
  { progress: 0.7, type: 'weather', condition: 'sunset' }, // 夕焼け
  { progress: 0.75, type: 'photo', title: '伊予灘SA', image: 'https://images.unsplash.com/photo-1622365289947-66914b306155?q=80&w=800', msg: '世界一美しい夕日。' },
  { progress: 0.9, type: 'receipt', title: 'Ferry Ticket', amount: '¥12,800', item: '国道九四フェリー' },
  { progress: 0.95, type: 'weather', condition: 'night' }, // 夜
];

export const JournalPage: React.FC = () => {
  const { setAppMode } = useNavStore(); 
  const mapRef = useRef<MapRef>(null);
  
  const [tripData, setTripData] = useState<MultiDayTripLog | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const currentIdxRef = useRef(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.05);
  
  // UI State
  const [displayTime, setDisplayTime] = useState<string>("--:--");
  const [progress, setProgress] = useState(0); // 0.0 ~ 1.0
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null); // 現在表示中の思い出
  const [weather, setWeather] = useState<'sunny' | 'rain' | 'sunset' | 'night'>('sunny');

  const animationRef = useRef<number | null>(null);
  const lastUiUpdateRef = useRef<number>(0);

  // Load Data
  useEffect(() => {
    const loadTripData = async () => {
      try {
        const response = await fetch('/trip.gpx');
        if (!response.ok) throw new Error('Trip data not found');
        const text = await response.text();
        const log = parseGPX(text);
        setTripData(log);
        if (log.days.length > 0) setSelectedDayIndex(log.days.length - 1);
      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
    };
    loadTripData();
  }, []);

  const currentDayLog = useMemo(() => tripData?.days[selectedDayIndex], [tripData, selectedDayIndex]);

  // Reset on Day Change
  useEffect(() => {
    if (currentDayLog && mapRef.current) {
      setIsPlaying(false);
      currentIdxRef.current = 0;
      setProgress(0);
      setWeather('sunny');
      setActiveMemory(null);
      
      const startPt = currentDayLog.trackPoints[0];
      mapRef.current.flyTo({ center: [startPt.lon, startPt.lat], zoom: 13, pitch: 60, duration: 2000 });
      
      const source = mapRef.current.getSource('cursor-source') as GeoJSONSource;
      if (source) source.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [startPt.lon, startPt.lat] } });
    }
  }, [selectedDayIndex, currentDayLog]);

  // 🎞️ THE CINEMA ENGINE
  const animate = useCallback((timestamp: number) => {
    if (!currentDayLog || !mapRef.current) return;

    const current = currentIdxRef.current;
    const nextIdx = current + playbackSpeed;
    
    // Loop or Stop
    if (nextIdx >= currentDayLog.trackPoints.length - 1) {
      setIsPlaying(false);
      return;
    }

    currentIdxRef.current = nextIdx;
    
    // Progress Calculation
    const totalPoints = currentDayLog.trackPoints.length;
    const currentProgress = nextIdx / totalPoints;
    
    // --- 🤖 EVENT TRIGGER SYSTEM ---
    const hitMemory = MEMORIES.find(m => Math.abs(m.progress - currentProgress) < 0.005);
    if (hitMemory) {
      if (hitMemory.type === 'weather') {
        setWeather(hitMemory.condition || 'sunny');
      } else if (activeMemory !== hitMemory) {
        setActiveMemory(hitMemory);
        setTimeout(() => setActiveMemory(null), 5000);
      }
    }

    // --- 🗺️ MAP UPDATE ---
    const idxFloor = Math.floor(nextIdx);
    const idxCeil = Math.min(idxFloor + 1, totalPoints - 1);
    const t = nextIdx - idxFloor;
    const p1 = currentDayLog.trackPoints[idxFloor];
    const p2 = currentDayLog.trackPoints[idxCeil];
    
    const currentLat = p1.lat * (1 - t) + p2.lat * t;
    const currentLon = p1.lon * (1 - t) + p2.lon * t;

    // WebGL Marker
    const source = mapRef.current.getSource('cursor-source') as GeoJSONSource;
    if (source) source.setData({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [currentLon, currentLat] } });

    // Adaptive Camera
    const lookAheadIdx = Math.min(idxFloor + Math.floor(Math.max(20, playbackSpeed * 200)), totalPoints - 1);
    const pLook = currentDayLog.trackPoints[lookAheadIdx];
    const speedFactor = Math.min(1, playbackSpeed / 1.0);
    const targetZoom = 14.5 - (speedFactor * 3.5);
    const targetPitch = 50 + (speedFactor * 25);

    if (pLook) {
      const y = Math.sin((pLook.lon - currentLon) * (Math.PI/180)) * Math.cos(pLook.lat * (Math.PI/180));
      const x = Math.cos(currentLat * (Math.PI/180)) * Math.sin(pLook.lat * (Math.PI/180)) -
                Math.sin(currentLat * (Math.PI/180)) * Math.cos(pLook.lat * (Math.PI/180)) * Math.cos((pLook.lon - currentLon) * (Math.PI/180));
      const bearing = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

      mapRef.current.getMap().jumpTo({
        center: [currentLon, currentLat],
        bearing: bearing,
        pitch: targetPitch,
        zoom: targetZoom
      });
    }

    // UI Throttling
    if (timestamp - lastUiUpdateRef.current > 100) {
      setDisplayTime(p1.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setProgress(currentProgress);
      lastUiUpdateRef.current = timestamp;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [currentDayLog, playbackSpeed, activeMemory]);

  useEffect(() => {
    if (isPlaying) animationRef.current = requestAnimationFrame(animate);
    else if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, animate]);

  // Assets
  const routeGeoJson = useMemo<Feature<LineString> | null>(() => currentDayLog ? {
    type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: currentDayLog.trackPoints.map(pt => [pt.lon, pt.lat, pt.ele]) }
  } : null, [currentDayLog]);

  if (isLoading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="h-screen w-full relative bg-black overflow-hidden font-sans">
      
      {/* 🌦️ ATMOSPHERE LAYER */}
      <div className={`absolute inset-0 pointer-events-none z-10 transition-colors duration-[3000ms] 
        ${weather === 'rain' ? 'bg-blue-900/10' : ''}
        ${weather === 'sunset' ? 'bg-orange-500/10 mix-blend-overlay' : ''}
        ${weather === 'night' ? 'bg-black/40' : ''}
      `} />
      
      {/* Rain Effect */}
      {weather === 'rain' && (
        <div className="absolute inset-0 z-10 pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/6/66/Rain_drops_texture.png')] opacity-20 animate-pulse mix-blend-screen" />
      )}

      {/* 🗺️ MAP */}
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 135.0, latitude: 34.5, zoom: 8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
        fog={{
          "range": [1, 10],
          "color": weather === 'sunset' ? "#4a2c2a" : (weather === 'night' ? "#000000" : "#0a0a0a"),
          "high-color": weather === 'sunset' ? "#ffab91" : (weather === 'night' ? "#1a1a1a" : "#222"),
          "horizon-blend": 0.4
        }}
      >
        <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
        {routeGeoJson && (
          <Source id="route-source" type="geojson" data={routeGeoJson}>
            <Layer id="route-layer" type="line" layout={{'line-join':'round', 'line-cap':'round'}} paint={{'line-color': '#007AFF', 'line-width': 4, 'line-opacity': 0.8}} />
            <Layer id="route-glow" type="line" paint={{'line-color': '#007AFF', 'line-width': 12, 'line-opacity': 0.3, 'line-blur': 10}} />
          </Source>
        )}
        <Source id="cursor-source" type="geojson" data={{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } }}>
           <Layer id="cursor-glow" type="circle" paint={{'circle-radius': 20, 'circle-color': '#FFFFFF', 'circle-opacity': 0.3, 'circle-blur': 1}} />
           <Layer id="cursor-dot" type="circle" paint={{'circle-radius': 6, 'circle-color': '#FFFFFF', 'circle-stroke-width': 2, 'circle-stroke-color': '#007AFF'}} />
        </Source>
      </Map>

      {/* 🎬 CINEMATIC BARS */}
      <AnimatePresence>
        {isPlaying && (
          <>
            <motion.div initial={{ height: 0 }} animate={{ height: '8vh' }} exit={{ height: 0 }} className="absolute top-0 left-0 right-0 bg-black z-20 pointer-events-none" />
            <motion.div initial={{ height: 0 }} animate={{ height: '8vh' }} exit={{ height: 0 }} className="absolute bottom-0 left-0 right-0 bg-black z-20 pointer-events-none" />
          </>
        )}
      </AnimatePresence>

      {/* 🏝️ DYNAMIC ISLAND */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <AnimatePresence mode="wait">
          {activeMemory?.type === 'photo' && (
            <motion.div 
              initial={{ width: 120, height: 35, borderRadius: 20 }}
              animate={{ width: 320, height: 'auto', borderRadius: 24 }}
              exit={{ width: 120, height: 35, opacity: 0 }}
              className="bg-black/80 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl pointer-events-auto"
            >
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-zinc-400 text-xs uppercase font-bold tracking-wider">
                  <MapPin size={12} className="text-[#0A84FF]" /> Memory Replay
                </div>
                <img src={activeMemory.image} alt="Memory" className="w-full h-40 object-cover rounded-xl" />
                <div>
                  <h3 className="text-white font-bold text-lg">{activeMemory.title}</h3>
                  <p className="text-zinc-400 text-sm">{activeMemory.msg}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 💸 RECEIPT CARD */}
      <div className="absolute top-24 right-4 z-40 pointer-events-none">
        <AnimatePresence>
          {activeMemory?.type === 'receipt' && (
            <motion.div
              initial={{ x: 100, opacity: 0, rotate: 5 }}
              animate={{ x: 0, opacity: 1, rotate: -2 }}
              exit={{ x: 100, opacity: 0 }}
              className="w-64 bg-[#F2F2F7] text-black p-4 rounded-sm shadow-2xl font-mono relative overflow-hidden pointer-events-auto"
              style={{ clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 90% 95%, 85% 100%, 80% 95%, 75% 100%, 70% 95%, 65% 100%, 60% 95%, 55% 100%, 50% 95%, 45% 100%, 40% 95%, 35% 100%, 30% 95%, 25% 100%, 20% 95%, 15% 100%, 10% 95%, 5% 100%, 0 95%)' }}
            >
              <div className="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                <h3 className="font-bold tracking-widest text-lg">SERENA CAFE</h3>
                <p className="text-xs text-gray-500">2026.01.29 - {displayTime}</p>
              </div>
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm">{activeMemory.title}</span>
                <span className="font-bold text-lg">{activeMemory.amount}</span>
              </div>
              <div className="text-xs text-gray-500 mb-4">{activeMemory.item}</div>
              
              <motion.div 
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
                className="absolute bottom-2 right-2 border-2 border-red-500 text-red-500 px-2 py-1 text-xs font-bold -rotate-12 rounded-sm"
              >
                PAID
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🎮 CONTROLS */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: isPlaying ? 0.4 : 1 }}>
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-auto z-30">
          <button onClick={() => setAppMode('launcher')} className="w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 flex gap-1">
            {tripData?.days.map((_, idx) => (
              <button key={idx} onClick={() => setSelectedDayIndex(idx)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedDayIndex === idx ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'}`}>
                DAY {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Player */}
        <div className="absolute bottom-10 left-6 right-6 flex flex-col items-center gap-4 z-30 pointer-events-auto">
          <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-full px-6 py-4 flex items-center gap-6 shadow-2xl hover:scale-105 transition-transform">
            <button onClick={() => { setIsPlaying(false); currentIdxRef.current = 0; }} className="text-zinc-400 hover:text-white"><RotateCcw size={20} /></button>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
            </button>
            <button onClick={() => setPlaybackSpeed(prev => prev === 0.05 ? 0.2 : (prev === 0.2 ? 1.0 : 0.05))} className="text-zinc-400 hover:text-white flex flex-col items-center gap-1 min-w-[30px]">
              <FastForward size={20} /> <span className="text-[9px] font-mono">x{playbackSpeed}</span>
            </button>
          </div>

          <div className="w-full max-w-2xl bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4">
             <div className="text-xs font-mono text-zinc-400 w-12">{displayTime}</div>
             <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
               const rect = e.currentTarget.getBoundingClientRect();
               const x = e.clientX - rect.left;
               const newProgress = x / rect.width;
               currentIdxRef.current = newProgress * (currentDayLog?.trackPoints.length || 0);
               setProgress(newProgress);
             }}>
               <motion.div className="absolute top-0 bottom-0 left-0 bg-[#0A84FF]" style={{ width: `${progress * 100}%` }} />
               {MEMORIES.map((m, i) => (
                 <div key={i} className={`absolute top-0 bottom-0 w-0.5 ${m.type === 'weather' ? 'bg-zinc-600' : 'bg-white'} opacity-50`} style={{ left: `${m.progress * 100}%` }} />
               ))}
             </div>
             <div className="text-xs font-mono text-zinc-400 w-24 text-right flex items-center justify-end gap-2">
               {weather === 'rain' && <CloudRain size={12} />}
               {weather === 'sunny' && <Sun size={12} />}
               {weather === 'sunset' && <Sun size={12} className="text-orange-500" />}
               {weather === 'night' && <Moon size={12} />}
               <span>{currentDayLog?.duration}</span>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};