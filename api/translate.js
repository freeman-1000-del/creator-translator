export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { title, description, keywords, languages } = req.body;

    const callAPI = async (lang) => {
      const prompt = `Translate the following YouTube video title, description, and keywords into ${lang.name} (language code: ${lang.code}).

CRITICAL RULES:
1. Output MUST be entirely in ${lang.name}. Do NOT include any Korean characters whatsoever.
2. Return ONLY valid JSON: {"title": "...", "description": "...", "keywords": "..."}
3. Keep # symbol before each keyword.
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
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const hasKorean = /[\uAC00-\uD7AF]/.test(text);
      if (hasKorean) return null;
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      if (parsed.title && parsed.description) return parsed;
      return null;
    };

    const translateOne = async (lang) => {
      try {
        const result = await callAPI(lang);
        return { lang, result };
      } catch(e) {
        return { lang, result: null };
      }
    };

    // Worker 1: 앞 절반
    // Worker 2: 뒷 절반
    const half = Math.ceil(languages.length / 2);
    const group1 = languages.slice(0, half);
    const group2 = languages.slice(half);

    const [results1, results2] = await Promise.all([
      Promise.all(group1.map(lang => translateOne(lang))),
      Promise.all(group2.map(lang => translateOne(lang)))
    ]);

    const allResponses = [...results1, ...results2];
    const results = {};
    const toRetry = [];

    allResponses.forEach(({ lang, result }) => {
      if (result) results[lang.code] = result;
      else toRetry.push(lang);
    });

    // Worker 3: 실패한 것만 재시도
    if (toRetry.length > 0) {
      await new Promise(r => setTimeout(r, 1000));
      const retryResults = await Promise.all(toRetry.map(lang => translateOne(lang)));
      retryResults.forEach(({ lang, result }) => {
        if (result) results[lang.code] = result;
      });
    }

    const failed = languages.filter(lang => !results[lang.code])
      .map(lang => ({ code: lang.code, name: lang.name }));

    res.status(200).json({
      translations: results,
      failed,
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
```

**구조:**
```
Worker1 (35개) ──┐
                  ├→ 동시 실행 → 실패 수집
Worker2 (35개) ──┘
                  ↓
Worker3 (실패만) → 재시도
