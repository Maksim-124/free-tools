// Имя кэша (меняйте при обновлении файлов)
const CACHE_NAME = 'free-tools-cache-v2';
const OFFLINE_CACHE = 'free-tools-offline-v1';

// Файлы для кэширования
const urlsToCache = [
    '/',
    '/index.html',
    '/suno.html',
    '/deepseek.html',
    '/carve-photos.html',
    '/images/carve-screenshot.jpg',
    '/images/carve-before.jpg',
    '/images/carve-after.jpg',
    '/images/carve-og.jpg',
    '/suggest-tool.html',
    '/styles.css',
    '/scripts.js',
    '/tools.json',
    '/manifest.webmanifest',
    '/favicon.ico',
    '/favicon/favicon.ico',
    '/favicon/apple-touch-icon.png',
    '/favicon/favicon-32x32.png',
    '/favicon/favicon-16x16.png',
    '/images/logo.png',
    '/images/free-tools-og.jpg',
    '/components/header.js',
    '/components/footer.js',
    '/components/metrika.js'
];

// Файлы для офлайн-страницы
const offlineUrls = [
    '/offline.html',
    '/styles.css',
    '/images/offline.svg'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Кэшируем основные ресурсы');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                return caches.open(OFFLINE_CACHE)
                    .then(offlineCache => {
                        console.log('Кэшируем офлайн-ресурсы');
                        return offlineCache.addAll(offlineUrls);
                    });
            })
            .then(() => self.skipWaiting())
    );
});

// Активация - очистка старых кэшей
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME, OFFLINE_CACHE];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('Удаляем старый кэш:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => self.clients.claim())
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    // Пропускаем запросы к Яндекс.Метрике и другим аналитикам
    if (event.request.url.includes('mc.yandex.ru') || 
        event.request.url.includes('google-analytics')) {
        return;
    }

    // Для HTML-страниц используем стратегию Network Falling Back to Cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match('/offline.html');
                })
        );
        return;
    }

    // Для остальных ресурсов: Cache First
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем кэшированную версию, если есть
                if (response) {
                    return response;
                }

                // Иначе загружаем из сети и кэшируем
                return fetch(event.request).then(response => {
                    // Клонируем ответ, т.к. поток можно использовать только один раз
                    const responseToCache = response.clone();
                    
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseToCache));
                    
                    return response;
                });
            })
            .catch(() => {
                // Для CSS/JS возвращаем офлайн-версию
                if (event.request.url.endsWith('.css')) {
                    return caches.match('/styles.css');
                }
                
                // Возвращаем заглушку для изображений
                if (event.request.url.endsWith('.jpg') || 
                    event.request.url.endsWith('.png')) {
                    return caches.match('/images/offline.svg');
                }
                
                // Для данных возвращаем пустой ответ
                if (event.request.url.endsWith('.json')) {
                    return new Response('{}', {
                        headers: {'Content-Type': 'application/json'}
                    });
                }
            })
    );
});

// Фоновая синхронизация
self.addEventListener('sync', event => {
    if (event.tag === 'sync-suggestions') {
        event.waitUntil(syncSuggestions());
    }
});

async function syncSuggestions() {
    // Здесь будет логика синхронизации предложенных инструментов
}