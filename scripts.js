document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM полностью загружен");
    
    // Основные элементы DOM
    const searchInput = document.getElementById('search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolsContainer = document.getElementById('toolsContainer');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');
    const header = document.querySelector('.header');
    const loader = document.getElementById('loader');
    const top10Link = document.getElementById('top10-link');
    const aboutLink = document.getElementById('about-link');
    const searchButton = document.getElementById('search-button');
    

    
    // Данные инструментов
    let toolsData = [];
    
    // Создание элемента для уведомлений о копировании
    const copyFeedback = document.createElement('div');
    copyFeedback.className = 'copy-feedback';
    document.body.appendChild(copyFeedback);
    
    // Эффект при скролле для шапки
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    
    
    /**
     * Загружает данные инструментов из JSON-файла
     */
    async function loadTools() {
        try {
            // Показать лоадер
            loader.style.display = 'flex';
            toolsContainer.innerHTML = '';
            
            const response = await fetch('./tools.json');
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            
            const jsonData = await response.json();
            
            // Загружаем предложенные инструменты из localStorage
            const suggestedTools = JSON.parse(localStorage.getItem('suggestedTools')) || [];
            
            // Объединяем инструменты, убирая дубликаты по ID
            toolsData = [...suggestedTools, ...jsonData].filter((tool, index, self) =>
                index === self.findIndex(t => t.id === tool.id)
            );
            
            console.log('Инструменты загружены:', toolsData.length);
            renderTools(toolsData);
        } catch (error) {
            console.error('Ошибка при загрузке инструментов:', error);
            toolsContainer.innerHTML = '<p class="error">Не удалось загрузить инструменты. Пожалуйста, попробуйте позже.</p>';
        } finally {
            // Скрыть лоадер
            loader.style.display = 'none';
        }
    }
    
    /**
     * Отображает инструменты в контейнере
     * @param {Array} tools - Массив инструментов для отображения
     */
    function renderTools(tools) {
        // Очищаем контейнер перед добавлением новых элементов
        toolsContainer.innerHTML = '';
        
        if (tools.length === 0) {
            toolsContainer.innerHTML = '<p class="no-results">По вашему запросу ничего не найдено</p>';
            return;
        }
        
        // Для каждого инструмента создаем карточку
        tools.forEach(tool => {
            const toolElement = document.createElement('div');
            toolElement.className = 'tool';
            toolElement.dataset.category = tool.category;
            toolElement.dataset.available = tool.available;
            toolElement.dataset.rating = tool.rating;
            
            // Генерация HTML для карточки инструмента
            toolElement.innerHTML = `
                ${tool.suggested ? '<span class="suggested-badge">Предложено</span>' : ''}
                ${tool.popular ? '<span class="popular-badge">Популярное</span>' : ''}
                <h2>${tool.title}</h2>
                <p>${tool.description}</p>
                <div class="tool-meta">
                    <span class="availability ${tool.available === 'yes' ? 'available' : 'unavailable'}">
                        ${tool.available === 'yes' ? 'Доступен в РФ' : 'Требуется VPN'}
                    </span>
                    <span class="rating">${generateRatingStars(tool.rating)}</span>
                </div>
                <div class="tool-actions">
                    <a href="${tool.link}" target="_blank" class="btn-primary">Открыть</a>
                    <button class="btn-secondary copy-link" data-link="${tool.link}">Копировать ссылку</button>
                    <button class="btn-more" data-id="${tool.id}">Подробнее</button>
                </div>
                <div class="tool-details">
                    <h3>${tool.title}</h3>
                    <ul>
                        ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                    <p><strong>Бесплатные функции:</strong> ${tool.freeFeatures}</p>
                    <p><strong>Платные функции:</strong> ${tool.paidFeatures || 'Нет'}</p>
                </div>
            `;
            
            toolsContainer.appendChild(toolElement);
        });
        
        // Привязываем обработчики событий после рендеринга
        attachEventHandlers();
    }
    
    /**
     * Генерирует HTML для отображения рейтинга звездочками
     * @param {number} rating - Рейтинг от 0 до 5
     * @returns {string} HTML-строка с звездочками
     */
    function generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;
        
        return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(emptyStars);
    }
    
    /**
     * Привязывает обработчики событий к элементам интерфейса
     */
    function attachEventHandlers() {
        // Обработчики для кнопок копирования ссылки
        document.querySelectorAll('.copy-link').forEach(button => {
            button.addEventListener('click', function() {
                const link = this.dataset.link;
                copyToClipboard(link);
            });
        });
        
        // Обработчики для кнопок "Подробнее"
        document.querySelectorAll('.btn-more').forEach(button => {
            button.addEventListener('click', function() {
                const toolId = parseInt(this.dataset.id);
                showToolDetails(toolId);
            });
        });
    }
    
    /**
     * Копирует текст в буфер обмена
     * @param {string} text - Текст для копирования
     */
    function copyToClipboard(text) {
        if (!navigator.clipboard) {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            
            try {
                document.execCommand('copy');
                showCopyFeedback('Ссылка скопирована!', '#28a745');
            } catch (err) {
                showCopyFeedback('Ошибка копирования', '#dc3545');
                console.error('Fallback: Ошибка при копировании: ', err);
            }
            
            document.body.removeChild(textArea);
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            showCopyFeedback('Ссылка скопирована!', '#28a745');
        }).catch(err => {
            showCopyFeedback('Ошибка копирования', '#dc3545');
            console.error('Ошибка при копировании: ', err);
        });
    }
    
    /**
     * Показывает детальную информацию об инструменте в модальном окне
     * @param {number} toolId - ID инструмента
     */
    function showToolDetails(toolId) {
    const tool = toolsData.find(t => t.id === toolId);
    if (!tool) return;
    
    modalContent.innerHTML = `
        <h2>${tool.title}</h2>
        ${tool.suggested ? '<p class="suggested-notice">Этот инструмент был предложен пользователем</p>' : ''}
        <p class="modal-description">${tool.description}</p>
        <div class="tool-meta">
            <span class="availability ${tool.available === 'yes' ? 'available' : 'unavailable'}">
                ${tool.available === 'yes' ? 'Доступен в РФ' : 'Требуется VPN'}
            </span>
            <span class="rating">${generateRatingStars(tool.rating)}</span>
        </div>
        <ul>
            ${tool.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        <p><strong>Бесплатные функции:</strong> ${tool.freeFeatures}</p>
        <p><strong>Платные функции:</strong> ${tool.paidFeatures || 'Нет'}</p>
        <div class="tool-actions">
            <a href="${tool.link}" target="_blank" class="btn-primary">Открыть инструмент</a>
        </div>
    `;
    
    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Добавляем обработчик для экспорта
    document.getElementById('exportSingleTool').addEventListener('click', () => {
        exportSingleToolToJson(tool);
    });
}
    /**
     * Фильтрует инструменты по поисковому запросу, категории и доступности
     */
    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';
        const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
        
        const filteredTools = toolsData.filter(tool => {
            // Проверка соответствия поисковому запросу
            const matchesSearch = 
                tool.title.toLowerCase().includes(searchTerm) || 
                tool.description.toLowerCase().includes(searchTerm);
            
            // Проверка соответствия категории
            const matchesCategory = 
                activeCategory === 'all' || 
                tool.category === activeCategory;
            
            // Проверка соответствия фильтру доступности
            let matchesFilter = true;
            if (activeFilter === 'available') {
                matchesFilter = tool.available === 'yes';
            } else if (activeFilter === 'vpn') {
                matchesFilter = tool.available === 'no';
            }
            
            return matchesSearch && matchesCategory && matchesFilter;
        });
        
        renderTools(filteredTools);
    }
    
    /**
     * Показывает уведомление о копировании
     * @param {string} message - Текст сообщения
     * @param {string} color - Цвет фона
     */
    function showCopyFeedback(message, color) {
        copyFeedback.textContent = message;
        copyFeedback.style.backgroundColor = color;
        copyFeedback.style.display = 'block';
        
        setTimeout(() => {
            copyFeedback.style.opacity = '0';
            setTimeout(() => {
                copyFeedback.style.display = 'none';
                copyFeedback.style.opacity = '1';
            }, 300);
        }, 2000);
    }
    
    /**
     * Закрывает модальное окно
     */
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
   

    
    
    // Инициализация обработчиков событий
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTools();
        });
    });
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterTools();
        });
    });
    
    searchInput.addEventListener('input', filterTools);
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) closeModal();
    });

   

    
    // Функция для показа сообщения "В разработке"
    function showDevelopmentMessage() {
        alert("В разработке! Эта функция появится в следующих обновлениях");
    }
    
    // Обработчик кликов
    top10Link.addEventListener('click', function(e) {
        e.preventDefault();
        showDevelopmentMessage();
    });

    aboutLink.addEventListener('click', function(e) {
        e.preventDefault();
        showDevelopmentMessage();
    });

    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        showDevelopmentMessage();
    });
    
    // Загрузка инструментов при старте
    loadTools();
});