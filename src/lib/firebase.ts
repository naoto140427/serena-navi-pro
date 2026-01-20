import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// 渡邊さんから頂いた設定情報
const firebaseConfig = {
  apiKey: "AIzaSyDy0alBTZ2hQjyO8J0wQzSKH4HpSBRCmmE",
  authDomain: "serena-navi-pro.firebaseapp.com",
  databaseURL: "https://serena-navi-pro-default-rtdb.firebaseio.com",
  projectId: "serena-navi-pro",
  storageBucket: "serena-navi-pro.firebasestorage.app",
  messagingSenderId: "433309705128",
  appId: "1:433309705128:web:af7df0c88e384b8657739d",
  measurementId: "G-2G1GJS2E6Z"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// データベース機能（Realtime Database）を使えるようにしてエクスポート
export const db = getDatabase(app);