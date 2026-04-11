// State
let toolsData = [];
let currentCategory = 'all';
let currentSearch = '';
let fuse = null; // Fuse.js instance для нечеткого поиска

// Маппинг категорий (англ -> русский)
const categoryMap = {
    'office': 'Офис',
    'design': 'Дизайн',
    'ai': 'AI',
    'development': 'Разработка',
    'conversion': 'Конвертеры',
    'marketing': 'Маркетинг',
    'storage': 'Хранилища',
    'other': 'Другое'
};

const categoryEmoji = {
    'office': '📄',
    'design': '🎨',
    'ai': '🤖',
    'development': '💻',
    'conversion': '🔄',
    'marketing': '📢',
    'storage': '☁️',
    'other': '📦'
};

// DOM elements
const toolsGrid = document.getElementById('tools-grid');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const categoryFilters = document.getElementById('category-filters');
const resultsCount = document.getElementById('results-count');
const sortSelect = document.getElementById('sort-select');
const noResults = document.getElementById('no-results');
const resetFiltersBtn = document.getElementById('reset-filters');
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

// Stats elements
const totalToolsEl = document.getElementById('total-tools');
const totalCategoriesEl = document.getElementById('total-categories');
const totalTagsEl = document.getElementById('total-tags');
const popularCountEl = document.getElementById('popular-count');

// Load tools from JSON
async function loadTools() {
    try {
        const response = await fetch('./tools.json');
        if (!response.ok) throw new Error('Network error');
        toolsData = await response.json();
        
        // Инициализируем Fuse.js для нечеткого поиска
        const fuseOptions = {
            includeScore: true,
            threshold: 0.4, // Чем меньше, тем строже поиск (0 = точное совпадение, 1 = любое)
            keys: [
                { name: 'title', weight: 3 },
                { name: 'shortDescription', weight: 2 },
                { name: 'description', weight: 2 },
                { name: 'hashtags', weight: 2 },
                { name: 'useCases', weight: 1 },
                { name: 'category', weight: 1 }
            ]
        };
        
        fuse = new Fuse(toolsData, fuseOptions);
        
        // Обновляем статистику
        updateStats();
        
        // Рендерим категории
        renderCategories();
        
        // Фильтруем и рендерим инструменты
        filterAndRender();
    } catch (error) {
        console.error('Load error:', error);
        toolsGrid.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-xl text-slate-500 dark:text-slate-400">⚠️ Ошибка загрузки данных. Попробуйте позже.</p></div>';
    }
}

// Update stats
function updateStats() {
    const totalTools = toolsData.length;
    const categories = new Set(toolsData.map(t => t.category));
    const allTags = toolsData.flatMap(t => t.hashtags || []);
    const uniqueTags = new Set(allTags);
    const popularCount = toolsData.filter(t => t.popular).length;
    
    // Анимация чисел
    animateNumber(totalToolsEl, totalTools);
    animateNumber(totalCategoriesEl, categories.size);
    animateNumber(totalTagsEl, uniqueTags.size);
    animateNumber(popularCountEl, popularCount);
}

// Animate number
function animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Get unique categories
function getUniqueCategories() {
    const categories = new Set(toolsData.map(t => t.category));
    return Array.from(categories).sort();
}

// Render categories
function renderCategories() {
    const categories = getUniqueCategories();
    const buttonsHtml = `
        <button class="filter-btn active px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md" data-category="all">
            Все
        </button>
        ${categories.map(cat => `
            <button class="filter-btn px-4 py-2 rounded-xl text-sm font-medium bg-white/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md transition-all" data-category="${cat}">
                ${categoryEmoji[cat] || '📌'} ${categoryMap[cat] || cat}
            </button>
        `).join('')}
    `;
    categoryFilters.innerHTML = buttonsHtml;
    
    // Attach event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            currentSearch = '';
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            filterAndRender();
            
            // Update active state
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-gradient-to-r', 'from-primary-500', 'to-accent-500', 'text-white', 'shadow-md');
                b.classList.add('bg-white/50', 'dark:bg-slate-700/50', 'text-slate-700', 'dark:text-slate-200');
            });
            btn.classList.remove('bg-white/50', 'dark:bg-slate-700/50', 'text-slate-700', 'dark:text-slate-200');
            btn.classList.add('active', 'bg-gradient-to-r', 'from-primary-500', 'to-accent-500', 'text-white', 'shadow-md');
        });
    });
}

// Filter tools with Fuse.js
function getFilteredTools() {
    let filtered = [];
    
    // Сначала фильтруем по категории
    if (currentCategory === 'all') {
        filtered = [...toolsData];
    } else {
        filtered = toolsData.filter(tool => tool.category === currentCategory);
    }
    
    // Если есть поисковый запрос, используем Fuse.js
    if (currentSearch.trim()) {
        const searchResults = fuse.search(currentSearch);
        // Получаем IDs результатов поиска
        const searchIds = new Set(searchResults.map(result => result.item.id));
        // Фильтруем по категории и поиску
        filtered = filtered.filter(tool => searchIds.has(tool.id));
    }
    
    return filtered;
}

// Sort tools
function sortTools(tools) {
    const sortValue = sortSelect.value;
    const sorted = [...tools];
    
    switch (sortValue) {
        case 'name-asc':
            sorted.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
            break;
        case 'name-desc':
            sorted.sort((a, b) => b.title.localeCompare(a.title, 'ru'));
            break;
        case 'popular':
            sorted.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
            break;
        default:
            // По умолчанию: популярные первыми, затем по алфавиту
            sorted.sort((a, b) => {
                if (a.popular && !b.popular) return -1;
                if (!a.popular && b.popular) return 1;
                return a.title.localeCompare(b.title, 'ru');
            });
    }
    
    return sorted;
}

// Render tools grid
function renderTools(tools) {
    const sortedTools = sortTools(tools);
    
    if (sortedTools.length === 0) {
        toolsGrid.innerHTML = '';
        noResults.classList.remove('hidden');
        resultsCount.textContent = '0';
        return;
    }
    
    noResults.classList.add('hidden');
    resultsCount.textContent = sortedTools.length;
    
    const toolsHtml = sortedTools.map((tool, index) => {
        const popularBadge = tool.popular ? '<span class="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full mb-3">🔥 Популярное</span>' : '';
        
        // Генерируем хештеги с разными цветами
        let hashtagsHtml = '';
        if (tool.hashtags && tool.hashtags.length > 0) {
            const displayHashtags = tool.hashtags.slice(0, 3);
            const hashtagColors = [
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
                'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
                'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
            ];
            hashtagsHtml = `
                <div class="flex flex-wrap gap-2 mt-3">
                    ${displayHashtags.map((tag, i) => `<span class="hashtag px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer hover:scale-105 transition-transform ${hashtagColors[i % 3]}" data-hashtag="${tag}">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        const availabilityBadge = tool.available === 'yes' ? '<span class="inline-flex items-center px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-md"><span class="mr-1">🇷🇺</span> Доступно в РФ</span>' : '';
        
        return `
            <div class="tool-card glass-card rounded-2xl p-6 relative group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1" data-tool-id="${tool.id}" style="transition-delay: ${index * 50}ms">
                ${popularBadge}
                <h3 class="text-xl font-bold mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="hover:underline">${escapeHtml(tool.title)}</a>
                </h3>
                <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">${escapeHtml(tool.shortDescription || tool.description)}</p>
                ${hashtagsHtml}
                <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    ${availabilityBadge}
                </div>
                <div class="mt-4 flex gap-3">
                    <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="flex-1 inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Открыть →</a>
                    <button class="details-btn px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-all" data-id="${tool.id}">Подробнее</button>
                </div>
            </div>
        `;
    }).join('');
    
    toolsGrid.innerHTML = toolsHtml;
    
    // Добавляем класс visible для анимации появления
    setTimeout(() => {
        document.querySelectorAll('.tool-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('visible');
            }, index * 50);
        });
    }, 10);
    
    // Обработчики для кнопок "Подробнее"
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const toolId = parseInt(btn.dataset.id);
            showToolDetails(toolId);
        });
    });
    
    // Обработчики для кликабельных хештегов
    document.querySelectorAll('.hashtag').forEach(tag => {
        tag.addEventListener('click', (e) => {
            e.stopPropagation();
            const hashtag = tag.dataset.hashtag;
            if (hashtag) {
                searchInput.value = hashtag;
                currentSearch = hashtag.toLowerCase();
                clearSearchBtn.classList.remove('hidden');
                filterAndRender();
                // Скролл к началу
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
}

// Show tool details (Tailwind CSS version)
function showToolDetails(toolId) {
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    // Создаем модалку если её нет
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300';
        modal.innerHTML = `
            <div class="modal-container scale-95 transition-transform duration-300 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div class="glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative">
                    <button class="modal-close absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                        <svg class="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    <div id="modalContent"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Обработчики закрытия
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    const modalContent = document.getElementById('modalContent');
    
    // Генерируем все хештеги для модалки
    let hashtagsModalHtml = '';
    if (tool.hashtags && tool.hashtags.length > 0) {
        const hashtagColors = [
            'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
            'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
        ];
        hashtagsModalHtml = `
            <div class="mt-6">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">🏷️ Хештеги:</h4>
                <div class="flex flex-wrap gap-2">
                    ${tool.hashtags.map((tag, i) => `<span class="hashtag px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer hover:scale-105 transition-transform ${hashtagColors[i % 3]} modal-hashtag" data-hashtag="${tag}">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Генерируем useCases, если есть
    let useCasesHtml = '';
    if (tool.useCases && tool.useCases.length > 0) {
        useCasesHtml = `
            <div class="mt-6">
                <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">💡 Для каких задач:</h4>
                <ul class="space-y-2">
                    ${tool.useCases.map(useCase => `<li class="flex items-start"><span class="text-primary-500 mr-2 mt-1">•</span><span class="text-slate-600 dark:text-slate-300">${escapeHtml(useCase)}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <div class="animate-fade-in">
            <h2 class="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">${escapeHtml(tool.title)}</h2>
            <p class="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">${escapeHtml(tool.shortDescription || tool.description)}</p>
            ${hashtagsModalHtml}
            ${useCasesHtml}
            ${tool.features ? `
                <div class="mt-6">
                    <h4 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">✨ Возможности:</h4>
                    <ul class="space-y-2">
                        ${tool.features.map(f => `<li class="flex items-start"><span class="text-accent-500 mr-2 mt-1">✓</span><span class="text-slate-600 dark:text-slate-300">${escapeHtml(f)}</span></li>`).join('')}
                    </ul>
                </div>
            ` : ''}
            <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                    <p class="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">🎁 Бесплатно:</p>
                    <p class="text-sm text-slate-600 dark:text-slate-300">${escapeHtml(tool.freeFeatures || 'Полный функционал')}</p>
                </div>
                ${tool.paidFeatures ? `
                    <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                        <p class="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-1">💎 Платно:</p>
                        <p class="text-sm text-slate-600 dark:text-slate-300">${escapeHtml(tool.paidFeatures)}</p>
                    </div>
                ` : ''}
            </div>
            <div class="mt-8">
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">Перейти к сервису →</a>
            </div>
        </div>
    `;
    
    modal.classList.remove('opacity-0', 'pointer-events-none');
    modal.querySelector('.modal-container').classList.remove('scale-95');
    modal.querySelector('.modal-container').classList.add('scale-100');
    
    // Обработчики для кликабельных хештегов в модалке
    document.querySelectorAll('.modal-hashtag').forEach(tag => {
        tag.addEventListener('click', () => {
            const hashtag = tag.dataset.hashtag;
            if (hashtag) {
                closeModal();
                searchInput.value = hashtag;
                currentSearch = hashtag.toLowerCase();
                clearSearchBtn.classList.remove('hidden');
                filterAndRender();
            }
        });
    });
}

// Close modal
function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.querySelector('.modal-container').classList.add('scale-95');
    modal.querySelector('.modal-container').classList.remove('scale-100');
    setTimeout(() => {
        if (modal.classList.contains('opacity-0')) {
            document.getElementById('modalContent').innerHTML = '';
        }
    }, 300);
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        if (m === '"') return '&quot;';
        return m;
    });
}

// Filter and render
function filterAndRender() {
    const filtered = getFilteredTools();
    renderTools(filtered);
}

// Debounce
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Theme handling (Tailwind CSS version)
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = savedTheme;
    if (!theme) {
        theme = systemPrefersDark ? 'dark' : 'light';
    }
    
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

// Mobile menu
function initMobileMenu() {
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Закрываем меню при клике на ссылку
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// Clear search button
function initClearSearch() {
    if (clearSearchBtn && searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchInput.value.trim()) {
                clearSearchBtn.classList.remove('hidden');
            } else {
                clearSearchBtn.classList.add('hidden');
            }
        });
        
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearch = '';
            clearSearchBtn.classList.add('hidden');
            filterAndRender();
            searchInput.focus();
        });
    }
}

// Reset filters button
function initResetFilters() {
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            currentCategory = 'all';
            currentSearch = '';
            searchInput.value = '';
            clearSearchBtn.classList.add('hidden');
            sortSelect.value = 'default';
            
            // Сбрасываем активный фильтр
            document.querySelectorAll('.filter-btn').forEach(b => {
                b.classList.remove('active', 'bg-gradient-to-r', 'from-primary-500', 'to-accent-500', 'text-white', 'shadow-md');
                b.classList.add('bg-white/50', 'dark:bg-slate-700/50', 'text-slate-700', 'dark:text-slate-200');
            });
            const allBtn = document.querySelector('.filter-btn[data-category="all"]');
            if (allBtn) {
                allBtn.classList.remove('bg-white/50', 'dark:bg-slate-700/50', 'text-slate-700', 'dark:text-slate-200');
                allBtn.classList.add('active', 'bg-gradient-to-r', 'from-primary-500', 'to-accent-500', 'text-white', 'shadow-md');
            }
            
            filterAndRender();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Sort select
function initSortSelect() {
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            filterAndRender();
        });
    }
}

// Event listeners
function initEventListeners() {
    // Поиск с debounce
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            currentSearch = e.target.value.toLowerCase();
            filterAndRender();
        }, 300));
    }
    
    initClearSearch();
    initResetFilters();
    initSortSelect();
    initMobileMenu();
    
    // Закрытие по ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('modal');
            if (modal && !modal.classList.contains('opacity-0')) {
                closeModal();
            }
        }
    });
}

// Initialize
function init() {
    initTheme();
    initEventListeners();
    loadTools();
}

// Start
init();