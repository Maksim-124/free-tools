class FreeFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --secondary-color: #6c757d;
                    --primary-color: #3366ff;
                }
                
                footer {
                    text-align: center;
                    padding: 20px;
                    color: var(--secondary-color);
                    font-size: 14px;
                }
                
                .email {
                    cursor: pointer;
                    text-decoration: underline;
                    transition: all 0.3s ease;
                    position: relative;
                    display: inline-block;
                }
                
                .email:hover {
                    color: var(--primary-color);
                }
                
                .email:hover::after {
                    content: " ✉️";
                    font-size: 0.9em;
                }
                
                p {
                padding: 0;
                margin: 0;
                }
            </style>
            
            <footer>
                <p>Бесплатные сервисы и AI &copy; ${new Date().getFullYear()} | Сайт находится в разработке [🛠️]</p>
                <p class="email">free-tools@internet.ru</p>
            </footer>
        `;
        
        // Обработчик для email
        this.shadowRoot.querySelector('.email').addEventListener('click', () => {
            const email = this.shadowRoot.querySelector('.email').textContent;
            window.location.href = `mailto:${email}`;
        });
    }
}
customElements.define('free-footer', FreeFooter);