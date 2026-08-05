const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav?.classList.toggle('open', !open);
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    nav.classList.remove('open');
  });
});

document.querySelectorAll('.section-heading, .decision-layout, .route-map, .weather-layout, .hotel-rail, .activity, .compare, .photo-sequence, .budget-calculator').forEach((element) => {
  element.setAttribute('data-reveal', '');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('[data-reveal]').forEach((element) => revealObserver.observe(element));

const checklist = document.querySelector('[data-checklist]');
const checkboxes = [...(checklist?.querySelectorAll('input[type="checkbox"]') ?? [])];
const countOutput = document.querySelector('[data-check-count]');
const storageKey = 'hainan-travel-packing-v1';

function updateChecklistCount() {
  const checked = checkboxes.filter((box) => box.checked).length;
  if (countOutput) countOutput.textContent = `${checked} / ${checkboxes.length}`;
  localStorage.setItem(storageKey, JSON.stringify(checkboxes.map((box) => box.checked)));
}

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  checkboxes.forEach((box, index) => { box.checked = Boolean(saved[index]); });
} catch {
  localStorage.removeItem(storageKey);
}
updateChecklistCount();
checkboxes.forEach((box) => box.addEventListener('change', updateChecklistCount));
document.querySelector('[data-reset-checks]')?.addEventListener('click', () => {
  checkboxes.forEach((box) => { box.checked = false; });
  updateChecklistCount();
});

const baseBudget = 16400;
const totalOutput = document.querySelector('[data-total]');
const budgetInputs = [...document.querySelectorAll('[data-budget-item]')];

function updateBudget() {
  const total = budgetInputs.reduce((sum, input) => sum + (input.checked ? Number(input.dataset.budgetItem) : 0), baseBudget);
  if (totalOutput) totalOutput.textContent = total.toLocaleString('zh-CN');
}

budgetInputs.forEach((input) => input.addEventListener('change', updateBudget));
updateBudget();

const discussionText = `海南 7 天东线计划｜想一起确认的 5 件事
1. 8 月 15 日长沙—海口、8 月 21 日三亚—长沙买哪班，含行李和退改总价多少？
2. 海口取、三亚还的异地还车费是否能接受？
3. 自由潜是否只保留为 D6 可选体验，AIDA2 拆到东莞单独学习？
4. 摩托只在万宁合法路段租 1 天是否足够？
5. 住宿更重视融旅权益和度假感，还是位置、停车与可退？

计划网址：https://lijinzh.github.io/hainan-travel-plan/plans/hainan/`;

document.querySelector('[data-copy-discussion]')?.addEventListener('click', async () => {
  const feedback = document.querySelector('[data-copy-feedback]');
  try {
    await navigator.clipboard.writeText(discussionText);
    if (feedback) feedback.textContent = '讨论清单已复制，可以直接发给同学。';
  } catch {
    if (feedback) feedback.textContent = '浏览器没有允许自动复制，请手动复制“待讨论”部分。';
  }
});
