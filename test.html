<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>HumaLation 번역 테스트</title>
<style>
body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;padding:20px;background:#f5f5f5;}
h1{color:#333;text-align:center;}
label{font-weight:bold;color:#444;display:block;margin-top:12px;}
input,textarea{width:100%;padding:10px;margin:4px 0;border:1px solid #ddd;border-radius:4px;font-size:14px;box-sizing:border-box;}
button{background:#C9A84C;color:white;padding:14px;border:none;border-radius:4px;font-size:16px;cursor:pointer;width:100%;margin-top:16px;}
button:hover{background:#a88a3d;}
button:disabled{background:#ccc;cursor:not-allowed;}
#progress-box{background:white;border:1px solid #ddd;border-radius:4px;padding:15px;margin:12px 0;display:none;}
#progress-bar-wrap{background:#eee;border-radius:10px;height:20px;margin:8px 0;}
#progress-bar{background:#4CAF50;height:20px;border-radius:10px;width:0%;transition:width 0.3s;}
#progress-text{text-align:center;font-size:14px;color:#666;font-weight:bold;}
#summary{background:#e8f5e9;border:1px solid #4CAF50;border-radius:4px;padding:15px;margin:10px 0;display:none;font-size:14px;}
.result{background:white;border:1px solid #ddd;border-radius:4px;padding:12px;margin:6px 0;border-left:4px solid #4CAF50;}
.result h3{margin:0 0 6px 0;color:#333;font-size:13px;}
.result p{margin:3px 0;color:#555;font-size:12px;}
.failed-box{background:#fff3f3;border:1px solid #ffcccc;border-radius:4px;padding:12px;margin:6px 0;font-size:13px;}
.keywords{color:#1565C0;font-weight:bold;}
</style>
</head>
<body>
<h1>🌍 HumaLation 번역 테스트</h1>

<label>YouTube 제목</label>
<input type="text" id="title" placeholder="예: 피아노 힐링 음악 1시간">

<label>YouTube 설명</label>
<textarea id="description" rows="4" placeholder="예: 편안한 피아노 음악으로 하루의 피로를 풀어보세요"></textarea>

<label>키워드 (쉼표로 구분)</label>
<input type="text" id="keywords" placeholder="예: 힐링, 피아노, 음악, 수면, 휴식">

<button id="btn" onclick="startTranslate()">🚀 70개국 번역 시작</button>

<div id="progress-box">
  <div id="progress-text">번역 준비 중...</div>
  <div id="progress-bar-wrap">
    <div id="progress-bar"></div>
  </div>
</div>

<div id="summary"></div>
<div id="results"></div>

<script>
const LANGS = [
  {code:'af',name:'Afrikaans'},{code:'sq',name:'Albanian'},{code:'ar',name:'Arabic'},
  {code:'hy',name:'Armenian'},{code:'az',name:'Azerbaijani'},{code:'bn',name:'Bengali'},
  {code:'bs',name:'Bosnian'},{code:'bg',name:'Bulgarian'},{code:'ca',name:'Catalan'},
  {code:'zh-Hans',name:'Chinese Simplified'},{code:'zh-Hant',name:'Chinese Traditional'},
  {code:'hr',name:'Croatian'},{code:'cs',name:'Czech'},{code:'da',name:'Danish'},
  {code:'nl',name:'Dutch'},{code:'en',name:'English'},{code:'et',name:'Estonian'},
  {code:'fi',name:'Finnish'},{code:'fr',name:'French'},{code:'ka',name:'Georgian'},
  {code:'de',name:'German'},{code:'el',name:'Greek'},{code:'gu',name:'Gujarati'},
  {code:'he',name:'Hebrew'},{code:'hi',name:'Hindi'},{code:'hu',name:'Hungarian'},
  {code:'is',name:'Icelandic'},{code:'id',name:'Indonesian'},{code:'it',name:'Italian'},
  {code:'ja',name:'Japanese'},{code:'kn',name:'Kannada'},{code:'kk',name:'Kazakh'},
  {code:'km',name:'Khmer'},{code:'ko',name:'Korean'},{code:'lo',name:'Lao'},
  {code:'lv',name:'Latvian'},{code:'lt',name:'Lithuanian'},{code:'mk',name:'Macedonian'},
  {code:'ms',name:'Malay'},{code:'ml',name:'Malayalam'},{code:'mt',name:'Maltese'},
  {code:'mn',name:'Mongolian'},{code:'ne',name:'Nepali'},{code:'nb',name:'Norwegian'},
  {code:'ps',name:'Pashto'},{code:'fa',name:'Persian'},{code:'pl',name:'Polish'},
  {code:'pt',name:'Portuguese'},{code:'pa',name:'Punjabi'},{code:'ro',name:'Romanian'},
  {code:'ru',name:'Russian'},{code:'sr',name:'Serbian'},{code:'si',name:'Sinhala'},
  {code:'sk',name:'Slovak'},{code:'sl',name:'Slovenian'},{code:'so',name:'Somali'},
  {code:'es',name:'Spanish'},{code:'sw',name:'Swahili'},{code:'sv',name:'Swedish'},
  {code:'tl',name:'Filipino'},{code:'ta',name:'Tamil'},{code:'te',name:'Telugu'},
  {code:'th',name:'Thai'},{code:'tr',name:'Turkish'},{code:'uk',name:'Ukrainian'},
  {code:'ur',name:'Urdu'},{code:'uz',name:'Uzbek'},{code:'vi',name:'Vietnamese'},
  {code:'cy',name:'Welsh'},{code:'zu',name:'Zulu'}
];

async function startTranslate() {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const keywordsRaw = document.getElementById('keywords').value.trim();
  if (!title) { alert('제목을 입력하세요'); return; }

  const keywords = keywordsRaw ? keywordsRaw.split(',').map(k => '#' + k.trim()).join(' ') : '';

  const startTime = Date.now();
  document.getElementById('btn').disabled = true;
  document.getElementById('btn').textContent = '번역 중...';
  document.getElementById('progress-box').style.display = 'block';
  document.getElementById('progress-bar').style.width = '0%';
  document.getElementById('progress-text').textContent = '번역 준비 중...';
  document.getElementById('results').innerHTML = '';
  document.getElementById('summary').style.display = 'none';

  try {
    document.getElementById('progress-text').textContent = '번역 중... 잠시 기다려주세요';
    document.getElementById('progress-bar').style.width = '50%';

    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title, description, keywords, languages: LANGS})
    });
    const data = await res.json();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    document.getElementById('progress-bar').style.width = '100%';
    document.getElementById('progress-text').textContent = `✅ 번역 완료! (${elapsed}초)`;

    const summary = document.getElementById('summary');
    summary.style.display = 'block';
    summary.innerHTML = `
      ✅ 성공: <strong>${data.summary.success}개</strong> &nbsp;|&nbsp;
      ❌ 실패: <strong>${data.summary.failed}개</strong> &nbsp;|&nbsp;
      전체: <strong>${data.summary.total}개</strong> &nbsp;|&nbsp;
      ⏱ 소요시간: <strong>${elapsed}초</strong>
    `;

    let html = '';
    for (const lang of LANGS) {
      const t = data.translations[lang.code];
      if (t) {
        html += `<div class="result">
          <h3>✅ ${lang.name} (${lang.code})</h3>
          <p><strong>제목:</strong> ${t.title}</p>
          <p><strong>설명:</strong> ${t.description}</p>
          ${keywords ? `<p class="keywords">${t.keywords || keywords}</p>` : ''}
        </div>`;
      }
    }

    if (data.failed && data.failed.length > 0) {
      html += `<div class="failed-box"><strong>❌ 번역 실패 (${data.failed.length}개)</strong><br>`;
      data.failed.forEach(f => { html += `• ${f.name} (${f.code})<br>`; });
      html += '</div>';
    }

    document.getElementById('results').innerHTML = html;

  } catch(e) {
    document.getElementById('progress-text').textContent = '오류 발생';
    document.getElementById('results').innerHTML = '<p style="color:red">오류: ' + e.message + '</p>';
  }

  document.getElementById('btn').disabled = false;
  document.getElementById('btn').textContent = '🚀 70개국 번역 시작';
}
</script>
</body>
</html>
