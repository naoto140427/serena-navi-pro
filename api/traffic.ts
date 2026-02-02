import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

// ターゲット: Yahoo!道路交通情報（中国地方・近畿地方）
// ※今回はメインとなる「山陽道・中国道」を含むエリアを狙います
const TARGET_URLS = [
  'https://roadway.yahoo.co.jp/traffic/area/6/highway', // 中国地方
  'https://roadway.yahoo.co.jp/traffic/area/7/highway'  // 近畿地方
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const alerts: string[] = [];

    // 複数のエリアを並列に見に行く
    const responses = await Promise.all(TARGET_URLS.map(url => axios.get(url)));

    for (const { data } of responses) {
      const $ = cheerio.load(data);

      // Yahooのページ構造から「通行止」「渋滞」「事故」の文字を探す
      // ※ページ構造が変わると動かなくなる可能性があります（スクレイピングの宿命）
      
      // '.section' クラスの中にある事故リストを探す
      $('.trouble_list li').each((_, element) => {
        const text = $(element).text().trim().replace(/\s+/g, ' ');
        // 「山陽道」「中国道」「新名神」「伊勢道」などの関連ルートだけ抜粋
        if (text.match(/(山陽道|中国道|新名神|伊勢道|東九州道|大分道)/)) {
           alerts.push(text);
        }
      });
    }

    // 重複を削除
    const uniqueAlerts = [...new Set(alerts)];

    // 何もなければ「順調」と返す
    if (uniqueAlerts.length === 0) {
      return res.status(200).json({ 
        status: 'green', 
        messages: ['現在、主要ルート上の規制情報はありません。順調です。'] 
      });
    }

    // 規制情報があれば返す
    return res.status(200).json({ 
      status: 'red', 
      messages: uniqueAlerts 
    });

  } catch (error) {
    console.error('Traffic Fetch Error:', error);
    // エラー時は安全のために「取得失敗」とは出さず、注意喚起だけ出す
    return res.status(200).json({ 
      status: 'yellow', 
      messages: ['交通情報の取得に遅延が発生しています。実際の標識に従ってください。'] 
    });
  }
}