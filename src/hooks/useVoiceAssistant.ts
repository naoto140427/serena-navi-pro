import { useState, useCallback, useRef } from 'react';
import { useNavStore } from '../store/useNavStore';
import { soundManager } from '../utils/SoundManager';

interface IWindow extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webkitSpeechRecognition: any;
}

// システム音声 (Move outside as it is stateless regarding component)
const speak = (text: string) => {
  window.speechSynthesis.cancel(); // 前の音声をキャンセル
  const uttr = new SpeechSynthesisUtterance(text);
  uttr.lang = "ja-JP";
  uttr.rate = 1.2;
  window.speechSynthesis.speak(uttr);
};

export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 連打防止用のフラグ
  const isCommandExecuted = useRef(false);

  // Note: Removed useNavStore subscription here to avoid re-renders on state changes.
  // Access state directly via useNavStore.getState() in callbacks.

  // Gemini API呼び出し
  const askGemini = useCallback(async (text: string) => {
    setIsProcessing(true);
    // 考えていることを伝える
    speak("確認します、少々お待ちください。");

    // Get latest state
    const { currentLocation, nextWaypoint, currentSpeed } = useNavStore.getState();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            location: `${currentLocation.lat}, ${currentLocation.lng}`,
            nextWaypoint: nextWaypoint?.name || '不明',
            speed: currentSpeed
          }
        })
      });
      
      const data = await res.json();
      if (data.reply) {
        speak(data.reply);
      } else {
        speak("すみません、うまく応答できませんでした。");
      }
    } catch (e) {
      console.error(e);
      speak("通信エラーが発生しました。");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const processCommand = useCallback((text: string) => {
    // すでに実行済みなら何もしない（連打防止）
    if (isCommandExecuted.current) return;
    isCommandExecuted.current = true;

    console.log("Voice Command Executed:", text);
    const cleanText = text.replace(/\s+/g, '');

    // Get latest state/actions
    const { addExpense, waypoints, setNextWaypoint, currentUser } = useNavStore.getState();

    // --- 1. 定型コマンド (割り勘) ---
    if (cleanText.includes('割り勘') || (cleanText.includes('円') && cleanText.match(/\d/))) {
      const normalized = cleanText.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
      const match = normalized.match(/(\d+)/);
      if (match) {
        const amount = parseInt(match[0]);
        let title = "経費";
        if (normalized.includes("ガソリン")) title = "ガソリン代";
        else if (normalized.includes("飯") || normalized.includes("ご飯")) title = "食事代";
        else if (normalized.includes("高速")) title = "高速代";
        else if (normalized.includes("コンビニ")) title = "コンビニ";
        
        addExpense(title, amount, currentUser || 'Naoto');
        speak(`${amount}円、${title}を登録しました。`);
        return;
      }
    }

    // --- 2. 定型コマンド (目的地) ---
    if (cleanText.includes('目的地') || cleanText.includes('次へ')) {
      const target = waypoints.find(w => cleanText.includes(w.name.split(':')[0]));
      if (target) {
        setNextWaypoint(target.id);
        speak(`目的地を、${target.name}、にセットします。`);
        return;
      }
    }

    // --- 3. AI処理 (Geminiへ委譲) ---
    // 「お腹すいた」「疲れた」などはここに来ます
    askGemini(text);

  }, [askGemini]);

  const startListening = useCallback(() => {
    const { webkitSpeechRecognition } = window as unknown as IWindow;
    if (!webkitSpeechRecognition) {
      alert("Chromeブラウザを使用してください");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.continuous = false; // 一言喋ったら終わり
    recognition.interimResults = false; // 途中経過は無視

    // リセット
    isCommandExecuted.current = false;

    recognition.onstart = () => {
      setIsListening(true);
      soundManager.playClick();
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      // 確度が高い結果だけを処理
      const results = event.results;
      const lastResult = results[results.length - 1];
      
      if (lastResult.isFinal) {
        const resultText = lastResult[0].transcript;
        setTranscript(resultText);
        processCommand(resultText);
        recognition.stop(); // 認識を強制終了
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [processCommand]);

  return { isListening, transcript, startListening, isProcessing };
};
