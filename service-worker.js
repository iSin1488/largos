const CACHE_NAME = 'pwa-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/second.html',
    '/styles.css',
    '/manifest.json',
    '/icons/icon-192.png',
    '/icons/icon-512.png',
    '/images/default-offline.jpg', // Опционально, если есть
    '/offline.html' // Опционально
];

// Установка сервис-воркера и кэширование ресурсов
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
    );
});

// Перехват запросов и предоставление кэшированных ресурсов
self.addEventListener('fetch', (event) => {
    console.log('[ServiceWorker] Fetch', event.request.url);
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем кэшированный ответ, если существует
                if (response) {
                    return response;
                }
                // Иначе делаем запрос в сеть
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Проверяем валидность ответа
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }
                        // Клонируем ответ для кэширования
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    })
                    .catch(() => {
                        // Если запрос не удался (например, отсутствие интернета)
                        if (event.request.destination === 'image') {
                            return caches.match('/images/default-offline.jpg');
                        }
                        // Можно вернуть кастомную офлайн-страницу
                        return caches.match('/offline.html') || caches.match('/index.html');
                    });
            })
    );
});

// Активация сервис-воркера и очистка старых кэшей
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
