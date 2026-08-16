const steps = [
  {
    app: "ERP Capture",
    title: "구매 요청 등록",
    body: "ERP에서 구매 요청서를 작성하고 저장 후 제출 위치까지 함께 기록합니다.",
    warning: "주의: 결재 금액 기준에 따라 라우팅 확인이 필요합니다.",
    image: "./assets/capture-hero.png",
    focusClass: "focus-capture",
    signals: ["활성 앱과 창 제목 기록", "첨부 파일과 저장 이벤트 기록", "반복 입력 3회 탐지"],
  },
  {
    app: "Workflow Editor",
    title: "카드형 업무 흐름 편집",
    body: "캡처된 화면을 단계 카드로 바꾼 뒤, 병합과 이름 수정, 조건 분기를 통해 표준업무로 다듬습니다.",
    warning: "주의: 불필요한 왕복 단계는 합치고 완료 조건을 명확히 남겨야 합니다.",
    image: "./assets/workflow-editor.png",
    focusClass: "focus-editor",
    signals: ["단계 병합 추천", "주의사항 카드 생성", "스크린샷 기반 단계 미리보기"],
  },
  {
    app: "Live Guide",
    title: "실제 화면 위에서 다시 재생",
    body: "초보자 화면 위에 현재 단계와 완료 조건을 띄우고, 다음에 눌러야 할 실제 버튼 위치를 강조합니다.",
    warning: "주의: AI는 클릭을 대신하지 않고, 사용자의 판단과 실행을 그대로 남겨둡니다.",
    image: "./assets/live-guide.png",
    focusClass: "focus-guide",
    signals: ["다음 단계 카드 표시", "완료 조건 체크리스트", "실제 버튼 강조 오버레이"],
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
const shotImageEl = document.querySelector("#stage-image");
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
  shotImageEl.src = step.image;
  counterEl.textContent = `${String(state.activeIndex + 1).padStart(2, "0")} / ${String(steps.length).padStart(2, "0")}`;
  progressEl.style.width = `${((state.activeIndex + 1) / steps.length) * 100}%`;
  focusBoxEl.className = `focus-box ${step.focusClass}`;

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
  intervalId = window.setInterval(nextStep, 3200);
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
