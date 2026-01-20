import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push } from 'firebase/database';
// ★修正: import type を使用
import type { NavState, Waypoint, Expense, AppNotification } from '../types';

// Storeのアクション定義
interface NavActions {
  setMode: (mode: 'driver' | 'passenger') => void;
  setCurrentUser: (name: string) => void;
  setNextWaypoint: (id: string) => void;
  
  initializeSync: () => void;
  
  sendNotification: (notification: Omit<AppNotification, 'timestamp'>) => void;
  clearNotification: () => void;
  
  addExpense: (title: string, amount: number, payer: string) => void;
  removeExpense: (id: string) => void;
  
  updateLocation: (lat: number, lng: number, speed: number | null) => void;
}

// 距離計算ヘルパー
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// エリア判定ヘルパー
const guessLocationName = (_lat: number, lng: number) => {
  if (lng < 131.0) return "福岡県 / 関門エリア";
  if (lng < 131.8) return "大分県内"; 
  if (lng < 132.5) return "山口県 / 岩国周辺";
  if (lng < 133.5) return "広島県内";
  if (lng < 134.5) return "岡山県内";
  if (lng < 135.5) return "兵庫県 / 大阪府";
  if (lng < 136.0) return "京都府 / 滋賀県";
  if (lng < 137.0) return "三重県 / 伊勢エリア";
  return "現在地特定中...";
};

export const useNavStore = create<NavState & NavActions>((set, get) => ({
  // --- Initial State ---
  mode: 'driver',
  currentUser: null,
  currentLocation: { lat: 33.205, lng: 131.705 }, 
  currentSpeed: 0,
  currentAreaText: "READY TO DEPART",
  nearestFacilityText: "GPS信号 待機中...",
  todaysGoalText: "目的地計算中...",
  nextWaypointEta: "--:--",
  activeNotification: null,
  expenses: [],
  trafficInfo: {
    riskLevel: 0,
    jamDistance: 0,
    nextReg: '順調'
  },

  // 旅程データ
  waypoints: [
    { id: '1', name: 'Start: 自宅', coords: { lat: 33.205, lng: 131.705 }, type: 'pickup' },
    { id: '2', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.226, lng: 131.685 }, type: 'pickup' },
    { id: '3', name: 'Pick: 平良 (萩原)', coords: { lat: 33.243, lng: 131.635 }, type: 'pickup' },
    { id: '4', name: 'めかりPA (夜景)', coords: { lat: 33.95, lng: 130.95 }, type: 'parking' },
    { id: '5', name: '宮島SA (深夜休憩)', coords: { lat: 34.33, lng: 132.30 }, type: 'parking' },
    { id: '6', name: '土山SA (朝食)', coords: { lat: 34.93, lng: 136.33 }, type: 'parking' },
    { id: '7', name: '伊勢神宮', coords: { lat: 34.45, lng: 136.72 }, type: 'sightseeing' },
    { id: '8', name: 'おかげ横丁', coords: { lat: 34.46, lng: 136.72 }, type: 'sightseeing' },
    { id: '9', name: '鳥羽展望台', coords: { lat: 34.44, lng: 136.88 }, type: 'sightseeing' },
    { id: '10', name: 'Hotel: 伊勢志摩', coords: { lat: 34.30, lng: 136.80 }, type: 'hotel' },
    { id: '18', name: 'Goal: 自宅', coords: { lat: 33.205, lng: 131.705 }, type: 'ic' },
  ],

  nextWaypoint: { id: '2', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.226, lng: 131.685 }, type: 'pickup' } as Waypoint,

  // --- Actions ---
  setMode: (mode) => set({ mode }),
  setCurrentUser: (name) => set({ currentUser: name }),
  setNextWaypoint: (id) => set((state) => ({ 
    nextWaypoint: state.waypoints.find(w => w.id === id) || null 
  })),

  initializeSync: () => {
    // Notification Listener
    const notifRef = ref(db, 'state/activeNotification');
    onValue(notifRef, (snapshot) => {
      set({ activeNotification: snapshot.val() });
    });

    // Expenses Listener
    const expensesRef = ref(db, 'expenses');
    onValue(expensesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const expensesList = Object.values(data) as Expense[];
        expensesList.sort((a, b) => b.timestamp - a.timestamp);
        set({ expenses: expensesList });
      } else {
        set({ expenses: [] });
      }
    });
  },

  sendNotification: (notification) => {
    const notifRef = ref(db, 'state/activeNotification');
    firebaseSet(notifRef, {
      ...notification,
      timestamp: Date.now()
    });
  },

  clearNotification: () => {
    const notifRef = ref(db, 'state/activeNotification');
    remove(notifRef);
  },

  addExpense: (title, amount, payer) => {
    const expensesRef = ref(db, 'expenses');
    const newExpenseRef = push(expensesRef);
    firebaseSet(newExpenseRef, {
      id: newExpenseRef.key,
      title,
      amount,
      payer,
      timestamp: Date.now()
    });
  },

  removeExpense: (id) => {
    const expenseRef = ref(db, `expenses/${id}`);
    remove(expenseRef);
  },

  updateLocation: (lat, lng, speed) => {
    const state = get();
    const nextWP = state.nextWaypoint;
    const areaText = guessLocationName(lat, lng);

    let distText = state.nearestFacilityText;
    let newNextWP = nextWP;
    let etaText = "--:--";

    if (nextWP) {
      const dist = calculateDistance(lat, lng, nextWP.coords.lat, nextWP.coords.lng);
      distText = `目的地まで ${dist.toFixed(1)} km`;

      const hoursLeft = dist / 80; // 平均時速80km想定
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + hoursLeft * 60 * 60 * 1000);
      etaText = arrivalTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

      // 2km圏内に入ったら自動で次の目的地へ (デモ用ロジック)
      if (dist < 2.0) {
        const currentIndex = state.waypoints.findIndex(w => w.id === nextWP.id);
        if (currentIndex !== -1 && currentIndex < state.waypoints.length - 1) {
          newNextWP = state.waypoints[currentIndex + 1];
        }
      }
    }

    // 最終目的地までの距離
    let goalWP = state.waypoints[state.waypoints.length - 1];
    let goalText = "計算中...";
    if (goalWP) {
      const distToGoal = calculateDistance(lat, lng, goalWP.coords.lat, goalWP.coords.lng);
      goalText = `Goalまで残り ${Math.round(distToGoal)} km`;
    }

    const kmh = speed ? Math.round(speed * 3.6) : 0;

    set({
      currentLocation: { lat, lng },
      currentSpeed: kmh,
      currentAreaText: areaText,
      nearestFacilityText: distText,
      todaysGoalText: goalText,
      nextWaypointEta: etaText,
      nextWaypoint: newNextWP
    });
  }
}));