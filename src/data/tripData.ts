import type { TripData } from '../types';

export const tripData: TripData = {
  title: "Grand Tour 2026: Oita - Mie (All Land)",
  date: "2026.01.26 - 01.29",
  car: "Nissan Serena Luxion C28",
  waypoints: [
    {
      id: 'day1_start',
      name: 'Day 1: Departure',
      time: '08:00',
      type: 'start',
      coords: { lat: 33.1916, lng: 131.7021 },
      address: '大分市宮河内ハイランド'
    },
    {
      id: 'day1_kanmon',
      name: 'めかりPA (関門海峡)',
      time: '10:00',
      type: 'parking',
      coords: { lat: 33.9598, lng: 130.9616 },
      address: '九州最後の休憩'
    },
    {
      id: 'day1_miyajima',
      name: '宮島SA (Lunch)',
      time: '13:00',
      type: 'parking',
      coords: { lat: 34.3315, lng: 132.2982 },
      address: '広島県廿日市'
    },
    {
      id: 'day1_goal',
      name: '鈴鹿サーキット',
      time: '18:00',
      type: 'hotel',
      coords: { lat: 34.8487, lng: 136.5391 },
      address: '三重県鈴鹿市'
    },
    {
      id: 'day2_spot',
      name: '伊勢神宮 & おかげ横丁',
      time: 'Day 2',
      type: 'sightseeing',
      coords: { lat: 34.4560, lng: 136.7250 },
      address: 'パワースポット巡り'
    },
    {
      id: 'day3_return',
      name: 'Return Trip (Sanyo)',
      time: 'Day 3',
      type: 'waypoint',
      coords: { lat: 34.1535, lng: 131.3373 },
      address: '美東SA / 壇之浦PA'
    }
  ]
};