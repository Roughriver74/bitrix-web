import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getCourseById, updateCourse, deleteCourse } from '@/lib/blob-storage'

// Статические данные курсов с уроками
const staticCoursesData = {
	1: {
		id: 1,
		title: 'Основы работы с Битрикс24',
		description:
			'Изучение базовых возможностей платформы: CRM, задачи, проекты',
		order_index: 1,
		created_at: new Date().toISOString(),
		lessons: [
			{
				id: 1,
				course_id: 1,
				title: 'Введение в Битрикс24',
				content: `# Введение в Битрикс24

Битрикс24 — это комплексное решение для автоматизации бизнес-процессов компании.

## Основные модули:
- **CRM** — система управления клиентами
- **Задачи и проекты** — планирование работы
- **Документы** — совместная работа с файлами
- **Общение** — чаты, видеозвонки
- **Сайты** — создание корпоративных сайтов

## Первые шаги:
1. Регистрация аккаунта
2. Настройка профиля
3. Изучение интерфейса
4. Добавление сотрудников

Битрикс24 поможет организовать работу вашей команды и повысить эффективность бизнеса.`,
				order_index: 1,
				created_at: new Date().toISOString(),
			},
			{
				id: 2,
				course_id: 1,
				title: 'Интерфейс и навигация',
				content: `# Интерфейс и навигация в Битрикс24

## Основные элементы интерфейса:

### Левое меню
- **Лента** — последние события
- **CRM** — работа с клиентами
- **Задачи и проекты** — планирование
- **Календарь** — планирование встреч
- **Документы** — файлы и папки

### Верхняя панель
- Поиск по всем разделам
- Уведомления
- Быстрые действия
- Профиль пользователя

### Рабочая область
- Основной контент выбранного раздела
- Фильтры и сортировка
- Действия с элементами

## Полезные советы:
- Используйте горячие клавиши для быстрой навигации
- Настройте избранные разделы
- Персонализируйте рабочий стол`,
				order_index: 2,
				created_at: new Date().toISOString(),
			},
		],
	},
	2: {
		id: 2,
		title: 'CRM и управление клиентами',
		description: 'Работа с лидами, сделками, контактами и компаниями',
		order_index: 2,
		created_at: new Date().toISOString(),
		lessons: [
			{
				id: 3,
				course_id: 2,
				title: 'Основы CRM',
				content: `# Основы CRM в Битрикс24

CRM (Customer Relationship Management) — система управления взаимоотношениями с клиентами.

## Основные сущности CRM:
- **Лиды** — потенциальные клиенты
- **Сделки** — процесс продаж
- **Контакты** — физические лица
- **Компании** — юридические лица

## Воронка продаж:
1. **Первичный контакт** — получение лида
2. **Квалификация** — определение потребности
3. **Коммерческое предложение** — подготовка КП
4. **Переговоры** — обсуждение условий
5. **Закрытие сделки** — подписание договора

## Преимущества использования CRM:
- Централизованное хранение данных о клиентах
- Контроль этапов продаж
- Автоматизация рутинных задач
- Аналитика и отчетность`,
				order_index: 1,
				created_at: new Date().toISOString(),
			},
			{
				id: 4,
				course_id: 2,
				title: 'Работа с лидами',
				content: `# Работа с лидами в Битрикс24

## Что такое лид?
Лид — это потенциальный клиент, который проявил интерес к вашему продукту или услуге.

## Источники лидов:
- **Веб-формы** на сайте
- **Социальные сети**
- **Холодные звонки**
- **Реклама** (контекстная, таргетированная)
- **Рекомендации** клиентов

## Квалификация лидов:
1. **Горячие** — готовы к покупке сейчас
2. **Теплые** — интересуются, но не готовы покупать
3. **Холодные** — минимальный интерес

## Процесс обработки:
1. Получение лида
2. Первичный контакт (звонок, письмо)
3. Выявление потребности
4. Квалификация
5. Конвертация в сделку или отклонение`,
				order_index: 2,
				created_at: new Date().toISOString(),
			},
		],
	},
	3: {
		id: 3,
		title: 'Задачи и проекты',
		description: 'Планирование работы, создание задач и управление проектами',
		order_index: 3,
		created_at: new Date().toISOString(),
		lessons: [
			{
				id: 5,
				course_id: 3,
				title: 'Создание и управление задачами',
				content: `# Создание и управление задачами

## Основы работы с задачами:

### Создание задачи:
1. Нажмите кнопку "Добавить задачу"
2. Укажите название и описание
3. Выберите ответственного
4. Установите срок выполнения
5. Добавьте наблюдателей при необходимости

### Статусы задач:
- **Новая** — только что создана
- **В работе** — выполняется
- **Ждет контроля** — ожидает проверки
- **Завершена** — выполнена
- **Отложена** — приостановлена

### Приоритеты:
- **Низкий** — не срочная задача
- **Обычный** — стандартный приоритет
- **Высокий** — важная задача
- **Критичный** — требует немедленного выполнения`,
				order_index: 1,
				created_at: new Date().toISOString(),
			},
		],
	},
	4: {
		id: 4,
		title: 'Автоматизация и роботы',
		description: 'Настройка автоматических процессов и бизнес-процессов',
		order_index: 4,
		created_at: new Date().toISOString(),
		lessons: [
			{
				id: 6,
				course_id: 4,
				title: 'Основы автоматизации',
				content: `# Основы автоматизации в Битрикс24

## Что такое автоматизация?
Автоматизация позволяет системе выполнять действия без участия человека при наступлении определенных событий.

## Типы автоматизации:
- **Роботы** — простые автоматические действия
- **Бизнес-процессы** — сложные сценарии с условиями
- **Триггеры** — реакция на события

## Примеры автоматизации:
1. Отправка уведомлений при создании сделки
2. Автоматическое создание задач
3. Изменение статуса при выполнении условий
4. Рассылка писем клиентам

## Настройка роботов:
1. Перейдите в CRM → Настройки → Автоматизация
2. Выберите нужную воронку
3. Нажмите "Добавить робот"
4. Настройте условия срабатывания
5. Выберите действие для выполнения`,
				order_index: 1,
				created_at: new Date().toISOString(),
			},
		],
	},
	5: {
		id: 5,
		title: 'Отчеты и аналитика',
		description: 'Создание отчетов и анализ данных в Битрикс24',
		order_index: 5,
		created_at: new Date().toISOString(),
		lessons: [
			{
				id: 7,
				course_id: 5,
				title: 'Виды отчетов',
				content: `# Виды отчетов в Битрикс24

## Стандартные отчеты:
- **Воронка продаж** — анализ этапов сделок
- **Динамика продаж** — продажи за период
- **Активность менеджеров** — производительность сотрудников
- **Конверсия лидов** — эффективность обработки

## Пользовательские отчеты:
Создавайте отчеты под ваши потребности:
1. Выберите источник данных
2. Настройте фильтры
3. Выберите поля для отображения
4. Настройте группировку
5. Сохраните отчет

## BI аналитика:
- Интерактивные дашборды
- Графики и диаграммы
- Сравнительный анализ
- Прогнозирование

## Автоматическая рассылка:
Настройте автоматическую отправку отчетов по расписанию руководителям и заинтересованным лицам.`,
				order_index: 1,
				created_at: new Date().toISOString(),
			},
		],
	},
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)

		// Пытаемся получить курс из Blob storage
		try {
			const course = await getCourseById(courseId)
			if (course) {
				console.log(`Получен курс ${courseId} из Blob storage`)
				return NextResponse.json({ course })
			}
		} catch (blobError) {
			console.log('Blob storage недоступен, используем статические данные')
		}

		// Fallback к статическим данным
		const staticCourse =
			staticCoursesData[courseId as keyof typeof staticCoursesData]
		if (staticCourse) {
			console.log(`Используем статический курс ${courseId}`)
			return NextResponse.json({ course: staticCourse })
		}

		return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
	} catch (error) {
		console.error('Ошибка получения курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)
		const { title, description } = await request.json()

		// Пытаемся обновить в Blob storage
		try {
			const course = await updateCourse(courseId, { title, description })
			return NextResponse.json({ course })
		} catch (blobError) {
			return NextResponse.json(
				{ error: 'Базы данных недоступны для обновления курса' },
				{ status: 503 }
			)
		}

		return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
	} catch (error) {
		console.error('Ошибка обновления курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)

		// Пытаемся удалить из Blob storage
		try {
			await deleteCourse(courseId)
			return NextResponse.json({ message: 'Курс удален' })
		} catch (blobError) {
			return NextResponse.json(
				{ error: 'Базы данных недоступны для удаления курса' },
				{ status: 503 }
			)
		}

		return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
	} catch (error) {
		console.error('Ошибка удаления курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
