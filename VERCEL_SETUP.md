# Настройка проекта для Vercel

## Шаги для деплоя:

1. **Создание Vercel Postgres базы данных:**
   - Перейдите в Vercel Dashboard
   - Выберите проект
   - Перейдите в Storage -> Create Database
   - Выберите Postgres
   - Скопируйте переменные окружения в настройки проекта

2. **Переменные окружения в Vercel:**
   ```
   POSTGRES_URL=<your_postgres_url>
   POSTGRES_PRISMA_URL=<your_prisma_url>
   POSTGRES_URL_NON_POOLING=<your_non_pooling_url>
   JWT_SECRET=<your_jwt_secret>
   ```

3. **Инициализация базы данных:**
   После деплоя выполните POST запрос на `/api/init-db`

4. **Миграция данных:**
   Для миграции данных из SQLite запустите локально:
   ```bash
   npm run migrate:postgres
   ```

## Основные изменения:

- ✅ Добавлен @vercel/postgres
- ✅ Создан PostgreSQL адаптер
- ✅ Обновлены auth функции
- ✅ Создан API для инициализации БД
- ⚠️ Нужно обновить остальные API маршруты

## Статус миграции:

- [x] Настройка PostgreSQL
- [x] Создание схемы БД
- [x] Обновление auth.ts
- [x] Обновление /api/auth/me
- [x] Обновление /api/courses
- [ ] Обновление /api/lessons
- [ ] Обновление /api/tests
- [ ] Обновление /api/test-questions
- [ ] Обновление /api/test-results

## Быстрый деплой:

Для быстрого деплоя можно использовать только обновленные маршруты:
- Аутентификация: ✅ Готово
- Курсы: ✅ Готово
- Остальные API: Требуют обновления

## После деплоя:

1. Вызовите `/api/init-db` для создания таблиц
2. Используйте admin@bitrix24course.ru / admin123 для входа
3. Постепенно обновляйте остальные API маршруты