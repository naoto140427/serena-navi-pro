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

export interface Waypoint {
  id: string;
  name: string;
  coords: { lat: number; lng: number };
  type: 'start' | 'pickup' | 'parking' | 'sightseeing' | 'hotel' | 'goal';
  description?: string; 
  image?: string;
  // ★ビルドエラー解消用に追加
  address?: string;
  time?: string;
  eta?: string;
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