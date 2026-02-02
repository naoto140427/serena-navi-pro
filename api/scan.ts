import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.GEMINI_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Credentials', "true");
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (!API_KEY) {
    console.error('Gemini API Key is missing');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const { image } = req.body; // Base64 image string

  if (!image) {
    return res.status(400).json({ error: 'No image provided' });
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    // High-speed model specialized for image recognition
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Prepare image data (remove Base64 header)
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
    
    // Parse and return JSON string
    // Remove markdown code blocks if the AI wraps the JSON in them
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    return res.status(200).json(data);

  } catch (error) {
    console.error('Gemini Vision Error:', error);
    return res.status(500).json({ error: 'Scan Failed' });
  }
}
