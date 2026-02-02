import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!API_KEY) {
    console.error("GEMINI_API_KEY is not defined");
    return res.status(500).json({ error: "Server Configuration Error" });
  }

  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { image } = req.body; // Base64 image string

  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // 画像認識に特化した高速モデル
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 画像データの準備 (Base64ヘッダー除去)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    
    const prompt = `
      この画像を分析し、レシートであれば「合計金額」と「店名/品目概要」を抽出してください。
      以下のJSONフォーマットのみを返してください。マークダウン記法は不要です。
      {
        "title": "店名または主な品目 (例: セブンイレブン, ガソリンスタンド)",
        "amount": 数値 (通貨記号なし)
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // JSON文字列をパースして返す
    // AIがたまに ```json ... ``` で囲むので除去処理
    let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // 念のため、最初に見つかった { から 最後に見つかった } までを抽出する
    const firstOpen = jsonString.indexOf('{');
    const lastClose = jsonString.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      jsonString = jsonString.substring(firstOpen, lastClose + 1);
    }

    let data;
    try {
      data = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw AI Text:", text);
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Gemini Vision Error:', error);
    return res.status(500).json({ error: 'Scan Failed' });
  }
}