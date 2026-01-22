export interface NavState {
  mode: 'driver' | 'passenger';
  currentUser: string | null;
  currentLocation: { lat: number; lng: number };
  currentSpeed: number;
  currentAreaText: string;
  nearestFacilityText: string;
  todaysGoalText: string;
  nextWaypointEta: string;
  activeNotification: AppNotification | null;
  expenses: Expense[];
  trafficInfo?: {
    riskLevel: number;
    jamDistance: number;
    nextReg: string;
  };
  waypoints: Waypoint[];
  nextWaypoint: Waypoint | null;
}

// src/types/index.ts

export interface Waypoint {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  type: 'start' | 'pickup' | 'parking' | 'sightseeing' | 'hotel' | 'goal';
  description?: string; 
  image?: string;
  address?: string;
  time?: string;
  eta?: string;
  quests?: string[];
  tips?: string;
  budget?: string;
  
  driverIntel?: {
    parking: string;
    road?: string;
  };
  
  gourmet?: {
    item: string;
    price?: string;
    tip?: string;
  };

  specs?: {
    toilet: 'clean' | 'normal' | 'none';
    smoking: boolean;
    vending: boolean;
  };

  // ★今回追加: 天気とスケジュール
  weather?: {
    type: 'sunny' | 'cloudy' | 'rain' | 'snow';
    temp: string; // "12°C"
  };
  scheduledTime?: string; // "14:00" (予定時刻)
}
export interface Expense {
  id: string;
  title: string;
  amount: number;
  payer: string;
  timestamp: number;
}

export interface AppNotification {
  id: string;
  // ★ 'warning' を追加
  type: 'rest' | 'music' | 'info' | 'warning';
  message: string;
  sender: string;
  timestamp: number;
  payload?: any;
}

// ★ TripData型を追加 (tripData.tsのエラー解消用)
export interface TripData {
  id: string;
  name: string;
  date: string;
  waypoints: Waypoint[];
}