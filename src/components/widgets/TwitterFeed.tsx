import React, { useEffect, useRef, useState } from 'react';
// ★ AlertTriangle を削除しました
import { Loader2, ExternalLink } from 'lucide-react';

interface TwitterFeedProps {
  id: string;
  height?: number;
}

// Twitterの型定義
declare global {
  interface Window {
    twttr: any;
  }
}

export const TwitterFeed: React.FC<TwitterFeedProps> = ({ id, height = 600 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    setStatus('loading');

    // 1. コンテナをクリア
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // 2. Twitterウィジェットスクリプトのロード関数
    const loadTwitterScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.twttr) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true;
        script.charset = 'utf-8';
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    // 3. タイムライン作成実行
    const createTimeline = async () => {
      try {
        await loadTwitterScript();

        if (!window.twttr || !containerRef.current) return;

        // APIを直接叩いて生成
        await window.twttr.widgets.createTimeline(
          {
            sourceType: 'profile',
            screenName: id
          },
          containerRef.current,
          {
            height: height,
            theme: 'dark',
            chrome: 'noheader,nofooter,noborders,transparent',
            lang: 'ja'
          }
        );
        setStatus('loaded');
      } catch (e) {
        console.error('Twitter Embed Error:', e);
        setStatus('error');
      }
    };

    createTimeline();

  }, [id, height]);

  return (
    <div className="relative w-full bg-black/40 rounded-xl overflow-hidden min-h-[400px] border border-zinc-800">
      
      {/* 読み込み中 */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/80 z-20 backdrop-blur-sm">
          <Loader2 className="animate-spin text-blue-500 mb-2" size={32} />
          <span className="text-xs font-bold text-blue-400 animate-pulse tracking-widest">
            CONNECTING TO SATELLITE...
          </span>
        </div>
      )}

      {/* タイムライン表示エリア */}
      <div ref={containerRef} className="w-full min-h-[400px]" />

      {/* フォールバックボタン */}
      {status !== 'loading' && (
        <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none flex justify-center pb-6">
           <a 
             href={`https://twitter.com/${id}`}
             target="_blank" 
             rel="noopener noreferrer"
             className="pointer-events-auto bg-zinc-800/80 backdrop-blur-md border border-zinc-600 px-4 py-2 rounded-full text-xs font-bold text-white flex items-center gap-2 hover:bg-zinc-700 transition-all opacity-50 hover:opacity-100"
           >
             <ExternalLink size={14} /> もし表示されない場合はこちら
           </a>
        </div>
      )}
    </div>
  );
};