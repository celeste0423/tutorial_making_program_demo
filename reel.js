const slides = [
  {
    step: "01",
    title: "구매 요청 등록을 캡처합니다",
    body: "ERP 입력, 첨부, 저장 후 제출과 같은 실제 업무 맥락을 하나의 흐름으로 모읍니다.",
    image: "./assets/capture-hero.png",
    focusClass: "focus-capture",
    callout: "저장 후 제출 위치를 함께 기록",
    tag: "Capture",
    points: ["활성 앱과 창 제목 기록", "첨부 파일과 제출 이벤트 수집", "반복 입력과 판단 지점 탐지"],
  },
  {
    step: "02",
    title: "카드형 업무 흐름으로 정리합니다",
    body: "캡처된 장면을 단계 카드로 바꾸고, 병합과 이름 수정, 조건 분기로 실행 가능한 표준업무를 만듭니다.",
    image: "./assets/workflow-editor.png",
    focusClass: "focus-editor",
    callout: "견적서 첨부 단계를 조건과 함께 편집",
    tag: "Structure",
    points: ["단계 병합과 이름 수정", "주의사항 카드 자동 생성", "스크린샷과 앱 출처 연결"],
  },
  {
    step: "03",
    title: "실제 화면 위에서 다시 재생합니다",
    body: "다음 단계, 완료 조건, 버튼 위치를 실제 업무 화면 위에 다시 표시해 초보자도 그대로 따라갈 수 있습니다.",
    image: "./assets/live-guide.png",
    focusClass: "focus-guide",
    callout: "현재 단계에서 눌러야 할 실제 버튼 강조",
    tag: "Replay",
    points: ["현재 단계와 다음 단계 안내", "완료 조건 체크리스트", "실제 버튼 위치 오버레이"],
  },
];

const stepEl = document.querySelector("#reel-step");
const titleEl = document.querySelector("#reel-title");
const bodyEl = document.querySelector("#reel-body");
const imageEl = document.querySelector("#reel-image");
const focusEl = document.querySelector("#reel-focus");
const calloutEl = document.querySelector("#reel-callout strong");
const calloutTagEl = document.querySelector("#reel-callout span");
const pointsEl = document.querySelector("#reel-points");
const progressEl = document.querySelector("#reel-progress");

let index = 0;

function renderSlide() {
  const slide = slides[index];
  stepEl.textContent = slide.step;
  titleEl.textContent = slide.title;
  bodyEl.textContent = slide.body;
  imageEl.src = slide.image;
  focusEl.className = `reel-focus ${slide.focusClass}`;
  calloutEl.textContent = slide.callout;
  calloutTagEl.textContent = slide.tag;
  progressEl.style.width = `${((index + 1) / slides.length) * 100}%`;

  pointsEl.innerHTML = "";
  slide.points.forEach((point) => {
    const li = document.createElement("li");
    li.textContent = point;
    pointsEl.appendChild(li);
  });
}

renderSlide();
window.setInterval(() => {
  index = (index + 1) % slides.length;
  renderSlide();
}, 2600);
