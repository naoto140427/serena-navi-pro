import React, { useState, useMemo, useEffect } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { motion } from 'framer-motion';
import { Activity, Mountain, ArrowLeft, Loader2 } from 'lucide-react';
import { parseGPX } from '../utils/gpxParser';
import type { TripLog } from '../types';
import { useNavStore } from '../store/useNavStore';

// Mapbox Token
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type ViewMode = 'velocity' | 'altitude';

export const JournalPage: React.FC = () => {
  const { setAppMode } = useNavStore(); 
  
  const [tripLog, setTripLog] = useState<TripLog | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('velocity');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 起動時に自動で GPXファイルを fetch する
  useEffect(() => {
    const loadTripData = async () => {
      try {
        // publicフォルダの trip.gpx を取得
        const response = await fetch('/trip.gpx');
        if (!response.ok) {
          throw new Error('Trip data not found');
        }
        const text = await response.text();
        const log = parseGPX(text);
        setTripLog(log);
      } catch (err) {
        console.error('Failed to load GPX', err);
        setError('ログデータの読み込みに失敗しました。publicフォルダに trip.gpx はありますか？');
      } finally {
        setIsLoading(false);
      }
    };

    loadTripData();
  }, []);

  // GeoJSONデータの生成
  const geoJsonData = useMemo(() => {
    if (!tripLog) return null;
    const coordinates = tripLog.trackPoints.map(pt => [pt.lon, pt.lat, pt.ele]);
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: coordinates
      }
    };
  }, [tripLog]);

  // 初期表示位置
  const initialViewState = useMemo(() => {
    if (!tripLog || tripLog.trackPoints.length === 0) {
      return { longitude: 135.0, latitude: 34.5, zoom: 8 };
    }
    // 四国全体が見えるような初期位置（おおよそ）
    return {
      longitude: 133.5,
      latitude: 33.8,
      zoom: 7.5,
      pitch: 45,
    };
  }, [tripLog]);

  // --- UI Components ---

  // ローディング画面
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="text-zinc-400 animate-pulse">Accessing Serena's Memory Bank...</p>
      </div>
    );
  }

  // エラー画面
  if (error || !tripLog) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8 text-center">
        <p className="text-red-500 mb-4 font-bold">{error}</p>
        <button 
          onClick={() => setAppMode('launcher')} 
          className="px-6 py-2 bg-zinc-800 rounded-full hover:bg-zinc-700 transition-colors"
        >
          Return to Launcher
        </button>
      </div>
    );
  }

  // 地図画面 (メイン)
  return (
    <div className="h-screen w-full relative bg-black overflow-hidden">
      
      {/* 🗺️ MAPBOX */}
      <Map
        initialViewState={initialViewState}
        style={{ width: '100%', height: '100%' }}
        mapStyle={viewMode === 'velocity' 
          ? "mapbox://styles/mapbox/dark-v11" 
          : "mapbox://styles/mapbox/satellite-streets-v12"}
        mapboxAccessToken={MAPBOX_TOKEN}
        terrain={viewMode === 'altitude' ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
      >
        {viewMode === 'altitude' && (
           <Source
             id="mapbox-dem"
             type="raster-dem"
             url="mapbox://mapbox.mapbox-terrain-dem-v1"
             tileSize={512}
             maxzoom={14}
           />
        )}

        {geoJsonData && (
          <Source id="route-source" type="geojson" data={geoJsonData as any}>
            <Layer
              id="route-layer"
              type="line"
              layout={{ 'line-join': 'round', 'line-cap': 'round' }}
              paint={{
                'line-color': viewMode === 'velocity' ? '#007AFF' : '#FF9500',
                'line-width': 4,
                'line-opacity': 0.8,
                'line-blur': 1
              }}
            />
            {viewMode === 'velocity' && (
              <Layer
                id="route-glow"
                type="line"
                paint={{
                  'line-color': '#007AFF',
                  'line-width': 12,
                  'line-opacity': 0.3,
                  'line-blur': 10
                }}
              />
            )}
          </Source>
        )}
        
        <NavigationControl position="bottom-right" />
      </Map>

      {/* 🎮 UI OVERLAYS */}
      
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setAppMode('launcher')} // ランチャーに戻る
          className="pointer-events-auto w-12 h-12 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 text-white hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={20} />
        </motion.button>

        {/* View Mode Switcher */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pointer-events-auto bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-1 flex gap-1"
        >
          <button
            onClick={() => setViewMode('velocity')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              viewMode === 'velocity' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity size={14} /> Velocity
          </button>
          <button
            onClick={() => setViewMode('altitude')}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              viewMode === 'altitude' ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/50' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mountain size={14} /> Altitude
          </button>
        </motion.div>
      </div>

      {/* Stats Panel (Bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 left-6 right-6 md:left-auto md:right-6 md:w-80 pointer-events-none"
      >
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-1">TRIP LOG</h3>
          <div className="text-2xl font-bold text-white mb-4">{tripLog.title}</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 text-xs">DATE</div>
              <div className="text-lg font-mono text-white">{tripLog.date}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs">DURATION</div>
              <div className="text-lg font-mono text-white">{tripLog.duration}</div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};