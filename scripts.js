document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const searchInput = document.getElementById('search');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const tools = document.querySelectorAll('.tool');
    const copyButtons = document.querySelectorAll('.copy-link');
    const moreButtons = document.querySelectorAll('.btn-more');
    const modalOverlay = document.getElementById('modalOverlay');
    const modalClose = document.getElementById('modalClose');
    const modalContent = document.getElementById('modalContent');
    
    // Создаем элемент для отображения уведомления о копировании
    const copyFeedback = document.createElement('div');
    copyFeedback.className = 'copy-feedback';
    document.body.appendChild(copyFeedback);
    
    // Функция фильтрации инструментов
    function filterTools() {
        const searchTerm = searchInput.value.toLowerCase();
        const activeCategory = document.querySelector('.category-btn.active').dataset.category;
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        
        tools.forEach(tool => {
            const title = tool.querySelector('h2').textContent.toLowerCase();
            const description = tool.querySelector('p').textContent.toLowerCase();
            const category = tool.dataset.category;
            const isAvailable = tool.dataset.available === 'yes';
            
            const matchesSearch = title.includes(searchTerm) || description.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;
            let matchesFilter = true;
            
            if (activeFilter === 'available') {
                matchesFilter = isAvailable;
            } else if (activeFilter === 'vpn') {
                matchesFilter = !isAvailable;
            }
            
            tool.style.display = (matchesSearch && matchesCategory && matchesFilter) ? 'block' : 'none';
        });
    }
    
    // Обработчики событий
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
    
    copyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.closest('.tool');
            const link = tool.querySelector('a').href;
            
            navigator.clipboard.writeText(link).then(() => {
                showCopyFeedback('Ссылка скопирована!', '#28a745');
            }).catch(err => {
                showCopyFeedback('Ошибка копирования', '#dc3545');
                console.error('Ошибка при копировании: ', err);
            });
        });
    });
    
    moreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tool = this.closest('.tool');
            const title = tool.querySelector('h2').textContent;
            const description = tool.querySelector('p').textContent;
            const details = tool.querySelector('.tool-details').innerHTML;
            
            modalContent.innerHTML = `
                <h2>${title}</h2>
                <p class="modal-description">${description}</p>
                ${details}
            `;
            
            modalOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', function(e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });
    
    function closeModal() {
        modalOverlay.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
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
    
    // Первоначальная фильтрация
    filterTools();
});