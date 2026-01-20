// src/types/index.ts

// 地理座標
export interface Coordinates {
  lat: number;
  lng: number;
}

// ウェイポイントの種類
export type WaypointType = 'start' | 'goal' | 'parking' | 'sightseeing' | 'hotel' | 'ic' | 'pickup' | 'waypoint';

// ウェイポイント（目的地・経由地）
export interface Waypoint {
  id: string;
  name: string;
  coords: Coordinates;
  type: WaypointType;
  eta?: string; 
  time?: string; // ★追加: 予定時刻 (tripData.ts用)
  address?: string;
}

// 交通情報
export interface TrafficInfo {
  riskLevel: number; 
  jamDistance: number; 
  nextReg: string; 
}

// 通知
export interface AppNotification {
  id: string;
  type: 'rest' | 'info' | 'warning' | 'music';
  message: string;
  sender?: string;
  timestamp: number;
  payload?: any;
}

// 割り勘
export interface Expense {
  id: string;
  title: string;
  amount: number;
  payer: string;
  timestamp: number;
}

// Storeの状態定義
export interface NavState {
  mode: 'driver' | 'passenger';
  currentUser: string | null;
  currentLocation: Coordinates;
  currentSpeed: number;
  
  currentAreaText: string;
  nearestFacilityText: string;
  todaysGoalText: string;
  nextWaypointEta: string;
  
  waypoints: Waypoint[];
  nextWaypoint: Waypoint | null;
  trafficInfo: TrafficInfo;
  activeNotification: AppNotification | null;
  expenses: Expense[];
}

// 旅程データ全体
export interface TripData {
  title: string;
  date: string;
  car?: string;
  waypoints: Waypoint[];
}