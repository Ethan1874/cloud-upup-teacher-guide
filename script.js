const pageOrder = [
  "start",
  "device",
  "register",
  "login",
  "buy",
  "download-iphone",
  "download-android",
  "download-windows",
  "download-mac",
  "mobile-subscribe",
  "desktop-login",
  "connect",
  "done",
];

const screens = Array.from(document.querySelectorAll(".screen"));
const deviceCards = Array.from(document.querySelectorAll(".device-card"));
const backButton = document.querySelector("#back-button");
const nextButton = document.querySelector("#next-button");
const restartButton = document.querySelector("#restart-button");
const counter = document.querySelector("#step-counter");
const progressFill = document.querySelector("#progress-fill");

let selectedDevice = localStorage.getItem("cloud-wizard-device") || "";
let currentPage = localStorage.getItem("cloud-wizard-page") || "start";

function visiblePages() {
  return pageOrder.filter((pageId) => {
    const screen = document.querySelector(`[data-page="${pageId}"]`);
    const devices = screen.dataset.devices;
    return !devices || devices.split(" ").includes(selectedDevice);
  });
}

function currentIndex() {
  const pages = visiblePages();
  const index = pages.indexOf(currentPage);
  return index === -1 ? 0 : index;
}

function isPageComplete(screen) {
  if (screen.dataset.requiresDevice !== undefined) {
    return Boolean(selectedDevice);
  }

  const required = Array.from(screen.querySelectorAll("[data-required]"));
  return required.every((field) => field.checked);
}

function saveCheckboxState(field) {
  const page = field.closest(".screen").dataset.page;
  localStorage.setItem(`cloud-wizard-check-${page}`, String(field.checked));
}

function restoreCheckboxes() {
  screens.forEach((screen) => {
    const page = screen.dataset.page;
    screen.querySelectorAll("[data-required]").forEach((field) => {
      field.checked = localStorage.getItem(`cloud-wizard-check-${page}`) === "true";
    });
  });
}

function setDevice(device) {
  selectedDevice = device;
  localStorage.setItem("cloud-wizard-device", device);
  deviceCards.forEach((card) => {
    const active = card.dataset.device === device;
    card.classList.toggle("active", active);
    card.setAttribute("aria-checked", String(active));
  });
  render();
}

function setPage(pageId) {
  const pages = visiblePages();
  currentPage = pages.includes(pageId) ? pageId : pages[0];
  localStorage.setItem("cloud-wizard-page", currentPage);
  render();
}

function render() {
  const pages = visiblePages();
  const index = currentIndex();
  currentPage = pages[index];
  const activeScreen = document.querySelector(`[data-page="${currentPage}"]`);

  screens.forEach((screen) => {
    screen.classList.toggle("active", screen === activeScreen);
  });

  const total = pages.length;
  const percent = total <= 1 ? 100 : Math.round((index / (total - 1)) * 100);
  counter.textContent = `第 ${index + 1} / ${total} 页：${activeScreen.dataset.title}`;
  progressFill.style.width = `${percent}%`;

  backButton.disabled = index === 0;
  nextButton.disabled = index === total - 1 || !isPageComplete(activeScreen);
  nextButton.textContent = index === total - 1 ? "已完成" : "下一页";
}

function goNext() {
  const pages = visiblePages();
  const index = currentIndex();
  if (index < pages.length - 1) {
    setPage(pages[index + 1]);
  }
}

function goBack() {
  const pages = visiblePages();
  const index = currentIndex();
  if (index > 0) {
    setPage(pages[index - 1]);
  }
}

function restart() {
  localStorage.removeItem("cloud-wizard-device");
  localStorage.removeItem("cloud-wizard-page");
  pageOrder.forEach((page) => localStorage.removeItem(`cloud-wizard-check-${page}`));
  selectedDevice = "";
  currentPage = "start";
  restoreCheckboxes();
  setDevice("");
  setPage("start");
}

deviceCards.forEach((card) => {
  card.addEventListener("click", () => setDevice(card.dataset.device));
});

screens.forEach((screen) => {
  screen.querySelectorAll("[data-required]").forEach((field) => {
    field.addEventListener("change", () => {
      saveCheckboxState(field);
      render();
    });
  });
});

backButton.addEventListener("click", goBack);
nextButton.addEventListener("click", goNext);
restartButton.addEventListener("click", restart);

restoreCheckboxes();
setDevice(selectedDevice);
setPage(currentPage);
