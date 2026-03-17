export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        max_tokens: req.body.max_tokens || 16000,
        messages: req.body.messages
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      res.status(200).json({
        content: [{ type: 'text', text: data.choices[0].message.content }]
      });
    } else {
      res.status(response.status).json(data);
    }
  } catch(e)
