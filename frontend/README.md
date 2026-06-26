# Fantastic Waddle Frontend

Реактивное приложение на React + React Aria для работы с Laravel API.

## Запуск

1. Перейдите в папку `frontend`:
   ```bash
   cd /workspaces/fantastic-waddle/frontend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Убедитесь, что в `frontend/vite.config.js` настроен прокси для `/api` на ваш Laravel-бекенд, затем запустите приложение:
   ```bash
   npm run dev
   ```

## Особенности

- Логин / регистрация
- Просмотр тем
- Выбор вопросов по теме
- Создание интервью-сессии
- Загрузка аудио-ответа на вопрос

## Конфигурация

Приложение обращается к API по относительному пути `/api`, чтобы Vite мог проксировать запросы к бэкенду.

Прокси настраивается в `frontend/vite.config.js`.

Если бэкенд на другом адресе, измените `target` в секции `server.proxy['/api']`.

### Мок-режим

По умолчанию фронтенд теперь работает через мок-режим, если в `frontend/.env` не задано `VITE_USE_MOCKS=false`.

Для ручного включения/выключения создайте файл `frontend/.env` по примеру `frontend/.env.example`.

```bash
VITE_USE_MOCKS=true
VITE_API_BASE_URL=http://localhost/api
```

Чтобы работать с реальным бэкендом, установите:

```bash
VITE_USE_MOCKS=false
```
