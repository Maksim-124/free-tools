class FreeHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --primary-color: #3366ff;
                    --nav-text: #333333;
                    --search-bg: #f0f2f5;
                    --search-text: #5f6368;
                    --header-bg: #ffffff;
                    --header-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                    --transition: all 0.3s ease;
                }
                
                .header {
                    background: var(--header-bg);
                    position: sticky;
                    top: 0;
                    transition: var(--transition);
                    z-index: 1000;
                    min-height: 80px;
                    box-shadow: var(--header-shadow);
                    border-radius: 0 0 20px 20px;
                }
                
                .header__container {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 15px 20px;
                    position: relative;
                    z-index: 2;
                }

                .logo {
                    display: flex;
                    align-items: center;
                    position: relative;
                    z-index: 3;
                    cursor: pointer;
                }

                .logo-image {
                    height: 45px;
                    transition: var(--transition);
                    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                }

                .logo:hover .logo-image {
                    transform: scale(1.05);
                    filter: drop-shadow(0 4px 8px rgba(51, 102, 255, 0.3));
                }

                .nav-list {
                    display: flex;
                    list-style: none;
                    gap: 15px;
                    margin: 0;
                    padding: 0;
                }

                .nav-link {
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 600;
                    color: var(--nav-text);
                    text-decoration: none;
                    font-size: 1rem;
                    padding: 8px 12px;
                    border-radius: 4px;
                    transition: var(--transition);
                    position: relative;
                }

                .nav-link::before {
                    content: '';
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: var(--primary-color);
                    transform: scaleX(0);
                    transform-origin: right;
                    transition: transform 0.3s ease;
                }

                .nav-link:hover::before,
                .nav-link.active::before {
                    transform: scaleX(1);
                    transform-origin: left;
                }

                .nav-link:hover,
                .nav-link.active {
                    color: var(--primary-color);
                }

                .search-button {
                    background: var(--search-bg);
                    border: none;
                    transition: var(--transition);
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border-radius: 30px;
                    color: var(--search-text);
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .search-icon {
                    width: 18px;
                    height: 18px;
                    transition: transform 0.3s ease;
                }

                .search-button:hover {
                    background: #e4e6eb;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                }

                .search-button:hover .search-icon {
                    transform: scale(1.1);
                }

                .header.scrolled {
                    min-height: 60px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                }

                .header.scrolled .logo-image {
                    height: 35px;
                }

                @media (max-width: 768px) {
                    .header {
                        border-radius: 0;
                        min-height: auto;
                    }
                    
                    .header__container {
                        flex-direction: column;
                        gap: 12px;
                        padding: 12px 15px;
                    }
                    
                    .logo {
                        flex-direction: column;
                        text-align: center;
                    }
                    
                    .logo-image {
                        height: 35px;
                    }
                    
                    .nav-list {
                        flex-wrap: wrap;
                        justify-content: center;
                    }
                    
                    .nav-link {
                        padding: 6px 10px;
                        font-size: 0.9rem;
                    }
                    
                    .search-button {
                        width: 100%;
                        max-width: 180px;
                        justify-content: center;
                        margin-top: 5px;
                    }
                    
                    .header.scrolled .logo-image {
                        height: 30px;
                    }
                }
            </style>
            
            <header class="header">
                <div class="header__container">
                    <div class="logo">
                        <a href="/">
                            <img src="images/logo.png" alt="Бесплатные сервисы" class="logo-image" loading="lazy">
                        </a>
                    </div>
                    <nav class="nav">
                        <ul class="nav-list">
                            <li><a href="/" class="nav-link">На главную</a></li>
                            <li><a href="#" class="nav-link">Топ-10</a></li>
                            <li><a href="#" class="nav-link">О проекте</a></li>
                        </ul>
                    </nav>
                    <button class="search-button">
                        <svg class="search-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5 15H14.71L14.43 14.73C15.41 13.59 16 12.11 16 10.5C16 6.91 13.09 4 9.5 4C5.91 4 3 6.91 3 10.5C3 14.09 5.91 17 9.5 17C11.11 17 12.59 16.41 13.73 15.43L14 15.71V16.5L19 21.49L20.49 20L15.5 15Z" fill="currentColor"/>
                        </svg>
                        <span class="search-text">Поиск</span>
                    </button>
                </div>
            </header>
        `;
    }

    connectedCallback() {
        // Обработчики кликов
        this.shadowRoot.querySelectorAll('.nav-link([href="/"]), .search-button')
            .forEach(el => el.addEventListener('click', e => {
                e.preventDefault();
                alert("Раздел в разработке");
            }));
        
        // Обработчик скролла
        window.addEventListener('scroll', () => {
            const header = this.shadowRoot.querySelector('.header');
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }
}
customElements.define('free-header', FreeHeader);