import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getAllCourses, createCourse } from '@/lib/blob-storage'
import { sql } from '@vercel/postgres'

// Статические курсы для локальной разработки
const staticCourses = [
	{
		id: 1,
		title: 'Основы работы с Битрикс24',
		description:
			'Изучение базовых возможностей платформы: CRM, задачи, проекты',
		order_index: 1,
		created_at: new Date().toISOString(),
	},
	{
		id: 2,
		title: 'CRM и управление клиентами',
		description: 'Работа с лидами, сделками, контактами и компаниями',
		order_index: 2,
		created_at: new Date().toISOString(),
	},
	{
		id: 3,
		title: 'Задачи и проекты',
		description: 'Планирование работы, создание задач и управление проектами',
		order_index: 3,
		created_at: new Date().toISOString(),
	},
	{
		id: 4,
		title: 'Автоматизация и роботы',
		description: 'Настройка автоматических процессов и бизнес-процессов',
		order_index: 4,
		created_at: new Date().toISOString(),
	},
	{
		id: 5,
		title: 'Отчеты и аналитика',
		description: 'Создание отчетов и анализ данных в Битрикс24',
		order_index: 5,
		created_at: new Date().toISOString(),
	},
]

export async function GET() {
	try {
		// Сначала пытаемся получить курсы из PostgreSQL
		try {
			const result = await sql`
        SELECT id, title, description, order_index, created_at 
        FROM courses 
        ORDER BY order_index ASC
      `

			if (result.rows.length > 0) {
				console.log(`Получено ${result.rows.length} курсов из PostgreSQL`)
				return NextResponse.json({ courses: result.rows })
			}
		} catch (postgresError) {
			console.log('PostgreSQL недоступен, пробуем Blob storage')
		}

		// Пытаемся получить из Blob storage
		try {
			const courses = await getAllCourses()
			if (courses.length > 0) {
				console.log(`Получено ${courses.length} курсов из Blob storage`)
				return NextResponse.json({ courses })
			}
		} catch (blobError) {
			console.log('Blob storage недоступен, используем статические данные')
		}

		// Fallback к статическим данным
		console.log(`Используем статические курсы для локальной разработки`)
		return NextResponse.json({ courses: staticCourses })
	} catch (error) {
		console.error('Ошибка получения курсов:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}

export async function POST(request: NextRequest) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const { title, description } = await request.json()

		if (!title) {
			return NextResponse.json(
				{ error: 'Название курса обязательно' },
				{ status: 400 }
			)
		}

		// Пытаемся создать курс в PostgreSQL
		try {
			const result = await sql`
        INSERT INTO courses (title, description, order_index)
        VALUES (${title}, ${description || ''}, 0)
        RETURNING id, title, description, order_index, created_at
      `

			const course = result.rows[0]
			return NextResponse.json({ course })
		} catch (postgresError) {
			console.log('PostgreSQL недоступен, создаем курс в Blob storage')

			// Fallback к Blob storage
			try {
				const course = await createCourse({
					title,
					description: description || '',
					order_index: 0,
				})

				return NextResponse.json({ course })
			} catch (blobError) {
				console.log('Blob storage недоступен')
				return NextResponse.json(
					{ error: 'Базы данных недоступны для создания курса' },
					{ status: 503 }
				)
			}
		}
	} catch (error) {
		console.error('Ошибка создания курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
