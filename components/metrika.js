class Yandexmetrika extends HTMLElement {
    constructor() {
        super();
        const script = document.createElement('script');
        script.textContent = `
        (function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
      ym(102614891, "init", {clickmap:true, trackLinks:true, accurateTrackBounce:true});
    `;
    document.head.appendChild(script);
    
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/102614891" style="position:absolute; left:-9999px;" alt=""></div>`;
    document.head.appendChild(noscript);
  }
}
customElements.define('yandex-metrika', YandexMetrika);