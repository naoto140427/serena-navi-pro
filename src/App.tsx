import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// ★復活: レイアウトと各ページコンポーネントを有効化
import { Layout } from './components/layout/Layout';
import { CockpitPage } from './pages/CockpitPage';
import { TimelinePage } from './pages/TimelinePage';
import { WalletPage } from './pages/WalletPage';
import { SettingsPage } from './pages/SettingsPage';
import { CoPilotPage } from './pages/CoPilotPage';

// ウィジェット類
import { GPSWatcher } from './components/widgets/GPSWatcher';
import { DynamicIsland } from './components/widgets/DynamicIsland';

// レイアウト・演出類
import { BootSequence } from './components/layout/BootSequence';
import { UserSelect } from './components/layout/UserSelect';
import { AnimatePresence } from 'framer-motion';
import { useNavStore } from './store/useNavStore';
import { useWakeLock } from './hooks/useWakeLock';

function App() {
  const [appState, setAppState] = useState<'booting' | 'selecting' | 'ready'>('booting');
  const { mode, initializeSync } = useNavStore();
  
  // スリープ防止
  useWakeLock();

  // Firebase接続を開始
  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden select-none font-sans">
      
      {/* 1. バックグラウンド機能 (GPS / Dynamic Island) */}
      <GPSWatcher />
      {/* 通知は Layout 内にも DynamicIsland がある場合がありますが、
          全画面（Co-Pilot含む）で出すためにここに置くか、Layoutに任せるか。
          Naotoさんの元のLayoutコードに <DynamicIsland /> が含まれていたので、
          重複を避けるためにここは一旦コメントアウトするか、Layout側を優先します。
          今回は「Layout外」のCo-Pilotでも通知を出したいので、ここに置くのが安全ですが、
          位置被りを防ぐため、Layout側と重複しないよう注意が必要です。
          ※元のLayoutコードを見るとDynamicIslandが含まれているので、ここではDriver時はLayoutに任せます。
      */}
      {/* <DynamicIsland /> */} 

      {/* 2. 起動シーケンス (Nissan Version) */}
      {appState === 'booting' && (
        <BootSequence onComplete={() => setAppState('selecting')} />
      )}

      {/* 3. ユーザー選択 (Original Design) */}
      <AnimatePresence mode='wait'>
        {appState === 'selecting' && (
          <UserSelect onSelect={() => setAppState('ready')} />
        )}
      </AnimatePresence>

      {/* 4. メインアプリケーション */}
      {appState === 'ready' && (
        <BrowserRouter>
          {mode === 'driver' ? (
            <Routes>
              {/* ★復活: Layoutコンポーネントでラップしてタブバーを表示 */}
              <Route path="/" element={<Layout />}>
                <Route index element={<CockpitPage />} />
                <Route path="timeline" element={<TimelinePage />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Routes>
          ) : (
            <Routes>
              {/* Co-Pilotモードは単独ページ */}
              <Route path="*" element={<CoPilotPage />} />
            </Routes>
          )}
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;