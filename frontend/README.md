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
3. Создайте переменную окружения `VITE_API_BASE_URL` при запуске, если бэк не на `http://localhost:8000/api`.

4. Запустите приложение:
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

По умолчанию приложение обращается к API по адресу:

```text
http://localhost:8000/api
```

Если ваш бек работает на другом адресе, добавьте переменную окружения при запуске:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000/api npm run dev
```
