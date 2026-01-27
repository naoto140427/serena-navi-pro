import { useState, useEffect } from 'react';
import { useNavStore } from './store/useNavStore';
// Layoutはもう使わず、直接ページを呼び出します
import { UserSelect } from './components/layout/UserSelect';
import { BootSequence } from './components/layout/BootSequence';
import { CockpitPage } from './pages/CockpitPage';
import { CoPilotPage } from './pages/CoPilotPage';
import { useWakeLock } from './hooks/useWakeLock';

export const App = () => {
  const [appState, setAppState] = useState<'boot' | 'select' | 'ready'>('boot');
  // modeを取得して、ドライバーか同乗者かを判定します
  const { initializeSync, mode } = useNavStore();
  const { requestWakeLock } = useWakeLock();

  useEffect(() => {
    initializeSync();
    
    const timer = setTimeout(() => {
      setAppState('select');
    }, 2500);

    const handleInteraction = () => {
      requestWakeLock();
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initializeSync, requestWakeLock]);

  if (appState === 'boot') {
    return <BootSequence onComplete={() => setAppState('select')} />;
  }

  if (appState === 'select') {
    return <UserSelect onSelect={() => setAppState('ready')} />;
  }

  // ★ここを変更: Layoutを使わず、モードに応じて新しい画面を表示
  return mode === 'driver' ? <CockpitPage /> : <CoPilotPage />;
};