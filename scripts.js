// State & Config
let toolsData = [];
let currentSearch = '';
let currentCategory = 'all';
let fuseInstance = null;

// 1. Тема
function initTheme() {
  const html = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  if (!themeBtn) return;
  
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = saved === 'dark' || (!saved && prefersDark);
  
  html.classList.toggle('dark', isDark);
  themeBtn.textContent = isDark ? '☀️' : '🌙';
  
  themeBtn.addEventListener('click', () => {
    const newDark = !html.classList.contains('dark');
    html.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    themeBtn.textContent = newDark ? '☀️' : '🌙';
  });
}

// 2. Нормализация данных (убирает пробелы в ключах JSON)
function normalizeData(rawData) {
  return rawData.map(obj => {
    const clean = {};
    for (const [k, v] of Object.entries(obj)) {
      clean[k.trim()] = v;
    }
    return clean;
  });
}

// 3. Инициализация Fuse.js
function initFuse() {
  fuseInstance = new Fuse(toolsData, {
    keys: [
      { name: 'title', weight: 0.35 },
      { name: 'shortDescription', weight: 0.25 },
      { name: 'description', weight: 0.15 },
      { name: 'useCases', weight: 0.1 },
      { name: 'hashtags', weight: 0.1 },
      { name: 'searchTags', weight: 0.05 }
    ],
    threshold: 0.35,
    ignoreLocation: true
  });
}

// 4. Получение URL логотипа (гибридный подход)
function getLogoUrl(tool) {
  if (tool.logo && tool.logo.trim()) return `/tools/logos/${tool.logo.trim()}`;
  try {
    const url = new URL(tool.link);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch {
    return null;
  }
}

// 5. Фильтрация хештегов: убираем "Доступно в РФ" и дубли
function getFilteredHashtags(hashtags) {
  return [...new Set(
    (hashtags || [])
      .map(h => h.trim())
      .filter(Boolean)
      .filter(h => !h.includes('Доступно_в_РФ') && !h.includes('🇷'))
  )];
}

// 6. Рендер карточки (только стандартный вид)
function renderCard(tool, index) {
  const logoUrl = getLogoUrl(tool);
  const delay = index * 0.05;
  
  // 🔥 Популярное
  const popularHtml = tool.popular
    ? `<div class="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full shadow-lg z-10 text-sm" title="Популярное">🔥</div>`
    : '';

  // 🛠️ Логотип
  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${escapeHtml(tool.title)}" class="w-10 h-10 object-contain rounded-xl transition-transform duration-300 hover:scale-110" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <span class="tool-emoji text-2xl hidden">🛠️</span>`
    : `<span class="tool-emoji text-2xl">🛠️</span>`;

  // 🏷️ Хештеги
  const filteredTags = getFilteredHashtags(tool.hashtags);
  const hashtagsHtml = filteredTags.length
    ? `<div class="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
        ${filteredTags.slice(0, 4).map(t => `<span class="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition" data-tag="${t}">${t}</span>`).join('')}
       </div>`
    : '';

  // Кнопка "Перейти"
  const actionHtml = `<a href="${tool.link}" target="_blank" class="group flex items-center gap-2 w-fit px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5">
  Перейти к инструменту
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"><line x1="7" y1="17" x2="19" y2="7"></line><polyline points="7 7 19 7 19 17"></polyline></svg>
</a>`;

  return `
    <div class="tool-card card-enter bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 flex flex-col relative h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer" style="animation-delay:${delay}s" data-tool-id="${tool.id}">
      ${popularHtml}
      <div class="flex items-center gap-3 mb-3">
        ${logoHtml}
        <h3 class="font-display font-bold text-lg leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 pr-2">
          <a href="${tool.link}" target="_blank" class="hover:text-blue-600 dark:hover:text-cyan-400 transition">${escapeHtml(tool.title)}</a>
        </h3>
      </div>
      <p class="text-base text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed mb-2">${escapeHtml(tool.shortDescription || tool.description)}</p>
      <button class="details-trigger self-start text-sm text-blue-600 dark:text-cyan-400 font-medium hover:underline mb-3 transition" data-id="${tool.id}">Подробнее →</button>
      ${hashtagsHtml}
      <div class="mt-auto pt-4">${actionHtml}</div>
    </div>`;
}

// 7. Рендер карточек инструментов
function renderTools(tools) {
  const gridView = document.getElementById('gridView');
  const loadingState = document.getElementById('loadingState');
  
  if (loadingState) loadingState.classList.add('hidden');
  if (gridView) gridView.classList.remove('hidden');
  
  if (tools.length === 0) {
    gridView.innerHTML = `<div class="col-span-full text-center py-10 text-gray-500 text-lg">😕 Ничего не найдено. Попробуйте изменить запрос.</div>`;
    return;
  }
  
  gridView.innerHTML = tools.map((t, i) => renderCard(t, i)).join('');
}

// 8. Фильтрация и рендер с учётом категории и поиска
function applyFilters() {
  let filtered = toolsData;

  // Фильтр по категории
  if (currentCategory !== 'all') {
    filtered = filtered.filter(tool => tool.category === currentCategory);
  }

  // Фильтр по поисковому запросу
  if (currentSearch) {
    filtered = fuseInstance.search(currentSearch).map(r => r.item);
  }

  renderTools(filtered);
}

// 9. Обновление активной категории
function setActiveCategory(category) {
  currentCategory = category;
  
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === category);
  });
  
  applyFilters();
}

// 10. Поиск (обновляет запрос и применяет фильтры)
function performSearch(query) {
  currentSearch = query.toLowerCase().trim();
  applyFilters();
}

// 11. Загрузка данных
async function loadTools() {
  try {
    const res = await fetch('./tools.json');
    if (!res.ok) throw new Error('Network');
    const rawData = await res.json();
    toolsData = normalizeData(rawData);
    initFuse();
    setActiveCategory('all');
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    document.getElementById('gridView').innerHTML = `<div class="col-span-full text-center py-10 text-red-500 text-lg">⚠️ Ошибка загрузки данных. Проверьте файл tools.json и консоль браузера.</div>`;
  }
}

// 12. Модалка
function showToolDetails(toolId) {
  const tool = toolsData.find(t => t.id === toolId);
  if (!tool) return;
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  const logoUrl = getLogoUrl(tool);

  const logoHtml = logoUrl
    ? `<img src="${logoUrl}" alt="${escapeHtml(tool.title)}" class="w-14 h-14 object-contain rounded-xl transition-transform duration-300 hover:scale-110" onerror="this.onerror=null; this.style.display='none'; this.nextElementSibling.style.display='flex';">
       <span class="tool-emoji text-3xl hidden">🛠️</span>`
    : `<span class="tool-emoji text-3xl">🛠️</span>`;

  const filteredTags = getFilteredHashtags(tool.hashtags);
  const hashtagsHtml = filteredTags.length
    ? `<div class="mt-4"><strong class="text-sm">🏷️ Теги:</strong><div class="flex flex-wrap gap-2 mt-2">${filteredTags.map(t => `<span class="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition" data-tag="${t}">${t}</span>`).join('')}</div></div>`
    : '';

  const useCasesHtml = tool.useCases?.length
    ? `<div class="mt-4"><strong class="text-sm">💡 Для каких задач:</strong><ul class="list-disc pl-5 mt-2 text-base space-y-1">${tool.useCases.map(u => `<li>${escapeHtml(u)}</li>`).join('')}</ul></div>`
    : '';

  content.innerHTML = `
    <div class="flex items-start gap-4 mb-4">
      ${logoHtml}
      <h2 class="font-display text-2xl font-bold leading-tight pt-1">${escapeHtml(tool.title)}</h2>
    </div>
    <p class="text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">${escapeHtml(tool.description || tool.shortDescription)}</p>
    ${hashtagsHtml} ${useCasesHtml}
    <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
      <a href="${tool.link}" target="_blank" class="block w-full text-center bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-gray-900 font-semibold py-3 px-4 rounded-xl text-base transition shadow-sm">Открыть сервис</a>
    </div>`;
  
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.getElementById('modalContent').innerHTML = '';
}

// 13. Утилиты
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}

function debounce(func, delay) {
  let timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func.apply(this, args), delay); };
}

// 14. Инициализация & События
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadTools();

  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', debounce((e) => performSearch(e.target.value), 200));

  // Обработчики категорий
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      setActiveCategory(btn.dataset.cat);
    });
  });

  // Клик по карточке (делегирование)
  document.getElementById('resultsArea').addEventListener('click', (e) => {
    const card = e.target.closest('.tool-card');
    if (!card) return;
    if (e.target.closest('a') || e.target.closest('[data-tag]')) return;
    const toolId = parseInt(card.dataset.toolId);
    if (toolId) showToolDetails(toolId);
  });

  // Модалка
  document.querySelector('.modal-close')?.addEventListener('click', closeModal);
  document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

  // Клик по хештегам
  document.addEventListener('click', (e) => {
    if (e.target.dataset.tag) {
      const tag = e.target.dataset.tag;
      searchInput.value = tag;
      performSearch(tag);
      e.target.blur();
    }
  });
});