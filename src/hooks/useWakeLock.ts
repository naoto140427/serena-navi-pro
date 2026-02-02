import { useEffect, useCallback } from 'react';

interface WakeLockSentinel extends EventTarget {
  release: () => Promise<void>;
  released: boolean;
  type: 'screen';
}

interface NavigatorWithWakeLock extends Navigator {
  wakeLock: {
    request: (type: 'screen') => Promise<WakeLockSentinel>;
  };
}

export const useWakeLock = () => {
  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        await (navigator as NavigatorWithWakeLock).wakeLock.request('screen');
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
