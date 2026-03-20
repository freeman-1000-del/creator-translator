export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    const { title, description, keywords, languages, openai_key } = req.body;
console.log('받은 데이터:', JSON.stringify({ title, languagesCount: languages?.length }));

   // openai_key는 향후 사용 예정
    
    if (!title || !languages || !languages.length) {
      return res.status(400).json({ error: 'title과 languages는 필수입니다.' });
    }

    const translateOne = async (lang) => {
      const prompt = `Translate the following YouTube content into ${lang.name} (${lang.code}).
RULES:
1. Output MUST be entirely in ${lang.name}. No Korean characters.
2. Return ONLY valid JSON: {"title":"...","description":"...","keywords":"..."}
3. Keep # before keywords.
4. No markdown, no code blocks.

Title: ${title}
Description: ${description || ''}
Keywords: ${keywords || ''}`;

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-haiku-4-5-20251001',
              max_tokens: 500,const text = data.content?.[0]?.text || '';
if (/[\uAC00-\uD7AF]/.test(text)) continue;
              messages: [{ role: 'user', content: prompt }]
            })
          });
          const text = data.content?.[0]?.text || '';
console.log('Claude 응답:', text.substring(0, 100));
          const text = data.content?.[0]?.text || '';
          if (/[\uAC00-\uD7AF]/.test(text)) continue;
          const clean = text.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(clean);
          if (parsed.title) return { lang, result: parsed };
        } catch(e) {
          if (attempt === 0) await new Promise(r => setTimeout(r, 500));
        }
      }
      return { lang, result: null };
    };

    const results = {};
    const failed = [];
    const BATCH = 15;

    for (let i = 0; i < languages.length; i += BATCH) {
      const batch = languages.slice(i, i + BATCH);
      const responses = await Promise.all(batch.map(lang => translateOne(lang)));
      responses.forEach(({ lang, result }) => {
        if (result) results[lang.code] = result;
        else failed.push({ code: lang.code, name: lang.name });
      });
    }

    res.status(200).json({
      translations: results,
      failed,
      summary: { total: languages.length, success: Object.keys(results).length, failed: failed.length }
    });

  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
