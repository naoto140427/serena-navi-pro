import { create } from 'zustand';
import { db } from '../lib/firebase';
import { ref, onValue, set as firebaseSet, remove, push } from 'firebase/database';
import type { NavState, Waypoint, Expense, AppNotification } from '../types';
import { initialGeoFences, type GeoFence } from '../data/geoFences';

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

// エリア名推定
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

// State拡張
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
  geoFences: initialGeoFences,

  // ★Grand Tour 2026 Itinerary with Rich Data
  waypoints: [
    // Day 0: 出発 (1/26)
    { 
      id: 'start', name: 'Start: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'start',
      description: '旅の始まり。忘れ物はない？戸締まりヨシ！男3人のグランドツアーがいよいよ開幕。',
      image: 'https://images.unsplash.com/photo-1542332213-31f87348057f?q=80&w=800&auto=format&fit=crop'
    },
    { id: 'pick_haga', name: 'Pick: 芳賀 (丹川)', coords: { lat: 33.2050, lng: 131.7050 }, type: 'pickup' },
    { id: 'pick_taira', name: 'Pick: 平良 (萩原)', coords: { lat: 33.2436, lng: 131.6418 }, type: 'pickup' },
    
    // Day 0 Night: 深夜の爆走
    { 
      id: 'kanmon', name: '関門橋 (本州へ)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking',
      description: '九州と本州を結ぶ架け橋。ここを越えれば旅の本番。深夜の関門海峡の夜景は必見。',
      image: 'https://images.unsplash.com/photo-1571661601662-72049e25d028?q=80&w=800&auto=format&fit=crop'
    },
    { id: 'miyajima_sa', name: '宮島SA (深夜休憩)', coords: { lat: 34.3315, lng: 132.2982 }, type: 'parking' },
    
    // Day 1: 伊勢・絶景・肉 (1/27)
    { 
      id: 'ise_jingu', name: '伊勢神宮 内宮 (参拝)', coords: { lat: 34.4560, lng: 136.7250 }, type: 'sightseeing',
      description: '日本人の心のふるさと。2000年の歴史を持つ聖地。五十鈴川で身を清めてから正宮へ。',
      image: 'https://images.unsplash.com/photo-1572935260193-27150098df24?q=80&w=800&auto=format&fit=crop' 
    },
    { 
      id: 'okage', name: 'おかげ横丁 (食べ歩き)', coords: { lat: 34.4631, lng: 136.7228 }, type: 'sightseeing',
      description: '江戸時代の町並みを再現した通り。赤福本店、松阪牛串、伊勢うどん…食べ歩き天国。',
      image: 'https://images.unsplash.com/photo-1624867490072-5264b360f772?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'yokoyama', name: '横山展望台 (絶景カフェ)', coords: { lat: 34.3015, lng: 136.7820 }, type: 'sightseeing',
      description: '英虞湾（あごわん）を一望できる絶景テラス。サミット会場にもなった場所。夕焼け時のマジックアワーが狙い目。',
      image: 'https://images.unsplash.com/photo-1605623068996-52ce6497f537?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'vison_onsen', name: '♨️ VISON 本草湯 (薬草湯)', coords: { lat: 34.4667, lng: 136.5222 }, type: 'parking',
      description: '三重大学とロート製薬が開発した「薬草湯」。天井が高く開放的な空間で、旅の疲れを整える。',
      image: 'https://images.unsplash.com/photo-1560965034-7a91173872fb?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'matsusaka_beef', name: '🥩 一升びん本店 (松阪牛)', coords: { lat: 34.5684, lng: 136.5401 }, type: 'sightseeing',
      description: '松阪牛の名店。回転焼肉ではなく本店でガッツリと。味噌ダレホルモンとA5カルビで優勝確定。',
      image: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'dormy_tsu', name: '🏨 ドーミーイン津 (宿泊)', coords: { lat: 34.7186, lng: 136.5113 }, type: 'hotel',
      description: 'サウナーの聖地ドーミーイン。21:30からの夜鳴きそばは必須。シングル3部屋で爆睡してHP全回復。',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop'
    },

    // Day 2: 奈良・金泉・神戸 (1/28)
    { 
      id: 'nara_park', name: '奈良公園 (鹿・大仏)', coords: { lat: 34.6850, lng: 135.8430 }, type: 'sightseeing',
      description: '1300年の古都。東大寺の大仏と、1200頭の野生の鹿。鹿せんべいはすぐ食べられるので注意。',
      image: 'https://images.unsplash.com/photo-1579405625345-d86b97666272?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'arima_onsen', name: '♨️ 有馬温泉 金の湯', coords: { lat: 34.7968, lng: 135.2478 }, type: 'parking',
      description: '日本三古湯の一つ。赤茶色の「金泉」は塩分と鉄分が濃厚。湯上がりサイダーを忘れずに。',
      image: 'https://images.unsplash.com/photo-1629858547492-b05421c60d9d?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'kobe_hotel', name: '🏨 カンデオホテルズ神戸 (宿泊)', coords: { lat: 34.6908, lng: 135.1914 }, type: 'hotel',
      description: 'スタイリッシュなスカイスパ完備。神戸の夜景を見下ろしながら入浴できる。立地最高。',
      image: 'https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?q=80&w=800&auto=format&fit=crop'
    },

    // Day 3: 陸路完全走破 (1/29)
    { 
      id: 'himeji', name: '姫路城 (通過/チラ見)', coords: { lat: 34.8394, lng: 134.6939 }, type: 'sightseeing',
      description: '別名「白鷺城」。世界遺産。高速からもその白く輝く姿が見えるかも。',
      image: 'https://images.unsplash.com/photo-1598424976729-197e44927f1c?q=80&w=800&auto=format&fit=crop'
    },
    { 
      id: 'hiroshima_okonomi', name: '🍴 広島お好み村 (ランチ)', coords: { lat: 34.3915, lng: 132.4630 }, type: 'sightseeing',
      description: '広島のソウルフード。麺入りの重ね焼き。ヘラを使って鉄板から直で食べるのが流儀。',
      image: 'https://images.unsplash.com/photo-1582236592263-471239845942?q=80&w=800&auto=format&fit=crop'
    },
    { id: 'miyajima_sa_day', name: '⛩️ 宮島SA (スタバ休憩)', coords: { lat: 34.3315, lng: 132.2982 }, type: 'parking' },
    { id: 'mitou_sa', name: '美東SA (山口/ラスト休憩)', coords: { lat: 34.1535, lng: 131.3373 }, type: 'parking' },
    { id: 'kanmon_return', name: '関門橋 (九州帰還)', coords: { lat: 33.9598, lng: 130.9616 }, type: 'parking' },
    { id: 'goal', name: 'Goal: 自宅 (宮河内)', coords: { lat: 33.1916, lng: 131.7021 }, type: 'goal' },
  ],

  // 最初の目的地をセット
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

    // ジオフェンスチェック
    const hitFence = state.geoFences.find(fence => {
      if (fence.triggered) return false;
      const dist = calculateDistance(lat, lng, fence.lat, fence.lng);
      return dist <= fence.radius;
    });

    if (hitFence) {
      console.log("GeoFence Hit:", hitFence.name);
      
      const notifRef = ref(db, 'state/activeNotification');
      firebaseSet(notifRef, {
        id: Date.now().toString(),
        type: 'info',
        message: `📍 ${hitFence.name} に到達しました`,
        sender: 'Serena AI',
        timestamp: Date.now(),
        payload: { tts: hitFence.message } 
      });

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