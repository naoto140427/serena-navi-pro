import React, { useState, useMemo } from 'react';
import Map, { Source, Layer, NavigationControl } from 'react-map-gl';
import { motion } from 'framer-motion';
import { Upload, Activity, Mountain, ArrowLeft } from 'lucide-react';
import { parseGPX } from '../utils/gpxParser';
import type { TripLog } from '../types';
import { useNavStore } from '../store/useNavStore';

// Mapbox Token (環境変数から取得)
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

type ViewMode = 'velocity' | 'altitude';

export const JournalPage: React.FC = () => {
  // setAppModeをStoreから直接取得
  const { setAppMode } = useNavStore(); 
  
  const [tripLog, setTripLog] = useState<TripLog | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('velocity');
  const [isLoading, setIsLoading] = useState(false);

  // GPXファイルの読み込み処理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const log = await parseGPX(file);
      setTripLog(log);
    } catch (err) {
      console.error('Failed to parse GPX', err);
      alert('GPXファイルの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  // GeoJSONデータの生成（地図描画用）
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

  // 地図の表示範囲（バウンディングボックス）を計算
  const initialViewState = useMemo(() => {
    if (!tripLog || tripLog.trackPoints.length === 0) {
      return { longitude: 135.0, latitude: 34.5, zoom: 8 };
    }
    // 最初の地点を中心にする（本来はfitBoundsすべきですが簡易的に）
    const start = tripLog.trackPoints[0];
    return {
      longitude: start.lon,
      latitude: start.lat,
      zoom: 9,
      pitch: 45, // 3D感を出すために少し傾ける
    };
  }, [tripLog]);

  // --- UI Components ---

  // ファイルアップロード画面
  if (!tripLog) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Upload className="text-blue-400" size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Import GPX Log</h2>
          <p className="text-zinc-400 mb-8 text-sm">
            Drag & drop your touring log here to relive the journey.
          </p>
          
          <label className="block w-full cursor-pointer group">
            <input type="file" accept=".gpx" onChange={handleFileUpload} className="hidden" />
            <div className="w-full py-4 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
              {isLoading ? 'Processing...' : 'Select File'}
            </div>
          </label>
          
          <button 
            onClick={() => setAppMode('launcher')} 
            className="mt-6 text-zinc-500 text-sm hover:text-white transition-colors"
          >
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // 地図画面
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
        {/* 3D Terrain Source (Altitude Modeのみ) */}
        {viewMode === 'altitude' && (
           <Source
             id="mapbox-dem"
             type="raster-dem"
             url="mapbox://mapbox.mapbox-terrain-dem-v1"
             tileSize={512}
             maxzoom={14}
           />
        )}

        {/* 軌跡の描画 */}
        {geoJsonData && (
          <Source id="route-source" type="geojson" data={geoJsonData as any}>
            <Layer
              id="route-layer"
              type="line"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': viewMode === 'velocity' ? '#007AFF' : '#FF9500',
                'line-width': 4,
                'line-opacity': 0.8,
                'line-blur': 1
              }}
            />
            {/* ネオン発光エフェクト (Velocity Modeのみ) */}
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
          onClick={() => setTripLog(null)} // リセットしてアップロード画面へ
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
          <h3 className="text-zinc-400 text-xs font-bold tracking-widest uppercase mb-1">TRIP DATE</h3>
          <div className="text-2xl font-bold text-white mb-4">{tripLog.date}</div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 text-xs">DURATION</div>
              <div className="text-xl font-mono text-white">{tripLog.duration}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs">POINTS</div>
              <div className="text-xl font-mono text-white">{tripLog.trackPoints.length}</div>
            </div>
          </div>
        </div>
      </motion.div>

    </div>
  );
};