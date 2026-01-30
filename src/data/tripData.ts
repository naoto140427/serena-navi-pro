import type { TripData } from '../types';

export const tripData: TripData = {
  waypoints: [
    {
      id: 'start',
      name: 'Start: 宝塚IC',
      coords: { lat: 34.805, lng: 135.350 },
      type: 'start',
      scheduledTime: '14:45'
    },
    // ... 他のデータはFirebaseやStoreで管理するため、
    // ここは型定義の整合性を保つための初期データのみでOKです
  ]
};