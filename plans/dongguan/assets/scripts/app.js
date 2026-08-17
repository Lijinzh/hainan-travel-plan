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
const planSlug = document.body.classList.contains('dongguan-plan') ? 'dongguan' : 'hainan';
const storageKey = `${planSlug}-travel-packing-v1`;

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

const baseBudget = planSlug === 'dongguan' ? 6800 : 16400;
const totalOutput = document.querySelector('[data-total]');
const budgetInputs = [...document.querySelectorAll('[data-budget-item]')];

function updateBudget() {
  const total = budgetInputs.reduce((sum, input) => sum + (input.checked ? Number(input.dataset.budgetItem) : 0), baseBudget);
  if (totalOutput) totalOutput.textContent = total.toLocaleString(document.documentElement.lang === 'en' ? 'en-US' : 'zh-CN');
}

budgetInputs.forEach((input) => input.addEventListener('change', updateBudget));
updateBudget();

const discussionTextZh = `海南 7 天东线计划｜想一起确认的 5 件事
1. 8 月 15 日长沙—海口、8 月 21 日三亚—长沙买哪班，含行李和退改总价多少？
2. 海口取、三亚还的异地还车费是否能接受？
3. 自由潜是否只保留为 D6 可选体验，AIDA2 拆到东莞单独学习？
4. 摩托只在万宁合法路段租 1 天是否足够？
5. 住宿更重视融旅权益和度假感，还是位置、停车与可退？

计划网址：https://lijinzh.github.io/travel-planner/plans/hainan/`;

const discussionTextEn = `Hainan 7-Day East Coast Plan | Five decisions
1. Which August 15 Changsha–Haikou and August 21 Sanya–Changsha flights offer the best total including baggage and change rules?
2. Is the Haikou pickup / Sanya return surcharge acceptable?
3. Should freediving remain an optional D6 experience, with AIDA2 studied separately in Dongguan?
4. Is one legal local motorcycle day around Wanning enough?
5. Should accommodation prioritise resort atmosphere and benefits, or location, parking, and cancellation?

Plan: https://lijinzh.github.io/travel-planner/plans/hainan/en/`;

const isEnglish = document.documentElement.lang === 'en';

const dongguanDiscussionZh = `东莞自由潜旅行｜询价与确认清单
1. 8 月 18 日能否开课，抖音看到的 3200 元是否最终总价？
2. 课程体系、教练编号、保险、师生比，以及场馆、装备、证书和补课包含什么？
3. 8 月 16 日长沙到深圳、西涌住宿与接驳怎样最顺？
4. 拟骑摩托的具体道路是否得到东莞交警与租车方书面确认？
5. 8 月 17 日西涌初学课的海况、保险与天气退改是什么？

计划网址：https://lijinzh.github.io/travel-planner/plans/dongguan/`;

const dongguanDiscussionEn = `Dongguan Freediving Trip | Enquiry list
1. Can the course start on 18 August, and is the ¥3,200 Douyin offer the final total?
2. What system, instructor number, insurance, ratio, entry, equipment, certification and make-up sessions are included?
3. Which 16 August Changsha–Shenzhen train, Xichong stay and transfer work best?
4. Has the exact motorcycle route been confirmed in writing by traffic police and the rental provider?
5. What are the 17 August Xichong beginner conditions, insurance and weather cancellation terms?

Plan: https://lijinzh.github.io/travel-planner/plans/dongguan/en/`;

document.querySelector('[data-copy-discussion]')?.addEventListener('click', async () => {
  const feedback = document.querySelector('[data-copy-feedback]');
  try {
    const copyText = planSlug === 'dongguan'
      ? (isEnglish ? dongguanDiscussionEn : dongguanDiscussionZh)
      : (isEnglish ? discussionTextEn : discussionTextZh);
    await navigator.clipboard.writeText(copyText);
    if (feedback) feedback.textContent = isEnglish ? 'Enquiry list copied.' : '询价清单已复制。';
  } catch {
    if (feedback) feedback.textContent = isEnglish ? 'Automatic copying is unavailable. Please copy the enquiry list manually.' : '浏览器没有允许自动复制，请手动复制询价清单。';
  }
});
