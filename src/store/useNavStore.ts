import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push } from 'firebase/database';
import type { NavState, Waypoint, Expense, AppNotification } from '../types';
import { initialGeoFences, type GeoFence } from '../data/geoFences'; // typeを追加

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
  
  // ★追加: ジオフェンスリセット用
  resetGeoFences: () => void;
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

const guessLocationName = (_lat: number, lng: number) => {
  if (lng < 131.0) return "福岡県 / 関門エリア";
  if (lng < 131.8) return "大分県内"; 
  if (lng < 132.5) return "山口県 / 岩国周辺";
  if (lng < 133.5) return "広島県内";
  if (lng < 134.5) return "岡山県内";
  if (lng < 135.5) return "兵庫県 / 大阪府";
  if (lng < 136.0) return "京都府 / 滋賀県";
  if (lng < 137.0) return "三重県 / 伊勢エリア";
  return "Highway Cruising";
};

// State拡張のためにインターフェース拡張
interface ExtendedNavState extends NavState {
  geoFences: GeoFence[];
}

export const useNavStore = create<ExtendedNavState & NavActions>((set, get) => ({
  // --- Initial State ---
  mode: 'driver',
  currentUser: null,
  currentLocation: { lat: 33.1916, lng: 131.7021 },
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
  geoFences: initialGeoFences, // ★初期データロード

  waypoints: [
    { id: 'start', name: 'Start: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'start' },
    { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' },
    { id: 'pick_taira', name: 'Pick: 平良 (萩原)', coords: { lat: 33.2436, lng: 131.6418 }, type: 'pickup' },
    { id: 'mekari', name: 'めかりPA (関門橋)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking' },
    { id: 'miyajima', name: '宮島SA (広島)', coords: { lat: 34.3315, lng: 132.2982 }, type: 'parking' },
    { id: 'miki', name: '三木SA (兵庫)', coords: { lat: 34.8174, lng: 134.9804 }, type: 'parking' },
    { id: 'tsuchiyama', name: '土山SA (新名神)', coords: { lat: 34.9158, lng: 136.2935 }, type: 'parking' },
    { id: 'suzuka', name: '鈴鹿サーキット', coords: { lat: 34.8487, lng: 136.5391 }, type: 'hotel' },
    { id: 'ise_jingu', name: '伊勢神宮 内宮', coords: { lat: 34.4560, lng: 136.7250 }, type: 'sightseeing' },
    { id: 'okage', name: 'おかげ横丁', coords: { lat: 34.4631, lng: 136.7228 }, type: 'sightseeing' },
    { id: 'mitou', name: '美東SA (山口)', coords: { lat: 34.1535, lng: 131.3373 }, type: 'parking' },
    { id: 'dannoura', name: '壇之浦PA (九州へ)', coords: { lat: 33.9665, lng: 130.9504 }, type: 'parking' },
    { id: 'goal', name: 'Goal: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'goal' },
  ],

  nextWaypoint: { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' } as Waypoint,

  // --- Actions ---
  setMode: (mode) => set({ mode }),
  setCurrentUser: (name) => set({ currentUser: name }),

  setNextWaypoint: (id) => {
    const state = get();
    const targetWP = state.waypoints.find(w => w.id === id);
    if (targetWP) {
      const wpRef = ref(db, 'state/nextWaypoint');
      firebaseSet(wpRef, targetWP);
      const notifRef = ref(db, 'state/activeNotification');
      firebaseSet(notifRef, {
        id: Date.now().toString(),
        type: 'info',
        message: `目的地を「${targetWP.name}」に変更しました`,
        sender: state.currentUser || 'Co-Pilot',
        timestamp: Date.now()
      });
    }
  },

  initializeSync: () => {
    const notifRef = ref(db, 'state/activeNotification');
    onValue(notifRef, (snapshot) => {
      set({ activeNotification: snapshot.val() });
    });
    const wpRef = ref(db, 'state/nextWaypoint');
    onValue(wpRef, (snapshot) => {
      const data = snapshot.val();
      if (data) set({ nextWaypoint: data });
    });
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
    firebaseSet(notifRef, { ...notification, timestamp: Date.now() });
  },

  clearNotification: () => {
    const notifRef = ref(db, 'state/activeNotification');
    remove(notifRef);
  },

  addExpense: (title, amount, payer) => {
    const expensesRef = ref(db, 'expenses');
    const newExpenseRef = push(expensesRef);
    firebaseSet(newExpenseRef, { id: newExpenseRef.key, title, amount, payer, timestamp: Date.now() });
  },

  removeExpense: (id) => {
    const expenseRef = ref(db, `expenses/${id}`);
    remove(expenseRef);
  },

  resetGeoFences: () => {
    set({ geoFences: initialGeoFences });
  },

  updateLocation: (lat, lng, speed) => {
    const state = get();
    const nextWP = state.nextWaypoint;
    const areaText = guessLocationName(lat, lng);
    let distText = state.nearestFacilityText;
    let etaText = "--:--";

    if (nextWP) {
      const dist = calculateDistance(lat, lng, nextWP.coords.lat, nextWP.coords.lng);
      distText = `目的地まで ${dist.toFixed(1)} km`;
      const hoursLeft = dist / 80; 
      const now = new Date();
      const arrivalTime = new Date(now.getTime() + hoursLeft * 60 * 60 * 1000);
      etaText = arrivalTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }

    let goalWP = state.waypoints[state.waypoints.length - 1];
    let goalText = "計算中...";
    if (goalWP) {
      const distToGoal = calculateDistance(lat, lng, goalWP.coords.lat, goalWP.coords.lng);
      goalText = `Goalまで残り ${Math.round(distToGoal)} km`;
    }
    const kmh = speed ? Math.round(speed * 3.6) : 0;

    // ★ジオフェンスチェックロジック
    // 未発火のフェンスのうち、半径内に入ったものを探す
    const hitFence = state.geoFences.find(fence => {
      if (fence.triggered) return false;
      const dist = calculateDistance(lat, lng, fence.lat, fence.lng);
      return dist <= fence.radius;
    });

    if (hitFence) {
      // ヒットしたら通知を送り、triggeredフラグを立てる
      console.log("GeoFence Hit:", hitFence.name);
      
      // 1. 全員に通知
      const notifRef = ref(db, 'state/activeNotification');
      firebaseSet(notifRef, {
        id: Date.now().toString(),
        type: 'info', // 自動ガイド
        message: `📍 ${hitFence.name} に到達しました`,
        sender: 'Serena AI',
        timestamp: Date.now(),
        // 読み上げ用のテキストをペイロードに含める
        payload: { tts: hitFence.message } 
      });

      // 2. State更新 (二度鳴らないように)
      set(prev => ({
        geoFences: prev.geoFences.map(f => f.id === hitFence.id ? { ...f, triggered: true } : f)
      }));
    }

    set({
      currentLocation: { lat, lng },
      currentSpeed: kmh,
      currentAreaText: areaText,
      nearestFacilityText: distText,
      todaysGoalText: goalText,
      nextWaypointEta: etaText,
    });
  }
}));