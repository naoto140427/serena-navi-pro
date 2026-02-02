import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Map, { Source, Layer, type MapRef } from 'react-map-gl';
import { MAP_CONFIG } from '../../config/mapConfig';
import type { Coordinates, Waypoint } from '../../types';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapEngineProps {
  currentLocation: Coordinates;
  currentSpeed: number;
  nextWaypoint: Waypoint | null;
  onLoad?: () => void;
}

export const MapEngine: React.FC<MapEngineProps> = ({
  currentLocation,
  currentSpeed,
  nextWaypoint,
  onLoad
}) => {
  const mapRef = useRef<MapRef>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const visualState = useRef({ lat: currentLocation.lat, lng: currentLocation.lng, bearing: 0, speed: 0 });
  const animationRef = useRef<number | null>(null);

  const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

  const calculateBearing = (start: Coordinates, end: Coordinates) => {
    const startLat = start.lat * (Math.PI / 180);
    const startLng = start.lng * (Math.PI / 180);
    const endLat = end.lat * (Math.PI / 180);
    const endLng = end.lng * (Math.PI / 180);
    const y = Math.sin(endLng - startLng) * Math.cos(endLat);
    const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  const updateFrame = useCallback(() => {
    if (!mapRef.current) return;
    const targetLat = currentLocation.lat;
    const targetLng = currentLocation.lng;
    const targetSpeed = currentSpeed || 0;
    const current = visualState.current;

    const smoothLat = lerp(current.lat, targetLat, MAP_CONFIG.INTERPOLATION_FACTOR);
    const smoothLng = lerp(current.lng, targetLng, MAP_CONFIG.INTERPOLATION_FACTOR);
    const smoothSpeed = lerp(current.speed, targetSpeed, 0.05);

    let smoothBearing = current.bearing;
    if (smoothSpeed > 1.0) {
      const rawBearing = calculateBearing({ lat: current.lat, lng: current.lng }, { lat: smoothLat, lng: smoothLng });
      smoothBearing = lerp(current.bearing, rawBearing, 0.05);
    }

    const myLocationSource = mapRef.current.getSource('my-location-source') as any;
    if (myLocationSource) {
      myLocationSource.setData({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [smoothLng, smoothLat] }
      });
    }

    const speedFactor = Math.min(1, smoothSpeed / 100);
    const targetZoom = lerp(MAP_CONFIG.MAX_ZOOM, MAP_CONFIG.MIN_ZOOM, speedFactor);
    const targetPitch = lerp(MAP_CONFIG.MIN_PITCH, MAP_CONFIG.MAX_PITCH, speedFactor);

    mapRef.current.getMap().jumpTo({
      center: [smoothLng, smoothLat],
      zoom: targetZoom,
      pitch: targetPitch,
      bearing: smoothBearing,
      padding: { top: 0, bottom: 200, left: 0, right: 0 }
    });

    visualState.current = { lat: smoothLat, lng: smoothLng, bearing: smoothBearing, speed: smoothSpeed };
    animationRef.current = requestAnimationFrame(updateFrame);
  }, [currentLocation, currentSpeed]);

  useEffect(() => {
    if (isLoaded) animationRef.current = requestAnimationFrame(updateFrame);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isLoaded, updateFrame]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  }, [onLoad]);

  const initialMyPos = useMemo(() => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [currentLocation.lng, currentLocation.lat] } }), []);

  const navLineGeoJson = useMemo(() => {
    if (!nextWaypoint) return null;
    return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[currentLocation.lng, currentLocation.lat], [nextWaypoint.coords.lng, nextWaypoint.coords.lat]] } };
  }, [currentLocation, nextWaypoint]);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ longitude: currentLocation.lng, latitude: currentLocation.lat, zoom: 15, pitch: 60 }}
      onLoad={handleLoad}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}
      fog={{ "range": [0.5, 10], "color": "#050505", "horizon-blend": 0.2, "high-color": "#1a1a1a", "space-color": "#000000", "star-intensity": 0.6 }}
      attributionControl={false}
    >
      <Source id="mapbox-dem" type="raster-dem" url="mapbox://mapbox.mapbox-terrain-dem-v1" tileSize={512} maxzoom={14} />
      {navLineGeoJson && (
        <Source id="nav-line-source" type="geojson" data={navLineGeoJson as any}>
          <Layer id="nav-line-glow" type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#007AFF', 'line-width': 10, 'line-opacity': 0.2, 'line-blur': 10 }} />
          <Layer id="nav-line-core" type="line" layout={{ 'line-join': 'round', 'line-cap': 'round' }} paint={{ 'line-color': '#00C7BE', 'line-width': 4, 'line-opacity': 0.9, 'line-dasharray': [0.5, 2] }} />
        </Source>
      )}
      <Source id="my-location-source" type="geojson" data={initialMyPos as any}>
          <Layer id="my-glow-ring" type="circle" paint={{ 'circle-radius': 40, 'circle-color': '#007AFF', 'circle-opacity': 0.15, 'circle-blur': 0.8, 'circle-pitch-alignment': 'map' }} />
          <Layer id="my-core" type="circle" paint={{ 'circle-radius': 12, 'circle-color': '#FFFFFF', 'circle-stroke-width': 4, 'circle-stroke-color': '#007AFF', 'circle-pitch-alignment': 'map' }} />
      </Source>
    </Map>
  );
};
