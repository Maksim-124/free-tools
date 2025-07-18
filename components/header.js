class FreeHeader extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .header {
                    bacground: var(--header-bg);
                    position: sticky;
                    top: 0;
                    padding: 15px 20px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .logo img { height: 45px; }
                .nav-list { display: flex; list-style: none; gap: 15px; }
                .nav-link { color: #333; text-decoration: none; }
                .search-button {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px; 18px;
                    border-radius: 30px;
                    background: #f0f2f5;
                    border: none;
                    cursor: pointer;
                }
                </style>
                <header class="header">
                    <div class="logo">
                        <img src="images/logo.png" alt="Бесплатные сервисы">
                    </div>
                    <nav class="nav">
                        <ul class="nav-list">
                            <li><a href="#" class="nav-link">Топ-10</a></li>
                            <li><a href="#" class="nav-link">О проекте</a></li>
                        </ul>
                    </nav>
                    <button class="search-button">
                        <svg width="18" viewBox="0 0 24 24"><path d="M15.5 15H14.71L14.43 14.73C15.41 13.59 16 12.11 16 10.5C16 6.91 13.09 4 9.5 4C5.91 4 3 6.91 3 10.5C3 14.09 5.91 17 9.5 17C11.11 17 12.59 16.41 13.73 15.43L14 15.71V16.5L19 21.49L20.49 20L15.5 15Z" fill="currentColor"/></svg>
                        <span>Поиск</span>
                    </button>
                </header>
                `;
    }

    connectedCallback() {
        this.shadowRoot.querySelectorAll('.nav-link, .search-button')
            .forEach(el => el.addEventListener('click', e => {
                e.preventDefault();
                alert("Раздел в разработке");
            }));
    }
}
customElements.define('free-header', FreeHeader);