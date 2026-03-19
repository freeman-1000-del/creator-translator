export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { title, description, languages } = req.body;

    const results = {};
    const failed = [];

    const translateOne = async (lang) => {
      const prompt = `Translate the following YouTube video title and description into ${lang.name} (language code: ${lang.code}).

CRITICAL RULES:
1. Output MUST be entirely in ${lang.name}. Do NOT include any Korean characters whatsoever.
2. Return ONLY valid JSON in this exact format: {"title": "...", "description": "..."}
3. No markdown, no code blocks, no explanation.

Title: ${title}
Description: ${description}`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '';

      // 한글 잔존 검증
      const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
      if (hasKorean) return null;

      try {
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (p
