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
    'vpn': 'VPN',
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
    'vpn': '🔒',
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

// Render categories (горизонтальный скролл)
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
            filterAndRender();
            
            // Update active state
            document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Filter tools
function getFilteredTools() {
    return toolsData.filter(tool => {
        const matchesSearch = tool.title.toLowerCase().includes(currentSearch) ||
                             tool.description.toLowerCase().includes(currentSearch);
        const matchesCategory = currentCategory === 'all' || tool.category === currentCategory;
        return matchesSearch && matchesCategory;
    });
}

// Render tools grid
function renderTools(tools) {
    if (tools.length === 0) {
        toolsGrid.innerHTML = '<div class="empty-state">😕 Ничего не найдено. Попробуйте изменить поиск.</div>';
        stats.textContent = `📭 Найдено: 0 инструментов`;
        return;
    }
    
    const toolsHtml = tools.map(tool => {
        const popularBadge = tool.popular ? '<span class="badge-popular">🔥 Популярное</span>' : '';
        
        return `
        <div class="tool-card" data-tool-id="${tool.id}">
            ${popularBadge}
            <h3 class="tool-title">${escapeHtml(tool.title)}</h3>
            <p class="tool-description">${escapeHtml(tool.description)}</p>
            <div class="tool-meta">
                ${tool.available === 'yes' ? '<span class="availability">🇷🇺 Доступно в РФ</span>' : ''}
                <span class="rating">${generateStars(tool.rating)}</span>
            </div>
            <div class="tool-actions">
                <a href="${tool.link}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">Открыть</a>
                <button class="btn btn-secondary details-btn" data-id="${tool.id}">Подробнее</button>
            </div>
        </div>
    `}).join('');
    
    toolsGrid.innerHTML = toolsHtml;
    stats.textContent = `📊 Найдено: ${tools.length} из ${toolsData.length} инструментов`;
    
    document.querySelectorAll('.details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const toolId = parseInt(btn.dataset.id);
            showToolDetails(toolId);
        });
    });
}

// Show tool details
function showToolDetails(toolId) {
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    const modalContent = document.getElementById('modalContent');
    modalContent.innerHTML = `
        <h2>${escapeHtml(tool.title)}</h2>
        <p style="margin-bottom: 16px;">${escapeHtml(tool.description)}</p>
        <div style="margin-bottom: 16px;">
            <span class="rating">${generateStars(tool.rating)}</span>
        </div>
        ${tool.features ? `<h3>✨ Возможности:</h3><ul>${tool.features.map(f => `<li>${escapeHtml(f)}</li>`).join('')}</ul>` : ''}
        <p><strong>🎁 Бесплатно:</strong> ${escapeHtml(tool.freeFeatures || 'Полный функционал')}</p>
        ${tool.paidFeatures ? `<p><strong>💎 Платно:</strong> ${escapeHtml(tool.paidFeatures)}</p>` : ''}
        <div style="margin-top: 24px;">
            <a href="${tool.link}" target="_blank" class="btn btn-primary" style="display: inline-block;">Перейти к сервису →</a>
        </div>
    `;
    
    modal.classList.add('active');
}

// Generate stars
function generateStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + '½'.repeat(half) + '☆'.repeat(empty);
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
}

// Debounce
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// Theme handling
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.add(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
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
    
    document.querySelector('.modal-close')?.addEventListener('click', closeModal);
    document.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
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