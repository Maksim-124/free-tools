// uiManager.js
window.UIManager = class UIManager {
    constructor() {
        // Элементы палитры и кода
        this.paletteGrid = document.getElementById('paletteGrid');
        this.codePanel = document.getElementById('codePanel');
        this.tabTailwindBtn = document.getElementById('tabTailwindBtn');
        this.tabCssBtn = document.getElementById('tabCssBtn');

        // НОВЫЕ элементы расширенного демо
        this.navLogo = document.getElementById('navLogo');
        this.navLink1 = document.getElementById('navLink1');
        this.demoNavBtn = document.getElementById('demoNavBtn');
        this.cardGradient = document.getElementById('cardGradient');
        this.cardTitle = document.getElementById('cardTitle');
        this.cardPrice = document.getElementById('cardPrice');
        this.cardButton = document.getElementById('cardButton');
        this.avatarBadge = document.getElementById('avatarBadge');
        this.tagPrimary = document.getElementById('tagPrimary');
        this.subscribeBlock = document.getElementById('subscribeBlock');
        this.subscribeBtn = document.getElementById('subscribeBtn');
        
        // Элементы лайка (добавлены в расширенное демо)
        this.likeHeartNew = document.getElementById('likeHeartNew');
        this.likeCountSpan = document.getElementById('likeCount');
        this.isLiked = false;
        this.likeCount = 0;
        
        // Состояние цветов
        this.hexPalette = [];
        this.currentPrimary = '#4f46e5';
        this.currentSecondary = '#06b6d4';
        this.currentAccent = '#f59e0b';
        this.currentText = '#1e1b4b';
        this.currentCodeMode = 'tailwind';
        this.currentTailwindCode = '';
        this.currentCssCode = '';
        
        // Привязка методов
        this.switchCodeTab = this.switchCodeTab.bind(this);
        this.updateUIAndCode = this.updateUIAndCode.bind(this);
        this.renderPalette = this.renderPalette.bind(this);
        
        // Вкладки
        this.tabTailwindBtn.addEventListener('click', () => this.switchCodeTab('tailwind'));
        this.tabCssBtn.addEventListener('click', () => this.switchCodeTab('css'));
        
        // Инициализация лайка
        this.initNewLikeButton();
    }
    
    // Инициализация кнопки лайка (сердечко в карточке отзыва)
    initNewLikeButton() {
        if (!this.likeHeartNew) return;
        this.likeHeartNew.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.isLiked) {
                this.isLiked = true;
                this.likeCount++;
                this.likeHeartNew.style.color = this.currentAccent;
                this.likeHeartNew.querySelector('path').setAttribute('fill', this.currentAccent);
                this.likeHeartNew.classList.add('liked');
                if (this.likeCountSpan) this.likeCountSpan.textContent = this.likeCount;
            } else {
                this.isLiked = false;
                this.likeCount--;
                this.likeHeartNew.style.color = '';
                this.likeHeartNew.querySelector('path').setAttribute('fill', 'none');
                this.likeHeartNew.classList.remove('liked');
                if (this.likeCountSpan) this.likeCountSpan.textContent = this.likeCount;
            }
            // Анимация
            this.likeHeartNew.style.transform = 'scale(1.2)';
            setTimeout(() => { if (this.likeHeartNew) this.likeHeartNew.style.transform = ''; }, 200);
        });
    }
    
    // Обновление всех UI-компонентов и генерация кода
    updateUIAndCode() {
        // Навигация
        if (this.navLogo) this.navLogo.style.backgroundColor = this.currentPrimary;
        if (this.navLink1) this.navLink1.style.color = this.currentPrimary;
        if (this.demoNavBtn) this.demoNavBtn.style.backgroundColor = this.currentAccent;
        
        // Карточка товара
        const grad = `linear-gradient(135deg, ${this.currentPrimary}, ${this.currentAccent})`;
        if (this.cardGradient) this.cardGradient.style.background = grad;
        if (this.cardTitle) this.cardTitle.style.color = this.currentText;
        if (this.cardPrice) this.cardPrice.style.color = this.currentPrimary;
        if (this.cardButton) this.cardButton.style.backgroundColor = this.currentPrimary;
        
        // Аватар / бейдж
        if (this.avatarBadge) this.avatarBadge.style.backgroundColor = this.currentPrimary;
        if (this.tagPrimary) {
            this.tagPrimary.style.backgroundColor = this.currentPrimary;
            this.tagPrimary.style.color = '#ffffff';
        }
        
        // Форма подписки
        if (this.subscribeBlock) {
            this.subscribeBlock.style.background = `linear-gradient(135deg, ${this.currentPrimary}, ${this.currentAccent})`;
        }
        if (this.subscribeBtn) {
            this.subscribeBtn.style.backgroundColor = '#ffffff';
            this.subscribeBtn.style.color = this.currentPrimary;
        }
        
        // Если лайк активен – обновить его цвет при смене акцента
        if (this.isLiked && this.likeHeartNew) {
            this.likeHeartNew.style.color = this.currentAccent;
            this.likeHeartNew.querySelector('path').setAttribute('fill', this.currentAccent);
        }
        
        // Генерация кода
        this.currentTailwindCode = `module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${this.currentPrimary}',
        secondary: '${this.currentSecondary}',
        accent: '${this.currentAccent}',
        background: '#f8fafc',
        surface: '#ffffff',
        text: '${this.currentText}'
      }
    }
  }
}`;
        
        this.currentCssCode = `:root {
  --color-primary: ${this.currentPrimary};
  --color-secondary: ${this.currentSecondary};
  --color-accent: ${this.currentAccent};
  --color-surface: #ffffff;
  --color-text: ${this.currentText};
  --color-border: #e2e5f1;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
}
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1rem;
}`;
        
        if (this.currentCodeMode === 'tailwind') {
            this.codePanel.textContent = this.currentTailwindCode;
        } else {
            this.codePanel.textContent = this.currentCssCode;
        }
    }
    
    // Переключение между вкладками Tailwind / CSS
    switchCodeTab(mode) {
        this.currentCodeMode = mode;
        if (mode === 'tailwind') {
            this.codePanel.textContent = this.currentTailwindCode;
            this.tabTailwindBtn.classList.add('text-indigo-600', 'border-indigo-600', 'font-semibold');
            this.tabTailwindBtn.classList.remove('text-gray-500');
            this.tabCssBtn.classList.remove('text-indigo-600', 'border-indigo-600', 'font-semibold');
            this.tabCssBtn.classList.add('text-gray-500');
        } else {
            this.codePanel.textContent = this.currentCssCode;
            this.tabCssBtn.classList.add('text-indigo-600', 'border-indigo-600', 'font-semibold');
            this.tabCssBtn.classList.remove('text-gray-500');
            this.tabTailwindBtn.classList.remove('text-indigo-600', 'border-indigo-600', 'font-semibold');
            this.tabTailwindBtn.classList.add('text-gray-500');
        }
    }
    
    // Рендер палитры (без изменений)
    renderPalette(hexArray, activeAccentHex, onAccentChange, onCopyHex) {
        this.paletteGrid.innerHTML = '';
        hexArray.forEach(hex => {
            const card = document.createElement('div');
            card.className = `flex-1 min-w-[100px] bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer transition hover:-translate-y-1 hover:shadow-md ${hex === activeAccentHex ? 'active-accent' : ''}`;
            card.innerHTML = `
                <div class="h-20 w-full" style="background-color: ${hex};"></div>
                <div class="p-3 text-center font-mono text-sm font-semibold">
                    <div class="text-gray-800">${hex}</div>
                    <div class="text-xs text-gray-400 mt-1">копировать</div>
                </div>
            `;
            const colorDiv = card.querySelector('.h-20');
            const hexSpan = card.querySelector('.text-gray-800');
            
            colorDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof onAccentChange === 'function') {
                    onAccentChange(hex, card);
                }
            });
            
            hexSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof onCopyHex === 'function') {
                    onCopyHex(hex);
                }
            });
            
            this.paletteGrid.appendChild(card);
        });
    }
    
    setActiveAccentClass(activeHex) {
        const cards = this.paletteGrid.querySelectorAll('.flex-1');
        cards.forEach(card => {
            const hexDiv = card.querySelector('.text-gray-800');
            if (hexDiv && hexDiv.textContent === activeHex) {
                card.classList.add('active-accent');
            } else {
                card.classList.remove('active-accent');
            }
        });
    }
    
    setColors(primary, secondary, accent, text) {
        this.currentPrimary = primary;
        this.currentSecondary = secondary;
        this.currentAccent = accent;
        this.currentText = text;
        this.updateUIAndCode();
    }
    
    setAccent(accent) {
        this.currentAccent = accent;
        this.updateUIAndCode();
    }
    
    setPalette(hexArray) {
        this.hexPalette = hexArray;
    }
};