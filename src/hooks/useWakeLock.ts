import { useEffect, useCallback } from 'react';

// Extend the native WakeLockSentinel if available, or define a compatible one
interface WakeLockSentinel extends EventTarget {
  release: () => Promise<void>;
  released: boolean;
  type: 'screen';
  onrelease: ((this: WakeLockSentinel, ev: Event) => void) | null;
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
        // Use type assertion carefully to match the expected interface
        await (navigator as unknown as NavigatorWithWakeLock).wakeLock.request('screen');
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
