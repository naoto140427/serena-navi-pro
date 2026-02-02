export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: string;
  name: string;
  coords: Coordinates;
  // Added: hotel, pickup
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
    // Added: rain
    type: 'sunny' | 'cloudy' | 'rainy' | 'rain' | 'snow' | 'night';
    temp: string;
  };
  scheduledTime?: string;
  // Added: address, eta, time (Used in TimelineItem, etc.)
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

export interface NotificationPayload {
  tts?: string;
  [key: string]: unknown;
}

export interface AppNotification {
  id: string;
  // Added: rest, music, alert
  type: 'info' | 'warning' | 'arrival' | 'chat' | 'rest' | 'music' | 'alert';
  message: string;
  sender: string;
  timestamp: number;
  payload?: NotificationPayload;
}

// Added: TripData (Used in tripData.ts)
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
