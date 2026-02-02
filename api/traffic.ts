import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import * as cheerio from 'cheerio';

// ターゲット: Yahoo!道路交通情報（中国地方・近畿地方）
// ※今回はメインとなる「山陽道・中国道」を含むエリアを狙います
const TARGET_URLS = [
  'https://roadway.yahoo.co.jp/traffic/area/6/highway', // 中国地方
  'https://roadway.yahoo.co.jp/traffic/area/7/highway'  // 近畿地方
];

export async function scrapeTrafficData(url: string): Promise<string[]> {
  const alerts: string[] = [];
  // Use a modern User-Agent to mimic a real browser
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  const { data } = await axios.get(url, {
    headers: { 'User-Agent': userAgent },
    timeout: 5000 // 5 seconds timeout
  });

  const $ = cheerio.load(data);

  // 1. Validate Page Title (Defense against redirects/blocks)
  const title = $('title').text();
  if (!title.includes('Yahoo!道路交通情報')) {
    // If title doesn't match, we might be blocked or on a wrong page.
    throw new Error(`Page title mismatch: ${title}`);
  }

  // 2. Primary Selector Strategy
  // Yahooのページ構造から「通行止」「渋滞」「事故」の文字を探す
  // '.trouble_list' クラスの中にある事故リストを探す
  const listContainer = $('.trouble_list');
  const troubleList = listContainer.find('li');

  if (troubleList.length > 0) {
    troubleList.each((_, element) => {
      const text = $(element).text().trim().replace(/\s+/g, ' ');
      // 「山陽道」「中国道」「新名神」「伊勢道」などの関連ルートだけ抜粋
      if (text.match(/(山陽道|中国道|新名神|伊勢道|東九州道|大分道)/)) {
         alerts.push(text);
      }
    });
  } else {
    // 3. Fallback / Validation Strategy
    // If list items are empty, it usually means "No Incidents" (Green).
    // However, if the container (.trouble_list) itself is MISSING, the structure might have changed.

    if (listContainer.length === 0) {
      // Container is missing. This is suspicious.
      // We scan the body for keywords to see if we missed something.
      const bodyText = $('body').text().replace(/\s+/g, ' ');
      const hasKeywords = bodyText.match(/(通行止|渋滞|事故)/);
      const hasTargetRoads = bodyText.match(/(山陽道|中国道|新名神|伊勢道|東九州道|大分道)/);

      if (hasKeywords && hasTargetRoads) {
         // Keywords present but container missing -> Likely structure change.
         console.warn(`Traffic structure mismatch on ${url}. Keywords found but .trouble_list missing.`);
         alerts.push('交通情報ページの構造が変化した可能性があります。公式サイトを確認してください。');
      }
    }
    // If container exists but is empty, we assume it's clean (Green).
  }

  return alerts;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const allAlerts: string[] = [];

    // 複数のエリアを順番に見に行く
    for (const url of TARGET_URLS) {
      try {
        const areaAlerts = await scrapeTrafficData(url);
        allAlerts.push(...areaAlerts);
      } catch (innerError) {
        console.error(`Failed to scrape ${url}:`, innerError);
        allAlerts.push('一部エリアの交通情報取得に失敗しました。');
      }
    }

    // 重複を削除
    const uniqueAlerts = [...new Set(allAlerts)];

    // Cache Control (Vercel Serverless)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');

    // 何もなければ「順調」と返す
    if (uniqueAlerts.length === 0) {
      return res.status(200).json({ 
        status: 'green', 
        messages: ['現在、主要ルート上の規制情報はありません。順調です。'] 
      });
    }

    // Check if we have warnings
    const hasWarning = uniqueAlerts.some(a => a.includes('構造が変化') || a.includes('取得に失敗'));

    // 規制情報があれば返す
    return res.status(200).json({ 
      status: hasWarning ? 'yellow' : 'red',
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
