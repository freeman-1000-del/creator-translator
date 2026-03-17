const TRANSLATOR_URL = "https://creator-translator.vercel.app";

function log(msg) {
  const el = document.getElementById("log");
  el.classList.add("show");
  el.innerHTML += `<div>${msg}</div>`;
  el.scrollTop = el.scrollHeight;
}

// 번역 결과 로드
async function loadTranslationData() {
  try {
    const result = await chrome.storage.local.get(["translationData", "translationTime"]);
    const data = result.translationData;
    const time = result.translationTime;

    if (data && Object.keys(data).length > 0) {
      const count = Object.keys(data).length;
      const timeStr = time ? new Date(time).toLocaleTimeString("ko-KR") : "";
      document.getElementById("status-display").className = "status ready";
      document.getElementById("status-display").textContent = `✓ ${count}개국 번역 완료 ${timeStr ? `(${timeStr})` : ""}`;
      document.getElementById("btn-register").disabled = false;
      document.getElementById("result-count").textContent = `${count}개 언어 등록 준비 완료`;
    } else {
      document.getElementById("status-display").className = "status empty";
      document.getElementById("status-display").textContent = "번역기에서 번역을 먼저 실행해주세요";
      document.getElementById("btn-register").disabled = true;
    }
  } catch (e) {
    console.error(e);
  }
}

// YouTube Studio 자동 등록
document.getElementById("btn-register").addEventListener("click", async () => {
  const url = document.getElementById("video-url").value.trim();
  if (!url) {
    alert("YouTube 영상 URL을 입력해주세요.");
    return;
  }

  const vid = url.match(/[?&]v=([^&]+)/)?.[1];
  if (!vid) {
    alert("올바른 YouTube URL을 입력해주세요.\n예: https://www.youtube.com/watch?v=xxxxx");
    return;
  }

  const result = await chrome.storage.local.get(["translationData"]);
  const data = result.translationData;
  if (!data || Object.keys(data).length === 0) {
    alert("번역 데이터가 없습니다. 번역기에서 먼저 번역을 실행해주세요.");
    return;
  }

  document.getElementById("btn-register").disabled = true;
  document.getElementById("btn-register").textContent = "등록 중...";

  // YouTube Studio 번역 탭 열기
  const studioUrl = `https://studio.youtube.com/video/${vid}/translations`;
  
  const tabs = await chrome.tabs.query({ url: "https://studio.youtube.com/*" });
  let tab;
  
  if (tabs.length > 0) {
    tab = tabs[0];
    await chrome.tabs.update(tab.id, { url: studioUrl, active: true });
  } else {
    tab = await chrome.tabs.create({ url: studioUrl });
  }

  // 탭 로드 대기
  log("YouTube Studio 열는 중...");
  
  await new Promise(resolve => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });

  // 잠시 대기 (페이지 렌더링)
  await new Promise(r => setTimeout(r, 2000));
  log("번역 데이터 전송 중...");

  // content.js에 데이터 전송
  try {
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: "registerTranslations",
      data: data,
      videoId: vid
    });

    if (response && response.success) {
      log(`✓ ${response.count}개 언어 등록 완료!`);
      document.getElementById("btn-register").textContent = "✓ 등록 완료!";
      document.getElementById("btn-register").style.background = "#34a853";
    } else {
      log("오류: " + (response?.error || "알 수 없는 오류"));
      document.getElementById("btn-register").disabled = false;
      document.getElementById("btn-register").textContent = "▶ YouTube Studio 자동 등록";
    }
  } catch (e) {
    log("오류: " + e.message);
    document.getElementById("btn-register").disabled = false;
    document.getElementById("btn-register").textContent = "▶ YouTube Studio 자동 등록";
  }
});

// 번역기 열기
document.getElementById("btn-open-translator").addEventListener("click", () => {
  chrome.tabs.create({ url: TRANSLATOR_URL });
});

// 초기 로드
loadTranslationData();

// 스토리지 변경 감지
chrome.storage.onChanged.addListener((changes) => {
  if (changes.translationData) {
    loadTranslationData();
  }
});
