import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useNavStore } from '../../store/useNavStore';
import { calculateDistance } from '../../utils/geo';
import { MapPin } from 'lucide-react';
import type { LineLayer } from 'react-map-gl';

const MAPBOX_TOKEN = "pk.eyJ1IjoibmFvdG8xNTAzMDQiLCJhIjoiY21qenAzMDQzMm1hOTNkb2pleG9sc21vNCJ9.xxpgNjx3zzr-tubIbpw2-Q"; 

// ルート線のスタイル定義 (Navi Blue)
const routeLayer: LineLayer = {
  id: 'route',
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#3b82f6', // Tailwind blue-500
    'line-width': 6,
    'line-opacity': 0.8
  }
};

export const MapWidget: React.FC = () => {
  const { currentLocation, nextWaypoint } = useNavStore();
  const [routeGeoJSON, setRouteGeoJSON] = useState<any>(null);
  const lastFetchLocation = useRef<{ lat: number; lng: number } | null>(null);
  const lastWaypointId = useRef<string | null>(null);

  // デフォルト位置
  const defaultView = {
    latitude: currentLocation?.lat || 33.2382,
    longitude: currentLocation?.lng || 131.6126,
    zoom: 13.5,
    pitch: 50, // よりナビっぽく傾ける
    bearing: 0
  };

  // ルート取得ロジック (Mapbox Directions API)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!currentLocation || !nextWaypoint) return;

      const shouldFetch = (() => {
        if (!lastFetchLocation.current || !lastWaypointId.current) return true;
        if (nextWaypoint.id !== lastWaypointId.current) return true;

        const dist = calculateDistance(
          currentLocation.lat,
          currentLocation.lng,
          lastFetchLocation.current.lat,
          lastFetchLocation.current.lng
        );
        // 50m以上移動したら再取得
        return dist > 0.05;
      })();

      if (!shouldFetch) return;

      const start = [currentLocation.lng, currentLocation.lat];
      const end = [nextWaypoint.coords.lng, nextWaypoint.coords.lat];

      try {
        const query = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?steps=true&geometries=geojson&access_token=${MAPBOX_TOKEN}`
        );
        const json = await query.json();
        
        if (json.routes && json.routes.length > 0) {
          const data = json.routes[0];
          const route = data.geometry;
          
          const geojson = {
            type: 'Feature',
            properties: {},
            geometry: route
          };
          setRouteGeoJSON(geojson);

          // 成功時にキャッシュ更新
          lastFetchLocation.current = { lat: currentLocation.lat, lng: currentLocation.lng };
          lastWaypointId.current = nextWaypoint.id;
        }
      } catch (error) {
        console.error("Route fetch error:", error);
      }
    };

    fetchRoute();
  }, [currentLocation, nextWaypoint]);

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl relative">
      <Map
        initialViewState={defaultView}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1"
        mapboxAccessToken={MAPBOX_TOKEN}
        attributionControl={false}
      >
        {/* ルート線の描画 */}
        {routeGeoJSON && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...routeLayer} />
          </Source>
        )}

        {/* 自分の位置 */}
        {currentLocation && (
          <Marker longitude={currentLocation.lng} latitude={currentLocation.lat} anchor="center">
            <div className="relative">
              <div className="w-5 h-5 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(59,130,246,0.8)] z-10 relative"></div>
              {/* 進行方向の扇形（簡易的） */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full w-24 h-24 bg-gradient-to-t from-blue-500/20 to-transparent -z-10 [clip-path:polygon(50%_100%,0%_0%,100%_0%)]"></div>
            </div>
          </Marker>
        )}

        {/* 次の目的地 */}
        {nextWaypoint && (
          <Marker longitude={nextWaypoint.coords.lng} latitude={nextWaypoint.coords.lat} anchor="bottom">
            <div className="flex flex-col items-center group">
              <div className="bg-zinc-900/90 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-zinc-700 mb-1 whitespace-nowrap shadow-lg group-hover:scale-110 transition-transform">
                {nextWaypoint.name}
                <span className="ml-1 text-zinc-400 font-mono text-[9px]">DEST</span>
              </div>
              <MapPin className="text-red-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]" size={28} fill="#7f1d1d" />
            </div>
          </Marker>
        )}

        <NavigationControl position="bottom-right" showCompass={true} showZoom={false} />
      </Map>
      
      {/* オーバーレイ装飾 */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-mono text-green-400 tracking-wider">GPS ACTIVE</span>
        </div>
      </div>
    </div>
  );
};