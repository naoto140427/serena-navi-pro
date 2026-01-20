import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { CockpitPage } from './pages/CockpitPage';
import { CoPilotPage } from './pages/CoPilotPage';
import { useNavStore } from './store/useNavStore';
import { useWakeLock } from './hooks/useWakeLock';

function App() {
  const { initializeSync } = useNavStore();
  
  // スリープ防止
  useWakeLock();

  // アプリ起動時にFirebase同期を開始
  useEffect(() => {
    initializeSync();
  }, [initializeSync]);

  return (
    <Router>
      <div className="w-full h-screen bg-black overflow-hidden">
        {/* ナビゲーション (開発用: 画面上部に隠しリンクなどを置く想定だが、今はシンプルに) */}
        
        <Routes>
          <Route path="/" element={<CockpitPage />} />
          <Route path="/copilot" element={<CoPilotPage />} />
          
          {/* 他のページも必要に応じてここに追加 */}
          {/* <Route path="/wallet" element={<WalletPage />} /> */}
          {/* <Route path="/timeline" element={<TimelinePage />} /> */}
        </Routes>

        {/* 開発用デバッグメニュー (画面下部固定) */}
        <div className="fixed bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm flex justify-center gap-4 z-50 pointer-events-auto opacity-0 hover:opacity-100 transition-opacity">
          <Link to="/" className="text-xs text-zinc-400 hover:text-white">Cockpit</Link>
          <Link to="/copilot" className="text-xs text-zinc-400 hover:text-white">Co-Pilot</Link>
        </div>
      </div>
    </Router>
  );
}

export default App;