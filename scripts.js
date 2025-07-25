document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM полностью загружен");
    
    // Основные элементы DOM (только те, что не в компонентах)
    const searchInput = document.getElementById('search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const toolsContainer = document.getElementById('toolsContainer');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');
    const loader = document.getElementById('loader');
    
    // Данные инструментов
    let toolsData = [];
    
    // Создание элемента для уведомлений о копировании
    const copyFeedback = document.createElement('div');
    copyFeedback.className = 'copy-feedback';
    document.body.appendChild(copyFeedback);
    
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
            
            // Для инструментов со статьей создаем специальную карточку
            if (tool.hasArticle) {
                toolElement.innerHTML = `
                    ${tool.popular ? '<span class="popular-badge">Популярное</span>' : ''}
                    <h2>${tool.title}</h2>
                    <p>${tool.description}</p>
                    <div class="tool-meta">
                        <span class="availability ${tool.available === 'yes' ? 'available' : 'unavailable'}">
                            ${tool.available === 'yes' ? 'Доступен в РФ' : 'Требуется VPN'}
                        </span>
                        <span class="rating">${generateRatingStars(tool.rating)}</span>
                    </div>
                <div class="tool-actions-container">
                        <div class="tool-actions">
                            <a href="${tool.link}" target="_blank" class="btn-primary">Перейти на сайт</a>
                            <a href="${tool.articleLink}" class="btn-more">Подробнее</a>
                        </div>
                        <div class="tool-actions-shared">
                            <button class="btn-icon share-btn" data-link="${tool.articleLink}" data-title="${tool.title}" title="Поделиться">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L7.0824 9.84057C6.54303 9.32015 5.80879 9 5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15C5.80879 15 6.54303 14.6798 7.0824 14.1594L15.0227 18.6294C15.0077 18.7508 15 18.8745 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C17.1912 16 16.457 16.3202 15.9176 16.8406L7.97733 12.3706C7.99229 12.2492 8 12.1255 8 12C8 11.8745 7.99229 11.7508 7.97733 11.6294L15.9176 7.15938C16.457 7.67985 17.1912 8 18 8Z" fill="currentColor"/><path d="M18 8H16V4C16 2.89543 15.1046 2 14 2H10C8.89543 2 8 2.89543
                                </svg>
                            </button>
                        </div>
                </div>
                `;
                
                // Вешаем обработчик на всю карточку для перехода к статье
                toolElement.addEventListener('click', (e) => {
                    // Проверяем, что клик был не по кнопке
                    if (!e.target.closest('.tool-actions')) {
                        window.location.href = tool.articleLink;
                    }
                });
            } 
            // Стандартная карточка для инструментов без статьи
            else {
                toolElement.innerHTML = `
                    ${tool.popular ? '<span class="popular-badge">Популярное</span>' : ''}
                    ${tool.suggested ? '<span class="suggested-badge">Предложено</span>' : ''}
                    <h2>${tool.title}</h2>
                    <p>${tool.description}</p>
                    <div class="tool-meta">
                        <span class="availability ${tool.available === 'yes' ? 'available' : 'unavailable'}">
                            ${tool.available === 'yes' ? 'Доступен в РФ' : 'Требуется VPN'}
                        </span>
                        <span class="rating">${generateRatingStars(tool.rating)}</span>
                    </div>
                <div class="tool-actions-container">
                    <div class="tool-actions">
                        <a href="${tool.link}" target="_blank" class="btn-primary">Перейти на сайт</a>
                        <button class="btn-more" data-id="${tool.id}">Подробнее</button>
                    </div>
                        <div class="tool-actions-shared">
                            <button class="btn-icon share-btn" data-link="${tool.articleLink}" data-title="${tool.title}" title="Поделиться">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L7.0824 9.84057C6.54303 9.32015 5.80879 9 5 9C3.34315 9 2 10.3431 2 12C2 13.6569 3.34315 15 5 15C5.80879 15 6.54303 14.6798 7.0824 14.1594L15.0227 18.6294C15.0077 18.7508 15 18.8745 15 19C15 20.6569 16.3431 22 18 22C19.6569 22 21 20.6569 21 19C21 17.3431 19.6569 16 18 16C17.1912 16 16.457 16.3202 15.9176 16.8406L7.97733 12.3706C7.99229 12.2492 8 12.1255 8 12C8 11.8745 7.99229 11.7508 7.97733 11.6294L15.9176 7.15938C16.457 7.67985 17.1912 8 18 8Z" fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                </div>
                `;
            }
            
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
        // Обработчики для кнопок "Подробнее"
        document.querySelectorAll('.btn-more').forEach(button => {
            button.addEventListener('click', function() {
                const toolId = parseInt(this.dataset.id);
                showToolDetails(toolId);
            });
        });
        
        // Обработчик для кнопки "Поделиться"
        document.querySelectorAll('.share-btn').forEach(button => {
          button.addEventListener('click', function(e) {
            e.stopPropagation();
            const link = this.dataset.link;
            const title = this.dataset.title;

            // Проверка поддержки Web Share API
            if (navigator.share) {
                navigator.share({
                  title: title,
                  url: link
                }).catch(err => {
                    console.log('Ошибка при использовании Web Share API:', err);
                    copyToClipboard(link);
                });
            } else {
                copyToClipboard(link);
            }
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
        
        // Если у инструмента есть статья - перенаправляем на нее
        if (tool.hasArticle && tool.articleLink) {
            window.location.href = tool.articleLink;
            return;
        }
        
        // Иначе показываем модальное окно
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
                <a href="${tool.link}" target="_blank" class="btn-primary">Открыть</a>
            </div>
        `;
        
        modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
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
    
    // Загрузка инструментов при старте
    loadTools();
});