import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { sql } from '@vercel/postgres'

// Статические тесты для курсов
const staticTestsData = {
	1: {
		id: 1,
		course_id: 1,
		title: 'Тест: Основы работы с Битрикс24',
		description: 'Проверочный тест по основам Битрикс24',
		questions: [
			{
				id: 1,
				question: 'Что такое Битрикс24?',
				options: [
					'Только CRM система',
					'Комплексное решение для автоматизации бизнес-процессов',
					'Система управления сайтами',
					'Только система управления задачами',
				],
				correct_answer: 1,
			},
			{
				id: 2,
				question: 'Какие основные модули входят в Битрикс24?',
				options: [
					'Только CRM',
					'CRM и задачи',
					'CRM, задачи, документы, общение, сайты',
					'Только общение и документы',
				],
				correct_answer: 2,
			},
			{
				id: 3,
				question: 'Где находится главное меню в Битрикс24?',
				options: [
					'В верхней части экрана',
					'В правой панели',
					'В левой панели',
					'В нижней части экрана',
				],
				correct_answer: 2,
			},
			{
				id: 4,
				question: 'Что можно найти в верхней панели Битрикс24?',
				options: [
					'Только настройки',
					'Поиск, уведомления, быстрые действия, профиль',
					'Только уведомления',
					'Только профиль пользователя',
				],
				correct_answer: 1,
			},
			{
				id: 5,
				question: 'Для чего нужна персонализация рабочего стола?',
				options: [
					'Для украшения интерфейса',
					'Для повышения удобства работы',
					'Это не нужно',
					'Только для администраторов',
				],
				correct_answer: 1,
			},
		],
	},
	2: {
		id: 2,
		course_id: 2,
		title: 'Тест: CRM и управление клиентами',
		description: 'Проверочный тест по CRM модулю',
		questions: [
			{
				id: 6,
				question: 'Что означает аббревиатура CRM?',
				options: [
					'Customer Resource Management',
					'Customer Relationship Management',
					'Customer Record Management',
					'Customer Revenue Management',
				],
				correct_answer: 1,
			},
			{
				id: 7,
				question: 'Что такое лид в CRM?',
				options: [
					'Постоянный клиент',
					'Потенциальный клиент',
					'Сотрудник компании',
					'Продукт компании',
				],
				correct_answer: 1,
			},
			{
				id: 8,
				question: 'Какие основные сущности есть в CRM?',
				options: [
					'Только лиды',
					'Лиды и сделки',
					'Лиды, сделки, контакты, компании',
					'Только контакты',
				],
				correct_answer: 2,
			},
			{
				id: 9,
				question: 'Что такое воронка продаж?',
				options: [
					'Список всех клиентов',
					'Этапы прохождения сделки от лида до закрытия',
					'Отчет по продажам',
					'База данных товаров',
				],
				correct_answer: 1,
			},
			{
				id: 10,
				question: 'Какие лиды считаются "горячими"?',
				options: [
					'Новые лиды',
					'Лиды с большим бюджетом',
					'Лиды, готовые к покупке сейчас',
					'Старые лиды',
				],
				correct_answer: 2,
			},
		],
	},
	3: {
		id: 3,
		course_id: 3,
		title: 'Тест: Задачи и проекты',
		description: 'Проверочный тест по управлению задачами',
		questions: [
			{
				id: 11,
				question: 'Какие статусы могут быть у задач?',
				options: [
					'Только новая и завершена',
					'Новая, в работе, завершена',
					'Новая, в работе, ждет контроля, завершена, отложена',
					'Только в работе',
				],
				correct_answer: 2,
			},
			{
				id: 12,
				question: 'Что означает приоритет "Критичный" у задачи?',
				options: [
					'Можно выполнить когда-нибудь',
					'Требует немедленного выполнения',
					'Обычная задача',
					'Низкоприоритетная задача',
				],
				correct_answer: 1,
			},
			{
				id: 13,
				question: 'Кого можно добавить к задаче?',
				options: [
					'Только ответственного',
					'Ответственного и наблюдателей',
					'Только наблюдателей',
					'Никого нельзя добавлять',
				],
				correct_answer: 1,
			},
		],
	},
	4: {
		id: 4,
		course_id: 4,
		title: 'Тест: Автоматизация и роботы',
		description: 'Проверочный тест по автоматизации процессов',
		questions: [
			{
				id: 14,
				question: 'Что такое автоматизация в Битрикс24?',
				options: [
					'Ручное выполнение действий',
					'Выполнение действий системой без участия человека',
					'Только отправка email',
					'Создание отчетов',
				],
				correct_answer: 1,
			},
			{
				id: 15,
				question: 'Какие типы автоматизации есть в Битрикс24?',
				options: [
					'Только роботы',
					'Роботы, бизнес-процессы, триггеры',
					'Только триггеры',
					'Только бизнес-процессы',
				],
				correct_answer: 1,
			},
			{
				id: 16,
				question: 'Где настраивается автоматизация?',
				options: [
					'В настройках профиля',
					'CRM → Настройки → Автоматизация',
					'В главном меню',
					'В отчетах',
				],
				correct_answer: 1,
			},
		],
	},
	5: {
		id: 5,
		course_id: 5,
		title: 'Тест: Отчеты и аналитика',
		description: 'Проверочный тест по отчетам и аналитике',
		questions: [
			{
				id: 17,
				question: 'Какие виды отчетов есть в Битрикс24?',
				options: [
					'Только стандартные',
					'Стандартные и пользовательские',
					'Только пользовательские',
					'Отчетов нет',
				],
				correct_answer: 1,
			},
			{
				id: 18,
				question: 'Что показывает отчет "Воронка продаж"?',
				options: [
					'Список всех клиентов',
					'Анализ этапов сделок',
					'Финансовые показатели',
					'Список товаров',
				],
				correct_answer: 1,
			},
			{
				id: 19,
				question: 'Что такое BI аналитика?',
				options: [
					'Простые таблицы',
					'Интерактивные дашборды с графиками',
					'Текстовые отчеты',
					'Email рассылки',
				],
				correct_answer: 1,
			},
		],
	},
}

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json(
				{ error: 'Необходима авторизация' },
				{ status: 401 }
			)
		}

		const user = await getUserFromToken(token)
		if (!user) {
			return NextResponse.json(
				{ error: 'Пользователь не найден' },
				{ status: 401 }
			)
		}

		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)

		// Пытаемся получить тест из PostgreSQL
		try {
			const testResult = await sql`
        SELECT t.*, array_agg(
          json_build_object(
            'id', tq.id,
            'question', tq.question,
            'options', tq.options::json,
            'correct_answer', tq.correct_answer
          ) ORDER BY tq.order_index
        ) as questions
        FROM tests t
        LEFT JOIN test_questions tq ON t.id = tq.test_id
        WHERE t.course_id = ${courseId}
        GROUP BY t.id
      `

			if (testResult.rows.length > 0) {
				const test = testResult.rows[0]
				console.log(`Получен тест для курса ${courseId} из PostgreSQL`)
				return NextResponse.json({ test })
			}
		} catch (postgresError) {
			console.log('PostgreSQL недоступен, используем статические данные')
		}

		// Fallback к статическим данным
		const staticTest = staticTestsData[courseId as keyof typeof staticTestsData]
		if (staticTest) {
			console.log(`Используем статический тест для курса ${courseId}`)
			return NextResponse.json({ test: staticTest })
		}

		return NextResponse.json(
			{ error: 'Тест для данного курса не найден' },
			{ status: 404 }
		)
	} catch (error) {
		console.error('Ошибка получения теста:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json(
				{ error: 'Необходима авторизация' },
				{ status: 401 }
			)
		}

		const user = await getUserFromToken(token)
		if (!user) {
			return NextResponse.json(
				{ error: 'Пользователь не найден' },
				{ status: 401 }
			)
		}

		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)
		const { answers } = await request.json()

		// Получаем правильные ответы
		const staticTest = staticTestsData[courseId as keyof typeof staticTestsData]
		if (!staticTest) {
			return NextResponse.json({ error: 'Тест не найден' }, { status: 404 })
		}

		// Подсчитываем результат
		let correctAnswers = 0
		const totalQuestions = staticTest.questions.length

		staticTest.questions.forEach((question, index) => {
			if (answers[index] === question.correct_answer) {
				correctAnswers++
			}
		})

		const score = Math.round((correctAnswers / totalQuestions) * 100)

		// Здесь можно сохранить результат в базу данных
		const result = {
			courseId,
			userId: user.id,
			score,
			correctAnswers,
			totalQuestions,
			answers,
			completedAt: new Date().toISOString(),
		}

		return NextResponse.json({
			message: 'Тест завершен',
			result,
		})
	} catch (error) {
		console.error('Ошибка обработки результатов теста:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
