let deferredPrompt;

// Обработчик события beforeinstallprompt, чтобы перехватить событие установки
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // Остановить стандартное всплывающее окно установки
    deferredPrompt = e; // Сохранить событие, чтобы использовать позже

    // Показать кнопку для установки
    const installButton = document.getElementById('installButton');
    installButton.style.display = 'block';

    // Добавить обработчик события для кнопки
    installButton.addEventListener('click', () => {
        // Показать предложение об установке PWA
        deferredPrompt.prompt();

        // Обработать выбор пользователя
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('Пользователь принял предложение об установке');
            } else {
                console.log('Пользователь отклонил предложение об установке');
            }
            deferredPrompt = null; // Очистить сохранённое событие
        });
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('ServiceWorker зарегистрирован с областью:', registration.scope);
            })
            .catch((err) => {
                console.error('Ошибка регистрации ServiceWorker:', err);
            });
    });
}


