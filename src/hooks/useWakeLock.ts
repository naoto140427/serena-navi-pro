import { useEffect, useCallback } from 'react';

export const useWakeLock = () => {
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        // @ts-expect-error Wake Lock API
        await navigator.wakeLock.request('screen');
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);

  useEffect(() => {
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [requestWakeLock]);

  return { requestWakeLock };
};