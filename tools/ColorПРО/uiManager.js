// uiManager.js
// Отвечает за рендер палитры, пример интерфейса, генерацию Tailwind/CSS кода

window.UIManager = class UIManager {
    constructor() {
        this.paletteGrid = document.getElementById('paletteGrid');
        this.demoButton = document.getElementById('demoButton');
        this.demoText = document.getElementById('demoText');
        this.demoBadge = document.getElementById('demoBadge');
        this.demoGradient = document.getElementById('demoGradient');
        this.codePanel = document.getElementById('codePanel');
        this.tabTailwindBtn = document.getElementById('tabTailwindBtn');
        this.tabCssBtn = document.getElementById('tabCssBtn');
        
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
        
        // События вкладок
        this.tabTailwindBtn.addEventListener('click', () => this.switchCodeTab('tailwind'));
        this.tabCssBtn.addEventListener('click', () => this.switchCodeTab('css'));
    }
    
    updateUIAndCode() {
        this.demoButton.style.backgroundColor = this.currentPrimary;
        this.demoBadge.style.backgroundColor = this.currentAccent;
        this.demoText.style.color = this.currentText;
        const grad = `linear-gradient(135deg, ${this.currentPrimary}, ${this.currentAccent})`;
        this.demoGradient.style.background = grad;
        
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