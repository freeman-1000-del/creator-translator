export const config = {
  maxDuration: 60
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 9초 타임아웃 (Vercel 10초 제한보다 1초 앞서 처리)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 9000);

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
        max_tokens: req.body.max_tokens || 4000,
        messages: req.body.messages
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'anthropic_error',
        status: response.status,
        detail: errData
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (e) {
    clearTimeout(timeoutId);

    if (e.name === 'AbortError') {
      // 타임아웃 → 클라이언트가 배치를 줄여서 재시도
      return res.status(408).json({
        error: 'timeout',
        message: '요청이 9초를 초과했습니다. 배치 크기를 줄여서 재시도하세요.',
        retryable: true
      });
    }

    return res.status(500).json({
      error: 'server_error',
      message: e.message,
      retryable: false
    });
  }
}
