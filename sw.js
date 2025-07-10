// Имя кэша (меняйте при обновлении файлов)
const CACHE_NAME = 'free-tools-cache-v1';

// Файлы для кэширования
const urlsToCache = [
    '/',
    '/index.html',
    '/suno.html',
    '/styles.css',
    '/scripts.js',
    '/tools.json',
    '/favicon/favicon.ico',
    '/images/logo.png',
    '/images/free-tools-og.jpg'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
            console.log('Кэшируем основные ресурсы');
            return cache.addAll(urlsToCache);
        })
    );
});

// Активация - очистка старых кэшей
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Перехват запросов
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
            // Возвращаем кэшированную версию, если есть
            if (response) {
                return response;
            }

            // Иначе загружаем из сети
            return fetch(event.request);
        }
        )
    );
});