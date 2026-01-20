import React, { useEffect } from 'react';
import { useNavStore } from '../../store/useNavStore';

export const GPSWatcher: React.FC = () => {
  const { updateLocation } = useNavStore();

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        // speedは m/s 単位で返ってくる（止まっているとnullになることがある）
        updateLocation(latitude, longitude, speed);
      },
      (error) => {
        console.warn("GPS Error:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [updateLocation]);

  return null;
};