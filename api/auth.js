import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const JWT_SECRET = process.env.JWT_SECRET || 'creator-translator-secret-2024';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password + JWT_SECRET).digest('hex');
}

function createToken(userId, email) {
  const payload = { userId, email, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64');
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(encoded).digest('hex');
  return `${encoded}.${sig}`;
}

async function supabase(method, path, body) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : ''
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return r.json();
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { action, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: '올바른 이메일 형식이 아닙니다.' });
  }

  const passwordHash = hashPassword(password);

  try {
    if (action === 'signup') {
      // 이미 가입된 이메일 확인
      const existing = await supabase('GET', `/users?email=eq.${encodeURIComponent(email)}&select=id`);
      if (existing && existing.length > 0) {
        return res.status(400).json({ error: '이미 가입된 이메일입니다.' });
      }

      // 회원가입
      const users = await supabase('POST', '/users', {
        email,
        password_hash: passwordHash,
        plan: 'free',
        usage_count: 0
      });

      if (!users || users.length === 0) {
        return res.status(500).json({ error: '회원가입에 실패했습니다.' });
      }

      const user = users[0];
      const token = createToken(user.id, user.email);
      return res.status(200).json({ success: true, token, email: user.email, plan: user.plan });

    } else if (action === 'login') {
      // 로그인
      const users = await supabase('GET', `/users?email=eq.${encodeURIComponent(email)}&password_hash=eq.${passwordHash}&select=id,email,plan,usage_count`);

      if (!users || users.length === 0) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 틀렸습니다.' });
      }

      const user = users[0];
      const token = createToken(user.id, user.email);
      return res.status(200).json({ success: true, token, email: user.email, plan: user.plan, usageCount: user.usage_count });

    } else {
      return res.status(400).json({ error: '잘못된 요청입니다.' });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
