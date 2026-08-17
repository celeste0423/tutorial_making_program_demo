const workflow = [
  {
    id: "excel",
    app: "Excel",
    icon: "X",
    file: "견적_비교표.xlsx",
    path: "Excel / 견적_비교표.xlsx",
    title: "구매 대상 확인",
    description: "승인 상태인 품목과 요청 수량을 확인합니다.",
    condition: "승인 여부와 품목번호 확인",
    action: "승인 품목 선택",
    context: "승인 완료된 구매 대상을 선택한 단계입니다.",
  },
  {
    id: "erp",
    app: "ERP",
    icon: "ERP",
    file: "구매 요청 등록",
    path: "SK Works ERP / 구매 요청 등록",
    title: "구매 요청 등록",
    description: "품목번호와 수량을 입력하고 구매 요청을 제출합니다.",
    condition: "VAT 포함 여부와 결재 경로 확인",
    action: "저장 후 제출",
    context: "입력값과 첨부를 확인한 뒤 구매 요청을 제출했습니다.",
  },
  {
    id: "files",
    app: "Explorer",
    icon: "▰",
    file: "구매요청_첨부파일",
    path: "Explorer / 구매요청_첨부파일",
    title: "견적서 첨부",
    description: "최근 30일 이내 발행된 견적서를 선택해 첨부합니다.",
    condition: "파일 형식과 견적서 발행일 확인",
    action: "견적서_최종.pdf",
    context: "구매 요청의 근거가 되는 최신 견적서를 선택했습니다.",
  },
  {
    id: "mail",
    app: "Mail",
    icon: "✉",
    file: "구매 요청 완료 통보",
    path: "Mail / 새 메시지",
    title: "담당자 통보",
    description: "생성된 구매번호를 담당자에게 전달합니다.",
    condition: "구매번호와 수신자 확인",
    action: "메일 보내기",
    context: "구매번호를 포함한 완료 메일을 담당자에게 전송했습니다.",
  },
];

const app = document.querySelector(".creator-app");
const panes = [...document.querySelectorAll("[data-pane]")];
const stepIndicators = [...document.querySelectorAll("[data-step]")];
const tutorialName = document.querySelector("#tutorial-name");
const recordStatus = document.querySelector("#record-status");
const recordTimer = document.querySelector("#record-timer");
const appSwitcher = document.querySelector("#app-switcher");
const simulatedApp = document.querySelector("#simulated-app");
const workPath = document.querySelector("#work-path");
const aiContext = document.querySelector("#ai-context");
const eventList = document.querySelector("#event-list");
const captureCount = document.querySelector("#capture-count");
const finishRecording = document.querySelector("#finish-recording");
const generatedCards = document.querySelector("#generated-cards");

const state = {
  mode: "setup",
  captureIndex: 0,
  captured: [],
  viewedStep: workflow[0],
  cards: workflow.map((step) => ({ ...step })),
  selected: new Set(),
  replayIndex: 0,
  seconds: 0,
  timerId: null,
};

function setMode(mode) {
  state.mode = mode;
  app.dataset.mode = mode;
  panes.forEach((pane) => pane.classList.toggle("active", pane.dataset.pane === mode));
  const order = ["setup", "capture", "edit", "replay"];
  const activeIndex = order.indexOf(mode);
  stepIndicators.forEach((indicator) => {
    const indicatorIndex = order.indexOf(indicator.dataset.step);
    indicator.classList.toggle("active", indicatorIndex <= activeIndex);
  });
}

function startTimer() {
  window.clearInterval(state.timerId);
  state.seconds = 0;
  recordTimer.textContent = "00:00";
  state.timerId = window.setInterval(() => {
    state.seconds += 1;
    const minutes = String(Math.floor(state.seconds / 60)).padStart(2, "0");
    const seconds = String(state.seconds % 60).padStart(2, "0");
    recordTimer.textContent = `${minutes}:${seconds}`;
  }, 1000);
}

function renderAppSwitcher() {
  appSwitcher.innerHTML = "";
  workflow.forEach((step) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `app-tab${state.viewedStep.id === step.id ? " active" : ""}`;
    button.dataset.app = step.id;
    button.innerHTML = `<i>${step.icon}</i><span>${step.app}<small>${step.file}</small></span>`;
    button.addEventListener("click", () => {
      state.viewedStep = step;
      renderCaptureScreen();
      const expected = workflow[state.captureIndex];
      if (expected && expected.id !== step.id) {
        aiContext.innerHTML = `<small>앱 전환 감지</small><strong>다음 단계는 ${expected.app}의 “${expected.action}”입니다.</strong>`;
      }
    });
    appSwitcher.appendChild(button);
  });
}

function screenMarkup(step, guide = false) {
  let body = "";
  if (step.id === "excel") {
    body = `
      <div class="app-content">
        <div class="sim-title"><h4>구매 견적 비교표</h4><span>2026년 8월 · 구매1팀</span></div>
        <div class="sheet-grid">
          <div class="sheet-row head"><b>No.</b><b>품목명</b><b>공급업체</b><b>수량</b><b>승인 상태</b></div>
          <div class="sheet-row"><span>1</span><span>회의실 모니터</span><span>성진OA</span><span>2</span><span>검토 중</span></div>
          <div class="sheet-row approved"><span>2</span><span>매쉬 사무용 의자</span><span>한빛퍼니처</span><span>10</span><span>승인 완료</span></div>
          <div class="sheet-row"><span>3</span><span>무선 키보드</span><span>네오테크</span><span>12</span><span>보류</span></div>
        </div>
      </div>`;
  }
  if (step.id === "erp") {
    body = `
      <div class="app-content">
        <div class="sim-title"><h4>구매 요청 등록</h4><span>요청번호 PR-20260817-04</span></div>
        <div class="sim-form">
          <div class="sim-field"><small>요청 부서</small><b>구매1팀</b></div>
          <div class="sim-field"><small>요청자</small><b>김구매</b></div>
          <div class="sim-field"><small>품목 코드</small><b>FURN-CH-001</b></div>
          <div class="sim-field"><small>요청 수량</small><b>10 EA</b></div>
          <div class="sim-field"><small>합계 금액</small><b>2,660,000원</b></div>
          <div class="sim-field"><small>VAT</small><b>포함</b></div>
        </div>
        <div class="sheet-grid" style="margin-top:16px">
          <div class="sheet-row head"><b>No.</b><b>품목명</b><b>단가</b><b>수량</b><b>금액</b></div>
          <div class="sheet-row"><span>1</span><span>매쉬 사무용 의자</span><span>210,000</span><span>10</span><span>2,100,000</span></div>
          <div class="sheet-row"><span>2</span><span>회의용 의자</span><span>120,000</span><span>4</span><span>480,000</span></div>
        </div>
      </div>`;
  }
  if (step.id === "files") {
    body = `
      <div class="app-content">
        <div class="sim-title"><h4>구매요청_첨부파일</h4><span>수정한 날짜 ↓</span></div>
        <div class="sim-files">
          <div class="sim-file"><i>📄</i><b>견적서_초안.pdf</b><small>2026-07-12 · 1.1 MB</small></div>
          <div class="sim-file"><i>📊</i><b>견적_비교표.xlsx</b><small>2026-08-16 · 48 KB</small></div>
          <div class="sim-file"><i>📄</i><b>견적서_최종.pdf</b><small>2026-08-17 · 1.4 MB</small></div>
          <div class="sim-file"><i>🖼</i><b>제품_이미지.png</b><small>2026-08-14 · 860 KB</small></div>
        </div>
      </div>`;
  }
  if (step.id === "mail") {
    body = `
      <div class="app-content">
        <div class="sim-title"><h4>새 메시지</h4><span>초안 저장됨</span></div>
        <div class="mail-compose">
          <div class="mail-line"><span>받는 사람</span><b>구매승인 담당자</b></div>
          <div class="mail-line"><span>제목</span><b>[완료] 구매 요청 PR-20260817-04</b></div>
          <div class="mail-body">안녕하세요.<br /><br />사무용 의자 구매 요청 등록이 완료되었습니다.<br />구매번호: <b>PR-20260817-04</b><br /><br />검토 부탁드립니다.</div>
        </div>
      </div>`;
  }
  return `${body}<button class="sim-action" type="button" data-capture="${step.id}">${step.action}</button>${guide ? `<div class="guide-bubble">여기를 클릭하세요<br /><b>${step.action}</b></div>` : ""}`;
}

function renderCaptureScreen() {
  const step = state.viewedStep;
  simulatedApp.dataset.app = step.id;
  simulatedApp.innerHTML = screenMarkup(step);
  workPath.textContent = step.path;
  renderAppSwitcher();
  const hotspot = simulatedApp.querySelector("[data-capture]");
  hotspot.addEventListener("click", () => captureStep(step));
}

function captureStep(step) {
  const expected = workflow[state.captureIndex];
  if (!expected || step.id !== expected.id) {
    aiContext.innerHTML = `<small>순서 확인</small><strong>먼저 ${expected?.app ?? "현재"} 단계의 빨간 표시를 클릭하세요.</strong>`;
    return;
  }

  state.captured.push(step.id);
  state.captureIndex += 1;
  const item = document.createElement("div");
  item.className = "event-item";
  item.innerHTML = `<i>✓</i><div><b>${step.title}</b><small>${step.app} · “${step.action}” 클릭 캡처</small></div>`;
  eventList.prepend(item);
  captureCount.textContent = `${state.captureIndex} / ${workflow.length}`;
  aiContext.innerHTML = `<small>AI 맥락 분석 완료</small><strong>${step.context}</strong>`;

  if (state.captureIndex === workflow.length) {
    finishRecording.disabled = false;
    recordStatus.textContent = "캡처 완료";
    aiContext.innerHTML = "<small>4개 앱의 업무 흐름 연결 완료</small><strong>기록을 종료하면 단계 카드와 완료 조건을 생성합니다.</strong>";
    renderAppSwitcher();
    return;
  }

  window.setTimeout(() => {
    state.viewedStep = workflow[state.captureIndex];
    renderCaptureScreen();
    aiContext.innerHTML = `<small>앱 전환 자동 감지</small><strong>${state.viewedStep.app}에서 “${state.viewedStep.action}”을 찾았습니다.</strong>`;
  }, 450);
}

function renderCards() {
  generatedCards.innerHTML = "";
  state.cards.forEach((card, index) => {
    const article = document.createElement("article");
    article.className = `generated-card${state.selected.has(card.id) ? " selected" : ""}`;
    article.dataset.id = card.id;
    article.innerHTML = `
      <span>0${index + 1} · ${card.app}</span>
      <h4>${card.title}</h4>
      <p>${card.description}</p>
      <small>완료 조건 · ${card.condition}</small>
      <div class="card-actions">
        <button type="button" data-action="up" title="위로 이동">↑</button>
        <button type="button" data-action="down" title="아래로 이동">↓</button>
        <button type="button" data-action="rename" title="이름 수정">✎</button>
        <button type="button" data-action="delete" title="삭제">×</button>
      </div>`;
    article.addEventListener("click", (event) => {
      const action = event.target.closest("button")?.dataset.action;
      if (action) {
        handleCardAction(action, card.id);
        return;
      }
      state.selected.has(card.id) ? state.selected.delete(card.id) : state.selected.add(card.id);
      renderCards();
    });
    generatedCards.appendChild(article);
  });
  document.querySelector("#generated-count").textContent = `${state.cards.length}개 단계`;
}

function handleCardAction(action, id) {
  const index = state.cards.findIndex((card) => card.id === id);
  if (index < 0) return;
  if (action === "up" && index > 0) [state.cards[index - 1], state.cards[index]] = [state.cards[index], state.cards[index - 1]];
  if (action === "down" && index < state.cards.length - 1) [state.cards[index + 1], state.cards[index]] = [state.cards[index], state.cards[index + 1]];
  if (action === "rename") {
    const nextName = window.prompt("단계 이름을 수정하세요.", state.cards[index].title);
    if (nextName?.trim()) state.cards[index].title = nextName.trim();
  }
  if (action === "delete" && state.cards.length > 1) {
    state.cards.splice(index, 1);
    state.selected.delete(id);
  }
  renderCards();
}

function mergeSelectedCards() {
  const selectedCards = state.cards.filter((card) => state.selected.has(card.id));
  const button = document.querySelector("#merge-cards");
  if (selectedCards.length < 2) {
    button.textContent = "2개 이상 선택하세요";
    window.setTimeout(() => { button.textContent = "선택 단계 합치기"; }, 1400);
    return;
  }
  const firstIndex = state.cards.findIndex((card) => state.selected.has(card.id));
  const merged = {
    ...selectedCards[0],
    id: `merged-${Date.now()}`,
    app: selectedCards.map((card) => card.app).join(" + "),
    title: selectedCards.map((card) => card.title).join(" · "),
    description: selectedCards.map((card) => card.description).join(" "),
    condition: selectedCards.map((card) => card.condition).join(" / "),
  };
  state.cards = state.cards.filter((card) => !state.selected.has(card.id));
  state.cards.splice(firstIndex, 0, merged);
  state.selected.clear();
  renderCards();
}

function renderReplay() {
  const step = state.cards[state.replayIndex] ?? state.cards[0];
  const sourceStep = workflow.find((item) => item.id === step.id) ?? workflow.find((item) => step.app.includes(item.app)) ?? workflow[0];
  const replayScreen = document.querySelector("#replay-screen");
  replayScreen.dataset.app = sourceStep.id;
  replayScreen.innerHTML = screenMarkup(sourceStep, true);
  document.querySelector("#replay-app-name").textContent = sourceStep.path;
  document.querySelector("#replay-progress").textContent = `${state.replayIndex + 1} / ${state.cards.length}`;
  document.querySelector("#replay-title").textContent = step.title;
  document.querySelector("#replay-description").textContent = step.description;
  document.querySelector("#replay-condition").innerHTML = `<span>완료 조건</span><strong>${step.condition}</strong>`;
  document.querySelector("#replay-prev").disabled = state.replayIndex === 0;
  document.querySelector("#replay-next").textContent = state.replayIndex === state.cards.length - 1 ? "가이드 완료　✓" : "다음 단계　→";
}

document.querySelector("#start-recording").addEventListener("click", () => {
  const name = tutorialName.value.trim() || "새 업무";
  document.querySelector("#generated-title").textContent = name;
  recordStatus.textContent = `${name} · 캡처 중`;
  state.captureIndex = 0;
  state.captured = [];
  state.cards = workflow.map((step) => ({ ...step }));
  state.selected.clear();
  state.viewedStep = workflow[0];
  eventList.innerHTML = "";
  captureCount.textContent = "0 / 4";
  finishRecording.disabled = true;
  setMode("capture");
  startTimer();
  renderCaptureScreen();
});

finishRecording.addEventListener("click", () => {
  window.clearInterval(state.timerId);
  recordStatus.textContent = "AI 구조화 완료";
  setMode("edit");
  renderCards();
});

document.querySelector("#merge-cards").addEventListener("click", mergeSelectedCards);
document.querySelector("#start-replay").addEventListener("click", () => {
  state.replayIndex = 0;
  recordStatus.textContent = "따라 하기 모드";
  setMode("replay");
  renderReplay();
});
document.querySelector("#replay-prev").addEventListener("click", () => {
  state.replayIndex = Math.max(0, state.replayIndex - 1);
  renderReplay();
});
document.querySelector("#replay-next").addEventListener("click", () => {
  if (state.replayIndex < state.cards.length - 1) state.replayIndex += 1;
  else state.replayIndex = 0;
  renderReplay();
});
document.querySelector("#restart-demo").addEventListener("click", () => {
  window.clearInterval(state.timerId);
  recordStatus.textContent = "새 튜토리얼";
  recordTimer.textContent = "00:00";
  setMode("setup");
});

document.querySelectorAll("[data-scroll-creator]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector("#creator").scrollIntoView({ behavior: "smooth" }));
});

const observer = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 },
);
document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
