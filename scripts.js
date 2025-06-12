document.addEventListener('DOMContentLoaded', () => {
  class ToolAggregator {
    constructor() {
      this.currentCategory = 'all';
      this.currentSearchTerm = '';
      this.init();
    }

    init() {
      try {
        this.cacheElements();
        this.setupEventListeners();
        this.filterTools();
        this.animateTools();
      } catch (error) {
        this.handleCriticalError(error);
      }
    }

    cacheElements() {
      this.elements = {
        toolsContainer: document.querySelector('.tools-container'),
        categoryButtons: document.querySelector('.categories'),
        searchInput: document.getElementById('search'),
        toolItems: document.querySelectorAll('.tool')
      };

      // Валидация обязательных элементов
      ['toolsContainer', 'categoryButtons', 'searchInput'].forEach(key => {
        if (!this.elements[key]) {
          throw new Error(`Не найден обязательный элемент: ${key}`);
        }
      });
    }

    setupEventListeners() {
      // Обработчик категорий
      this.elements.categoryButtons.addEventListener('click', (e) => {
        const targetBtn = e.target.closest('.category-btn');
        if (!targetBtn) return;
        
        this.handleCategoryChange(targetBtn);
      });

      // Обработчик поиска
      this.elements.searchInput.addEventListener('input', (e) => {
        this.currentSearchTerm = e.target.value.trim().toLowerCase();
        this.filterTools();
      });

      // Копирование ссылок
      this.elements.toolsContainer.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-link');
        if (!copyBtn) return;
        
        this.handleCopyLink(copyBtn);
      });
    }

    handleCategoryChange(targetBtn) {
      // Обновляем активную кнопку
      document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.toggle('active', btn === targetBtn);
      });
      
      this.currentCategory = targetBtn.dataset.category || 'all';
      this.filterTools();
    }

    async handleCopyLink(copyBtn) {
      const linkElement = copyBtn.previousElementSibling;
      if (!linkElement?.href) {
        this.showFeedback(copyBtn, 'Ошибка!', '#F44336');
        return;
      }

      try {
        await navigator.clipboard.writeText(linkElement.href);
        this.showFeedback(copyBtn, '✓ Скопировано', '#4CAF50');
      } catch (err) {
        console.error('Ошибка копирования:', err);
        this.showFeedback(copyBtn, 'Ошибка!', '#F44336');
      }
    }

    filterTools() {
      this.elements.toolItems.forEach(tool => {
        try {
          const title = tool.querySelector('h3')?.textContent?.toLowerCase() || '';
          const matchesCategory = this.currentCategory === 'all' || 
                                tool.dataset.category === this.currentCategory;
          const matchesSearch = title.includes(this.currentSearchTerm);
          
          tool.style.display = matchesCategory && matchesSearch ? 'block' : 'none';
          tool.style.opacity = matchesCategory && matchesSearch ? '1' : '0.3';
        } catch (err) {
          console.error('Ошибка фильтрации инструмента:', tool, err);
        }
      });
    }

    animateTools() {
      if (this.elements.toolsContainer) {
        setTimeout(() => {
          this.elements.toolsContainer.style.opacity = '1';
          this.elements.toolsContainer.style.transform = 'translateY(0)';
        }, 100);
      }
    }

    showFeedback(element, text, color) {
      const originalText = element.textContent;
      element.textContent = text;
      element.style.backgroundColor = color;
      
      setTimeout(() => {
        element.textContent = originalText;
        element.style.backgroundColor = '';
      }, 2000);
    }

    handleCriticalError(error) {
      console.error('Критическая ошибка:', error);
      
      const errorHtml = `
        <div class="error-overlay">
          <div class="error-content">
            <h3>Произошла ошибка</h3>
            <p>${error.message}</p>
            <button onclick="location.reload()">Обновить страницу</button>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', errorHtml);
    }
  }

  // Инициализация приложения
  new ToolAggregator();
});