// main.js - точка входа, обработчики событий, drag&drop
(function() {
    // DOM элементы
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const previewImg = document.getElementById('previewImage');
    const previewFilename = document.getElementById('previewFilename');
    const previewDimensions = document.getElementById('previewDimensions');
    const generateBtn = document.getElementById('generateBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultArea = document.getElementById('resultArea');
    const toastEl = document.getElementById('toast');
    const copyCodeBtn = document.getElementById('copyCodeBtn');

    let currentFile = null;
    const uiManager = new UIManager();
    const ColorExtractor = window.ColorExtractor;

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2500);
    }

    function handleFileSelection(file) {
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            showToast('❌ Файл слишком большой (макс. 10 МБ)');
            return;
        }
        if (!file.type.match('image.*')) {
            showToast('❌ Пожалуйста, загрузите изображение (PNG, JPEG, WEBP)');
            return;
        }
        currentFile = file;
        const objectUrl = URL.createObjectURL(file);
        previewImg.src = objectUrl;
        previewImg.onload = () => {
            URL.revokeObjectURL(objectUrl);
            previewDimensions.innerText = `${previewImg.naturalWidth} × ${previewImg.naturalHeight} px`;
        };
        previewFilename.innerText = file.name;
        previewContainer.classList.remove('hidden');
        generateBtn.disabled = false;
        resultArea.classList.add('hidden');
    }

    async function generatePaletteAndTheme() {
        if (!currentFile) {
            showToast('Сначала загрузите изображение');
            return;
        }
        generateBtn.disabled = true;
        generateBtn.textContent = '⏳ Анализируем...';
        try {
            const hexColors = await ColorExtractor.extractPaletteFromFile(currentFile);
            uiManager.setPalette(hexColors);
            
            const { primary, secondary, accent, text } = ColorExtractor.autoSelectColors(hexColors);
            uiManager.setColors(primary, secondary, accent, text);
            
            uiManager.renderPalette(
                hexColors,
                uiManager.currentAccent,
                (newAccentHex, cardElement) => {
                    uiManager.setAccent(newAccentHex);
                    document.querySelectorAll('.flex-1').forEach(c => c.classList.remove('active-accent'));
                    cardElement.classList.add('active-accent');
                    showToast(`🎨 Акцентный цвет изменён на ${newAccentHex}`);
                },
                (hex) => {
                    navigator.clipboard.writeText(hex);
                    showToast(`✅ Скопирован ${hex}`);
                }
            );
            
            resultArea.classList.remove('hidden');
            showToast(`🎨 Палитра готова! ${hexColors.length} цветов. Кликните на любой цвет, чтобы изменить акцент.`);
        } catch (err) {
            console.error(err);
            showToast('❌ Ошибка анализа цветов. Попробуйте другое изображение.');
            resultArea.classList.add('hidden');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = '✨ Извлечь палитру и тему';
        }
    }

    function clearAll() {
        currentFile = null;
        previewContainer.classList.add('hidden');
        resultArea.classList.add('hidden');
        fileInput.value = '';
        generateBtn.disabled = true;
        uiManager.hexPalette = [];
        showToast('🗑️ Очищено');
    }

    function initDragAndDrop() {
        dropzone.addEventListener('click', () => fileInput.click());
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('drag-over');
        });
        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('drag-over');
        });
        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFileSelection(files[0]);
        });
        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length) handleFileSelection(fileInput.files[0]);
        });
    }

    copyCodeBtn.addEventListener('click', () => {
        const code = uiManager.codePanel.textContent;
        navigator.clipboard.writeText(code);
        showToast('📋 Код скопирован');
    });

    generateBtn.addEventListener('click', generatePaletteAndTheme);
    clearBtn.addEventListener('click', clearAll);
    initDragAndDrop();
    generateBtn.disabled = true;
})();