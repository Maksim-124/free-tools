// State
let toolsData = [];
let currentCategory = 'all';
let currentSearch = '';

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
const toolsGrid = document.getElementById('toolsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilters = document.getElementById('categoryFilters');
const loader = document.getElementById('loader');
const stats = document.getElementById('stats');
const modal = document.getElementById('modal');
const themeToggle = document.getElementById('themeToggle');

// Load tools from JSON
async function loadTools() {
    showLoader(true);
    try {
        const response = await fetch('./tools.json');
        if (!response.ok) throw new Error('Network error');
        toolsData = await response.json();
        
        renderCategories();
        filterAndRender();
    } catch (error) {
        console.error('Load error:', error);
        toolsGrid.innerHTML = '<div class="empty-state">⚠️ Ошибка загрузки данных. Попробуйте позже.</div>';
        stats.textContent = '❌ Ошибка загрузки';
    } finally {
        showLoader(false);
    }
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
        <button class="category-chip ${currentCategory === 'all' ? 'active' : ''}" data-category="all">📋 Все</button>
        ${categories.map(cat => `
            <button class="category-chip ${currentCategory === cat ? 'active' : ''}" data-category="${cat}">
                ${categoryEmoji[cat] || '📌'} ${categoryMap[cat] || cat}
            </button>
        `).join('')}
    `;
    categoryFilters.innerHTML = buttonsHtml;
    
    // Attach event listeners
    document.querySelectorAll('.category-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            currentSearch = '';
            searchInput.value = '';
            filterAndRender();
            
            // Update active state
            document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Filter tools (улучшенный поиск по заголовку, описанию, хештегам и useCases)
function getFilteredTools() {
    if (!currentSearch.trim()) {
        return toolsData.filter(tool => {
            const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
            return matchesCategory;
        });
    }
    
    const searchLower = currentSearch.toLowerCase();
    
    return toolsData.filter(tool => {
        const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
        
        // Поиск по названию
        const titleMatch = tool.title.toLowerCase().includes(searchLower);
        
        // Поиск по описанию
        const descMatch = tool.shortDescription && tool.shortDescription.toLowerCase().includes(searchLower);
        
        // Поиск по хештегам
        const hashtagsMatch = tool.hashtags && tool.hashtags.some(tag => 
            tag.toLowerCase().includes(searchLower)
        );
        
        // Поиск по useCases (проблемы/задачи пользователя)
        const useCasesMatch = tool.useCases && tool.useCases.some(useCase => 
            useCase.toLowerCase().includes(searchLower)
        );
        
        return matchesCategory && (titleMatch || descMatch || hashtagsMatch || useCasesMatch);
    });
}

// Render tools grid (с хештегами вместо рейтинга)
function renderTools(tools) {
    if (tools.length === 0) {
        toolsGrid.innerHTML = '<div class="empty-state">😕 Ничего не найдено. Попробуйте изменить поиск.</div>';
        stats.textContent = `📭 Найдено: 0 инструментов`;
        return;
    }
    
    const toolsHtml = tools.map((tool, index) => {
        const popularBadge = tool.popular ? '<span class="badge-popular">🔥 Популярное</span>' : '';
        
        // Генерируем хештеги, если они есть
        let hashtagsHtml = '';
        if (tool.hashtags && tool.hashtags.length > 0) {
            // Показываем не больше 3 хештегов в карточке
            const displayHashtags = tool.hashtags.slice(0, 3);
            hashtagsHtml = `
                <div class="hashtags">
                    ${displayHashtags.map(tag => `<span class="hashtag" data-hashtag="${tag}">${tag}</span>`).join('')}
                </div>
            `;
        }
        
        return `
        <div class="tool-card" data-tool-id="${tool.id}" style="animation-delay: ${index * 0.03}s">
            ${popularBadge}
            <h3 class="tool-title">${escapeHtml(tool.title)}</h3>
            <p class="tool-description">${escapeHtml(tool.shortDescription || tool.description)}</p>
            ${hashtagsHtml}
            <div class="tool-meta">
                ${tool.available === 'yes' ? '<span class="availability">🇷🇺 Доступно в РФ</span>' : ''}
            </div>
            <div class="tool-actions">
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Открыть →</a>
                <button class="btn btn-secondary details-btn" data-id="${tool.id}">Подробнее</button>
            </div>
        </div>
    `}).join('');
    
    toolsGrid.innerHTML = toolsHtml;
    stats.textContent = `📊 Найдено: ${tools.length} из ${toolsData.length} инструментов`;
    
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
                filterAndRender();
            }
        });
    });
}

// Show tool details (обновлённая модалка с хештегами и useCases)
function showToolDetails(toolId) {
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    const modalContent = document.getElementById('modalContent');
    
    // Генерируем все хештеги для модалки
    let hashtagsModalHtml = '';
    if (tool.hashtags && tool.hashtags.length > 0) {
        hashtagsModalHtml = `
            <div style="margin: 16px 0;">
                <strong>🏷️ Хештеги:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                    ${tool.hashtags.map(tag => `<span class="modal-hashtag" data-hashtag="${tag}">${tag}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Генерируем useCases, если есть
    let useCasesHtml = '';
    if (tool.useCases && tool.useCases.length > 0) {
        useCasesHtml = `
            <div style="margin: 16px 0;">
                <strong>💡 Для каких задач:</strong>
                <ul style="margin-top: 8px;">
                    ${tool.useCases.map(useCase => `<li>${escapeHtml(useCase)}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    modalContent.innerHTML = `
        <h2>${escapeHtml(tool.title)}</h2>
        <p style="margin-bottom: 16px;">${escapeHtml(tool.shortDescription || tool.description)}</p>
        ${hashtagsModalHtml}
        ${useCasesHtml}
        ${tool.features ? `<h3>✨ Возможности:</h3><ul>${tool.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
        <p><strong>🎁 Бесплатно:</strong> ${escapeHtml(tool.freeFeatures || 'Полный функционал')}</p>
        ${tool.paidFeatures ? `<p><strong>💎 Платно:</strong> ${escapeHtml(tool.paidFeatures)}</p>` : ''}
        <div style="margin-top: 24px;">
            <a href="${tool.link}" target="_blank" class="btn btn-primary" style="display: inline-block;">Перейти к сервису →</a>
        </div>
    `;
    
    modal.classList.add('active');
    
    // Обработчики для кликабельных хештегов в модалке
    document.querySelectorAll('.modal-hashtag').forEach(tag => {
        tag.addEventListener('click', () => {
            const hashtag = tag.dataset.hashtag;
            if (hashtag) {
                closeModal();
                searchInput.value = hashtag;
                currentSearch = hashtag.toLowerCase();
                filterAndRender();
            }
        });
    });
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Filter and render
function filterAndRender() {
    const filtered = getFilteredTools();
    renderTools(filtered);
}

// Show/hide loader
function showLoader(show) {
    loader.style.display = show ? 'flex' : 'none';
}

// Close modal
function closeModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        if (!modal.classList.contains('active')) {
            document.getElementById('modalContent').innerHTML = '';
        }
    }, 300);
}

// Debounce
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Theme handling (исправленная версия)
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let theme = savedTheme;
    if (!theme) {
        theme = systemPrefersDark ? 'dark' : 'light';
    }
    
    document.body.classList.add(theme);
    
    if (themeToggle) {
        // Удаляем старые обработчики, клонируя элемент
        const newToggle = themeToggle.cloneNode(true);
        themeToggle.parentNode.replaceChild(newToggle, themeToggle);
        
        newToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark');
            if (isDark) {
                document.body.classList.remove('dark');
                document.body.classList.add('light');
                localStorage.setItem('theme', 'light');
            } else {
                document.body.classList.remove('light');
                document.body.classList.add('dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
}

// Event listeners
function initEventListeners() {
    searchInput.addEventListener('input', debounce((e) => {
        currentSearch = e.target.value.toLowerCase();
        filterAndRender();
    }, 300));
    
    const modalCloseBtn = document.querySelector('.modal-close');
    const modalOverlay = document.querySelector('.modal-overlay');
    
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
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