export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  name: string;
  coords: Coordinates;
  // hotel, pickup を追加
  type: 'start' | 'goal' | 'parking' | 'sightseeing' | 'food' | 'gas' | 'hotel' | 'pickup';
  description?: string;
  image?: string;
  budget?: string;
  quests?: string[];
  driverIntel?: {
    parking?: string;
    road?: string;
    tips?: string;
  };
  gourmet?: {
    item: string;
    price: string;
    tip: string;
  };
  specs?: {
    toilet: 'clean' | 'normal' | 'none';
    smoking: boolean;
    vending: boolean;
  };
  weather?: {
    // rain を追加
    type: 'sunny' | 'cloudy' | 'rainy' | 'rain' | 'snow' | 'night';
    temp: string;
  };
  scheduledTime?: string;
  // address, eta, time を追加 (TimelineItemなどで使用)
  address?: string;
  eta?: string;
  time?: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  payer: string;
  timestamp: number;
}

export interface TrafficInfo {
  riskLevel: number;
  jamDistance: number;
  nextReg: string;
}

export interface NavState {
  mode: 'driver' | 'passenger';
  currentUser: string | null;
  currentLocation: Coordinates;
  currentSpeed: number;
  currentAreaText: string;
  nearestFacilityText: string;
  todaysGoalText: string;
  nextWaypointEta: string;
  activeNotification: AppNotification | null;
  waypoints: Waypoint[];
  nextWaypoint: Waypoint | null;
  expenses: Expense[];
  trafficInfo: TrafficInfo;
  appMode: AppMode;
}

export interface AppNotification {
  id: string;
  // rest, music を追加
  type: 'info' | 'warning' | 'arrival' | 'chat' | 'rest' | 'music';
  message: string;
  sender: string;
  timestamp: number;
  payload?: any;
}

// TripDataの追加 (tripData.tsで使用)
export interface TripData {
  waypoints: Waypoint[];
}

// --- Journal Types ---

export interface TrackPoint {
  lat: number;
  lon: number;
  ele: number;
  time: Date;
  speed?: number;
}

export interface TripLog {
  id: string;
  title: string;
  date: string;
  distance: number;
  duration: string;
  trackPoints: TrackPoint[];
  waypoints: Waypoint[];
}

export type AppMode = 'launcher' | 'navigation' | 'journal';