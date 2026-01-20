import React from 'react';
import { Settings, Shield, Smartphone, RefreshCw, LogOut } from 'lucide-react'; // 未使用アイコンを削除
import { useNavStore } from '../store/useNavStore';
import { APP_VERSION, BUILD_DATE, RELEASE_NOTES } from '../config/version';

export const SettingsPage: React.FC = () => {
  const { sendNotification } = useNavStore();

  // 未使用の handleTestNotification を削除

  const handleSystemCheck = () => {
    sendNotification({
      id: Date.now().toString(),
      type: 'warning',
      message: 'All Systems Green. Ready.',
      sender: 'System'
    });
  };

  return (
    <div className="h-full p-6 pb-24 overflow-y-auto">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="text-zinc-400" size={24} />
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
      </div>

      <div className="space-y-6">
        
        {/* System Info */}
        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">System Information</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <Shield className="text-green-500 mb-2" size={24} />
              <div className="text-xs text-zinc-500">Current Version</div>
              <div className="font-bold text-white">v{APP_VERSION}</div>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl">
              <Smartphone className="text-blue-500 mb-2" size={24} />
              <div className="text-xs text-zinc-500">Build Date</div>
              <div className="font-bold text-white">{BUILD_DATE}</div>
            </div>
          </div>
        </section>

        {/* Release Notes */}
        <section>
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Release Notes</h2>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden p-4 space-y-6">
            {RELEASE_NOTES.map((note, index) => (
              <div key={index} className="relative pl-4 border-l-2 border-zinc-800">
                <div className={`absolute -left-[5px] top-1 w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500' : 'bg-zinc-700'}`}></div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-bold ${index === 0 ? 'text-white' : 'text-zinc-400'}`}>v{note.version}</span>
                  <span className="text-xs text-zinc-600">{note.date}</span>
                  {note.type === 'minor' && <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] rounded border border-blue-500/20">UPDATE</span>}
                  {note.type === 'patch' && <span className="px-1.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded border border-green-500/20">FIX</span>}
                </div>
                <ul className="space-y-1">
                  {note.changes.map((change, i) => (
                    <li key={i} className="text-xs md:text-sm text-zinc-400 flex items-start gap-2">
                      <span className="text-zinc-600 mt-1">-</span>
                      {change}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* System Actions */}
        <section className="pt-4">
           <button 
             onClick={handleSystemCheck}
             className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 rounded-xl mb-3 flex items-center justify-center gap-2 transition-colors"
           >
             <RefreshCw size={18} />
             Run System Diagnostics
           </button>
           <button 
             onClick={() => window.location.reload()}
             className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-red-500/20"
           >
             <LogOut size={18} />
             Reboot System
           </button>
        </section>
      </div>
    </div>
  );
};