class FreeFooter extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                footer {
                    text-align: center;
                    padding: 20px;
                    color: #6c757d;
                }
            .email {
                cursor: pointer;
                text-decoration: underline;
            }
            </style>
            <footer>
                <p>Бесплатные сервисы © ${new Date().getFullYear()}</p>
                <p class="email">free-tools@internet.ru</p>
            </footer>
            `;
            
            this.shadowRoot.querySelector('.email').addEventListener('click', () => {
                window.location.href = 'mailto:free-tools@internet.ru';
            });
    }
}
customElements.define('free-footer', FreeFooter);
