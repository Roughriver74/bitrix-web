# Курсы Битрикс24 - Обучающая платформа

Комплексное веб-приложение для изучения Битрикс24 с курсами, тестами и системой управления контентом.

## 🚨 ВАЖНО: Настройка переменных окружения

**❌ Если вы видите ошибку "missing_connection_string"** - это означает, что переменные окружения не настроены.

### Обязательные переменные окружения для Vercel:

```bash
# PostgreSQL подключение (получите в Vercel Storage)
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database

# Дополнительные PostgreSQL переменные
POSTGRES_USER=username
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database

# JWT секрет (придумайте надежный ключ)
JWT_SECRET=your-very-secure-secret-key-here-min-32-chars
```

### Как настроить в Vercel:

1. **Создайте PostgreSQL базу данных:**
   - Откройте [Vercel Dashboard](https://vercel.com/dashboard)
   - Выберите ваш проект
   - Перейдите в **Storage** → **Create Database**
   - Выберите **Postgres**
   - Скопируйте все предоставленные переменные

2. **Добавьте переменные окружения:**
   - Перейдите в **Settings** → **Environment Variables**
   - Добавьте все переменные из списка выше
   - **Важно:** Добавьте свой собственный `JWT_SECRET`

3. **Перезапустите деплойМЕНТ:**
   - Перейдите в **Deployments**
   - Нажмите на три точки рядом с последним деплоем
   - Выберите **Redeploy**

4. **Инициализируйте базу данных:**
   ```bash
   curl -X POST "https://ваш-домен.vercel.app/api/init-db?loadContent=true"
   ```

## 🚀 Быстрый старт

### Локальная разработка

1. Клонируйте репозиторий:
   ```bash
   git clone <your-repo-url>
   cd bitrix24-courses
   ```

2. Установите зависимости:
   ```bash
   npm install
   ```

3. Настройте переменные окружения (создайте `.env.local`):
   ```bash
   # Для локальной разработки можете использовать эти значения
   POSTGRES_URL=your_postgres_url_here
   JWT_SECRET=your-secret-key-for-development
   ```

4. Запустите сервер разработки:
   ```bash
   npm run dev
   ```

5. Откройте [http://localhost:3001](http://localhost:3001) в браузере

## 📚 Возможности

### ✅ Готовые курсы:
- **Основы работы с Битрикс24**
- **Продвинутая автоматизация Битрикс24**
- **Интеграции и API Битрикс24**
- **Аналитика и BI в Битрикс24**

### ✅ Функциональность:
- 🎓 Интерактивные уроки с markdown
- 📝 Система тестирования знаний
- 👨‍💼 Административная панель
- 📊 Отслеживание прогресса
- 🔐 Система авторизации
- 📱 Адаптивный дизайн

### ✅ Техническая реализация:
- Next.js 15 с App Router
- PostgreSQL база данных
- TypeScript
- Tailwind CSS
- Vercel деплой

## 👥 Данные для входа

После инициализации базы данных доступны следующие аккаунты:

**Основной администратор:**
- Email: `roughriver74@gmail.com`
- Пароль: `bitrix2024`

**Дополнительный администратор:**
- Email: `admin@bitrix24course.ru`
- Пароль: `admin123`

## 🛠 API Маршруты

### Аутентификация:
- `POST /api/auth/login` - Вход в систему
- `GET /api/auth/me` - Информация о пользователе

### Курсы и контент:
- `GET /api/courses` - Список курсов
- `GET /api/courses/[id]` - Конкретный курс
- `GET /api/lessons` - Уроки курса
- `GET /api/lessons/[id]` - Конкретный урок

### Тестирование:
- `GET /api/tests` - Тесты курса
- `GET /api/test-questions` - Вопросы теста
- `POST /api/test-results` - Сохранение результатов

### Система:
- `POST /api/init-db` - Инициализация БД
- `GET /api/health` - Статус системы

## 🔧 Устранение проблем

### Ошибка "missing_connection_string":
1. Проверьте переменные окружения в Vercel
2. Убедитесь, что PostgreSQL база создана
3. Перезапустите деплоймент

### База данных не инициализируется:
1. Проверьте переменную `JWT_SECRET`
2. Выполните `POST /api/init-db?loadContent=true`
3. Проверьте логи в Vercel Dashboard

### Не отображается контент:
1. Убедитесь, что инициализация прошла успешно
2. Проверьте статус через `/api/health`
3. Войдите как администратор для проверки

## 📖 Документация

Подробные инструкции находятся в файлах:
- `DEPLOYMENT_GUIDE.md` - Полное руководство по деплою
- `CHANGES_SUMMARY.md` - Сводка изменений

## 🤝 Поддержка

При возникновении проблем:
1. Проверьте статус системы на главной странице
2. Просмотрите логи в Vercel Dashboard
3. Убедитесь, что все переменные окружения настроены

---

**Платформа готова к использованию после настройки переменных окружения и инициализации базы данных!**
