export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { title, description, keywords, languages } = req.body;

    const results = {};
    const failed = [];

    const translateOne = async (lang) => {
      const prompt = `Translate the following YouTube video title, description, and keywords into ${lang.name} (language code: ${lang.code}).

CRITICAL RULES:
1. Output MUST be entirely in ${lang.name}. Do NOT include any Korean characters whatsoever.
2. Return ONLY valid JSON in this exact format: {"title": "...", "description": "...", "keywords": "..."}
3. For keywords, keep the # symbol before each keyword.
4. No markdown, no code blocks, no explanation.

Title: ${title}
Description: ${description}
Keywords: ${keywords || ''}`;

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

      const hasKorean = /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text);
      if (hasKorean) return null;

      try {
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean);
        if (parsed.title && parsed.description) return parsed;
        return null;
      } catch(e) {
        return null;
      }
    };

    for (const lang of languages) {
      let result = await translateOne(lang);
      if (!result) result = await translateOne(lang);

      if (result) {
        results[lang.code] = result;
      } else {
        failed.push({ code: lang.code, name: lang.name });
      }
    }

    res.status(200).json({
      translations: results,
      failed: failed,
      summary: {
        total: languages.length,
        success: Object.keys(results).length,
        failed: failed.length
      }
    });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
