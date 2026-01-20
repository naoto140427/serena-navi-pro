import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ★NaotoさんのAPIキーをセットしました
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCk-_Ln_0V2GesYL7MCzwiwPR7FqO8VFuo";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS許可
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { message, context } = req.body;

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // AIへの指示書 (System Prompt)
    const prompt = `
      あなたは日産セレナ・ルキシオンに搭載された、高度なAIナビゲーションアシスタント「Serena」です。
      ドライバーのNaotoさんと、同乗者の平良さん、芳賀さんとの「大分から三重・鈴鹿サーキットへのグランドツアー」をサポートしています。

      [現在の状況]
      ・現在地: ${context.location}
      ・次の目的地: ${context.nextWaypoint}
      ・速度: ${context.speed} km/h

      [ルール]
      ・返答は、運転中のドライバーが聞き取りやすいよう、**80文字以内で、簡潔かつフレンドリー**に答えてください。
      ・「ナビゲーター」として振る舞い、観光案内や歴史の豆知識、ルート上の注意点などを教えてください。
      ・ドライバーを気遣う言葉（休憩提案など）も適宜入れてください。

      ユーザーの発言: "${message}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ reply: text });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'AI Connection Failed' });
  }
}