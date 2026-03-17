// YouTube Studio 자동 입력 스크립트

// YT_CODE_MAP - YouTube 지원 언어코드 매핑
const YT_CODE_MAP = {
  "en":"en","fr":"fr","de":"de","es":"es","it":"it",
  "pt":"pt-BR","ru":"ru","nl":"nl","pl":"pl","sv":"sv",
  "da":"da","fi":"fi","el":"el","cs":"cs","sk":"sk",
  "hu":"hu","ro":"ro","bg":"bg","hr":"hr","sr":"sr",
  "uk":"uk","sq":"sq","et":"et","lv":"lv","lt":"lt",
  "ja":"ja","zh-CN":"zh-Hans","zh-TW":"zh-Hant","ar":"ar",
  "hi":"hi","tr":"tr","vi":"vi","th":"th","id":"id",
  "ms":"ms","tl":"fil","bn":"bn","ur":"ur","fa":"fa",
  "he":"iw","ta":"ta","te":"te","ml":"ml","kn":"kn",
  "pa":"pa","mn":"mn","kk":"kk","uz":"uz","az":"az",
  "ka":"ka","hy":"hy","my":"my","km":"km","si":"si",
  "sw":"sw","ca":"ca","cy":"cy","ga":"ga","af":"af",
  "ne":"ne","sl":"sl","mk":"mk","ko":"ko"
};

// 지원 언어코드 Set
const YT_SAFE = new Set(Object.values(YT_CODE_MAP));

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 텍스트 입력 (React 상태 업데이트 트리거)
function setInputValue(el, value) {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
    || Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

// 언어 추가 버튼 클릭
async function addLanguage(langCode) {
  // "언어 추가" 버튼 찾기
  const addBtns = document.querySelectorAll('button[aria-label*="언어"], button[aria-label*="Add language"], ytcp-button');
  for (const btn of addBtns) {
    if (btn.textContent.includes('언어 추가') || btn.textContent.includes('Add language')) {
      btn.click();
      await sleep(800);
      break;
    }
  }

  // 언어 선택 드롭다운에서 언어 찾기
  const items = document.querySelectorAll('tp-yt-paper-item, ytcp-text-menu-option');
  for (const item of items) {
    if (item.dataset.value === langCode || item.getAttribute('data-value') === langCode) {
      item.click();
      await sleep(500);
      return true;
    }
  }
  return false;
}

// 번역 등록 메인 함수
async function registerTranslations(data, videoId) {
  let count = 0;
  const errors = [];

  // 현재 URL이 번역 탭인지 확인
  if (!window.location.href.includes('/translations')) {
    window.location.href = `https://studio.youtube.com/video/${videoId}/translations`;
    await sleep(3000);
  }

  // 각 언어 처리
  for (const [langCode, r] of Object.entries(data)) {
    if (langCode === 'ko') continue; // 원본 한국어 스킵

    const ytCode = YT_CODE_MAP[langCode] || langCode;
    if (!YT_SAFE.has(ytCode)) continue;

    try {
      // "언어 추가" 클릭
      const added = await addLanguage(ytCode);
      if (!added) {
        // 이미 있는 언어 찾기
        const existingRow = document.querySelector(`[data-language="${ytCode}"], [data-value="${ytCode}"]`);
        if (!existingRow) continue;
      }

      await sleep(500);

      // 제목 입력
      const titleInputs = document.querySelectorAll('input[placeholder*="제목"], input[placeholder*="Title"], ytcp-form-input-container input');
      const titleInput = titleInputs[titleInputs.length - 1];
      if (titleInput && r.cTitle) {
        titleInput.focus();
        setInputValue(titleInput, r.cTitle.substring(0, 100));
        await sleep(300);
      }

      // 설명문 입력
      const descInputs = document.querySelectorAll('textarea[placeholder*="설명"], textarea[placeholder*="Description"], ytcp-form-textarea textarea');
      const descInput = descInputs[descInputs.length - 1];
      if (descInput && r.gDesc) {
        descInput.focus();
        const descWithKw = r.keywords
          ? r.gDesc + '\n\n' + r.keywords
          : r.gDesc;
        setInputValue(descInput, descWithKw.substring(0, 4900));
        await sleep(300);
      }

      // 게시 버튼
      const publishBtns = document.querySelectorAll('button[aria-label*="게시"], button[aria-label*="Publish"], ytcp-button#publish-button');
      for (const btn of publishBtns) {
        if (btn.textContent.includes('게시') || btn.textContent.includes('Publish')) {
          btn.click();
          await sleep(500);
          break;
        }
      }

      count++;
      console.log(`✓ ${langCode} 등록 완료`);
      await sleep(800);

    } catch (e) {
      errors.push(`${langCode}: ${e.message}`);
      console.warn(`✗ ${langCode} 실패:`, e.message);
    }
  }

  return { success: true, count, errors };
}

// 메시지 리스너 (팝업에서)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'registerTranslations') {
    registerTranslations(msg.data, msg.videoId)
      .then(result => sendResponse(result))
      .catch(e => sendResponse({ success: false, error: e.message }));
    return true;
  }
});

// 번역기 페이지에서 postMessage 수신
window.addEventListener('message', (event) => {
  if (event.data?.type === 'TRANSLATION_COMPLETE') {
    chrome.storage.local.set({
      translationData: event.data.data,
      translationTime: event.data.time
    });
    console.log('✓ 번역 데이터 저장됨:', Object.keys(event.data.data).length, '개국');
  }
});

console.log('70개국 맥락번역기 익스텐션 로드됨');
