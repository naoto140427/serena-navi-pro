import type { TripData } from '../types';

export const tripData: TripData = {
  title: "Oita - Mie - Yamaguchi Grand Tour",
  // ↓ ここを dates から date に変更しました
  date: "2026-01-26 to 2026-01-29",
  car: "Nissan Serena Luxion C28",
  waypoints: [
    {
      id: 'start',
      name: '自宅 (大分市)',
      time: '08:00',
      type: 'start',
      coords: { lat: 33.2382, lng: 131.6126 },
      address: '大分県大分市'
    },
    {
      id: 'wp1',
      name: '佐賀関港',
      time: '09:30',
      type: 'waypoint',
      coords: { lat: 33.2568, lng: 131.8617 },
      address: '国道九四フェリー'
    },
    {
      id: 'wp2',
      name: '三崎港',
      time: '10:40',
      type: 'waypoint',
      coords: { lat: 33.3956, lng: 132.1197 },
      address: '愛媛県伊方町'
    },
    {
      id: 'goal',
      name: '鈴鹿サーキット',
      time: '18:00',
      type: 'goal',
      coords: { lat: 34.8431, lng: 136.5408 },
      address: '三重県鈴鹿市'
    }
  ]
};