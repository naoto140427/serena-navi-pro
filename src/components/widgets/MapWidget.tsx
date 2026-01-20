import React from 'react';
import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavStore } from '../../store/useNavStore';
import { MapPin } from 'lucide-react';

// ↓↓↓ いただいた正しいキーをセットしました ↓↓↓
const MAPBOX_TOKEN = "pk.eyJ1IjoibmFvdG8xNTAzMDQiLCJhIjoiY21qenAzMDQzMm1hOTNkb2pleG9sc21vNCJ9.xxpgNjx3zzr-tubIbpw2-Q"; 

export const MapWidget: React.FC = () => {
  const { currentLocation, nextWaypoint } = useNavStore();

  // デフォルト位置（現在地が取れていない場合は大分を表示）
  const defaultView = {
    latitude: currentLocation?.lat || 33.2382,
    longitude: currentLocation?.lng || 131.6126,
    zoom: 14,
    pitch: 45, // ナビっぽく斜めにする
    bearing: 0
  };

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
      <Map
        initialViewState={defaultView}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1" // ナビ用ダークモード
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {/* 自分の位置 */}
        {currentLocation && (
          <Marker longitude={currentLocation.lng} latitude={currentLocation.lat} anchor="center">
            <div className="relative">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 relative"></div>
              <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              {/* ヘッドライトのような効果 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-500/20 rounded-full blur-xl -z-10"></div>
            </div>
          </Marker>
        )}

        {/* 次の目的地 */}
        {nextWaypoint && (
          <Marker longitude={nextWaypoint.coords.lng} latitude={nextWaypoint.coords.lat} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="bg-zinc-900 text-white text-[10px] px-2 py-1 rounded border border-zinc-700 mb-1 whitespace-nowrap">
                {nextWaypoint.name}
              </div>
              <MapPin className="text-red-500 drop-shadow-lg" size={24} fill="currentColor" />
            </div>
          </Marker>
        )}

        <NavigationControl position="bottom-right" />
      </Map>
      
      {/* オーバーレイ装飾 */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-green-400">GPS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};