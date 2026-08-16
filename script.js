const steps = [
  {
    app: "Excel",
    title: "구매 대상 확인",
    body: "승인 완료된 품목만 선택합니다. 완료 조건은 승인 여부와 품목번호 확인입니다.",
    warning: "중요: 상태값이 승인인지 먼저 체크",
    sceneClass: "scene-excel",
    focusClass: "focus-excel",
    signals: ["활성 앱 감지", "창 제목 기록", "클릭한 셀 범위 기록"],
  },
  {
    app: "ERP",
    title: "구매 요청 화면 열기",
    body: "ERP 메뉴 이동과 구매 요청 폼 진입을 하나의 단계로 합칩니다.",
    warning: "주의: 메뉴 왕복이 2회 이상 발생하면 비효율로 표시",
    sceneClass: "scene-erp",
    focusClass: "focus-review",
    signals: ["앱 전환 감지", "메뉴 클릭 기록", "창 제목 변경 감지"],
  },
  {
    app: "ERP",
    title: "품목번호와 수량 입력",
    body: "복사한 품목번호와 수량을 붙여넣고 저장 전 검증 포인트를 남깁니다.",
    warning: "판단: VAT 포함 여부를 사용자가 확인",
    sceneClass: "scene-erp",
    focusClass: "focus-erp",
    signals: ["붙여넣기 감지", "반복 입력 3건 탐지", "저장 버튼 후보 감지"],
  },
  {
    app: "Explorer",
    title: "견적서 첨부",
    body: "최근 30일 이내 견적서 파일을 선택하고 첨부 버튼까지 연결합니다.",
    warning: "주의: 오래된 파일 또는 확장자 불일치 시 경고",
    sceneClass: "scene-explorer",
    focusClass: "focus-explorer",
    signals: ["파일 열기 이벤트", "최근 파일명 기록", "첨부 버튼 클릭 감지"],
  },
  {
    app: "Mail",
    title: "담당자 통보",
    body: "생성된 구매번호를 메일 본문에 삽입하고 수신자 확인까지 안내합니다.",
    warning: "중요: 외부 수신자 포함 여부를 한 번 더 체크",
    sceneClass: "scene-mail",
    focusClass: "focus-mail",
    signals: ["메일 앱 전환", "복사/붙여넣기 추적", "전송 버튼 위치 저장"],
  },
  {
    app: "Guide",
    title: "따라 하기 모드 생성",
    body: "AI가 정리한 단계와 스크린샷을 바탕으로 초보자용 오버레이 가이드를 생성합니다.",
    warning: "주의: 실제 클릭은 사용자가 수행, AI는 강조만 제공",
    sceneClass: "scene-guide",
    focusClass: "focus-guide",
    signals: ["단계 병합 추천", "주의사항 카드 생성", "라이브 강조 좌표 저장"],
  },
  {
    app: "Result",
    title: "업무 가이드 완성",
    body: "카드 7개, 주의사항 3개, 반복 입력 개선 포인트 1개를 포함한 튜토리얼이 완성됩니다.",
    warning: "완료: 이후에는 실제 화면 위에서 그대로 재생 가능",
    sceneClass: "scene-finish",
    focusClass: "focus-finish",
    signals: ["완료 기준 저장", "성공 화면 캡처", "배포 가능한 SOP 생성"],
  },
];

const state = {
  activeIndex: 0,
  isPlaying: true,
};

const cardContainer = document.querySelector("#player-cards");
const titleEl = document.querySelector("#guide-title");
const bodyEl = document.querySelector("#guide-body");
const warningEl = document.querySelector("#guide-warning");
const signalsEl = document.querySelector("#guide-signals");
const shotAppEl = document.querySelector("#shot-app");
const shotTitleEl = document.querySelector("#shot-title");
const shotSceneEl = document.querySelector("#shot-scene");
const focusBoxEl = document.querySelector("#focus-box");
const progressEl = document.querySelector("#timeline-progress");
const counterEl = document.querySelector("#step-counter");
const playButton = document.querySelector("#play-toggle");

let intervalId = null;

function renderCards() {
  cardContainer.innerHTML = "";

  steps.forEach((step, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `player-card${index === state.activeIndex ? " is-active" : ""}`;
    button.innerHTML = `
      <span>${String(index + 1).padStart(2, "0")}</span>
      <strong>${step.title}</strong>
      <p>${step.app} · ${step.warning}</p>
    `;
    button.addEventListener("click", () => {
      state.activeIndex = index;
      state.isPlaying = false;
      syncPlayButton();
      updateScene();
      stopAutoPlay();
    });
    cardContainer.appendChild(button);
  });
}

function updateScene() {
  const step = steps[state.activeIndex];

  titleEl.textContent = step.title;
  bodyEl.textContent = step.body;
  warningEl.textContent = step.warning;
  shotAppEl.textContent = step.app;
  shotTitleEl.textContent = step.title;
  counterEl.textContent = `${String(state.activeIndex + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  progressEl.style.width = `${((state.activeIndex + 1) / steps.length) * 100}%`;

  shotSceneEl.className = `desktop-scene ${step.sceneClass}`;
  focusBoxEl.className = `red-focus ${step.focusClass}`;
  shotSceneEl.appendChild(focusBoxEl);

  signalsEl.innerHTML = "";
  step.signals.forEach((signal) => {
    const item = document.createElement("li");
    item.textContent = signal;
    signalsEl.appendChild(item);
  });

  Array.from(cardContainer.children).forEach((card, index) => {
    card.classList.toggle("is-active", index === state.activeIndex);
  });
}

function nextStep() {
  state.activeIndex = (state.activeIndex + 1) % steps.length;
  updateScene();
}

function stopAutoPlay() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = null;
  }
}

function startAutoPlay() {
  stopAutoPlay();
  intervalId = window.setInterval(() => {
    nextStep();
  }, 2800);
}

function syncPlayButton() {
  playButton.textContent = state.isPlaying ? "Pause" : "Play";
}

playButton.addEventListener("click", () => {
  state.isPlaying = !state.isPlaying;
  syncPlayButton();

  if (state.isPlaying) {
    startAutoPlay();
  } else {
    stopAutoPlay();
  }
});

renderCards();
updateScene();
startAutoPlay();
