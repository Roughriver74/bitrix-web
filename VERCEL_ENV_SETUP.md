# 🔧 Настройка переменных окружения в Vercel

## ❌ Проблема: "missing_connection_string"

Если вы видите ошибку `VercelPostgresError - 'missing_connection_string'`, это означает, что переменные окружения для PostgreSQL не настроены в Vercel.

## 📋 Пошаговая инструкция

### Шаг 1: Создание PostgreSQL базы данных в Vercel

1. **Откройте Vercel Dashboard:**
   - Перейдите на [vercel.com/dashboard](https://vercel.com/dashboard)
   - Войдите в свой аккаунт

2. **Выберите ваш проект:**
   - Найдите проект `bitrix-web` (или как он называется)
   - Кликните на него

3. **Создайте базу данных:**
   - На странице проекта перейдите во вкладку **Storage**
   - Нажмите **Create Database**
   - Выберите **Postgres**
   - Дайте название базе данных (например, `bitrix24-courses`)
   - Выберите регион (рекомендуется тот же, где развернут проект)
   - Нажмите **Create**

### Шаг 2: Получение переменных окружения

После создания базы данных Vercel предоставит вам переменные окружения. Скопируйте все:

```bash
POSTGRES_URL="postgresql://username:password@host:port/database"
POSTGRES_PRISMA_URL="postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15"
POSTGRES_URL_NON_POOLING="postgresql://username:password@host:port/database"
POSTGRES_USER="username"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```

### Шаг 3: Добавление переменных в проект

1. **Перейдите в настройки проекта:**
   - На странице проекта нажмите **Settings**
   - Выберите **Environment Variables**

2. **Добавьте PostgreSQL переменные:**
   - Нажмите **Add** для каждой переменной
   - Вставьте имя и значение переменной
   - Выберите **Production**, **Preview**, **Development** (все три)
   - Нажмите **Save**

3. **Добавьте JWT_SECRET:**
   - Создайте переменную `JWT_SECRET`
   - Значение: придумайте надежный ключ (минимум 32 символа)
   - Пример: `your-super-secure-jwt-secret-key-min-32-chars-long`

### Шаг 4: Полный список переменных

Убедитесь, что добавлены все переменные:

```bash
POSTGRES_URL=postgresql://username:password@host:port/database
POSTGRES_PRISMA_URL=postgresql://username:password@host:port/database?pgbouncer=true&connect_timeout=15
POSTGRES_URL_NON_POOLING=postgresql://username:password@host:port/database
POSTGRES_USER=username
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database
JWT_SECRET=your-super-secure-jwt-secret-key-min-32-chars-long
```

### Шаг 5: Перезапуск деплоймента

1. **Перейдите во вкладку Deployments:**
   - Найдите последний деплоймент
   - Нажмите на три точки (⋯)
   - Выберите **Redeploy**
   - Нажмите **Redeploy** для подтверждения

### Шаг 6: Инициализация базы данных

После успешного деплоя выполните инициализацию:

```bash
curl -X POST "https://ваш-домен.vercel.app/api/init-db?loadContent=true"
```

Замените `ваш-домен.vercel.app` на реальный URL вашего проекта.

## ✅ Проверка результата

### Проверка статуса системы:
1. Откройте ваш сайт
2. На главной странице должен отображаться статус системы
3. Если все настроено правильно, вы увидите "✅ PostgreSQL: Подключен"

### Проверка через API:
```bash
curl "https://ваш-домен.vercel.app/api/health"
```

Ответ должен быть:
```json
{
  "status": "healthy",
  "message": "Все переменные окружения настроены корректно",
  "postgres": true,
  "environment": "production"
}
```

## 🔍 Устранение проблем

### Проблема: Переменные не применяются
**Решение:** 
- Убедитесь, что выбрали все окружения (Production, Preview, Development)
- Перезапустите деплоймент

### Проблема: Ошибка подключения к базе данных
**Решение:**
- Проверьте правильность всех переменных
- Убедитесь, что база данных создана в том же аккаунте Vercel

### Проблема: JWT ошибки
**Решение:**
- Убедитесь, что `JWT_SECRET` содержит минимум 32 символа
- Используйте только латинские буквы, цифры и символы

## 📞 Получение помощи

Если после выполнения всех шагов проблема не решена:

1. **Проверьте логи:**
   - Vercel Dashboard → ваш проект → Functions
   - Найдите ошибки в логах

2. **Проверьте переменные:**
   - Settings → Environment Variables
   - Убедитесь, что все 8 переменных добавлены

3. **Попробуйте локальную проверку:**
   ```bash
   curl -X POST "https://ваш-домен.vercel.app/api/health"
   ```

## 🎯 Финальная проверка

После настройки вы должны иметь возможность:
- ✅ Открыть сайт без ошибок
- ✅ Видеть статус "PostgreSQL: Подключен"
- ✅ Войти в систему (admin@bitrix24course.ru / admin123)
- ✅ Видеть курсы и контент

---

**После выполнения всех шагов ваш проект будет полностью готов к работе!**