import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getAllCourses, createCourse } from '@/lib/blob-storage'

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
			{ error: 'Ошибка получения курсов' },
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

		if (!title || !description) {
			return NextResponse.json(
				{ error: 'Название и описание обязательны' },
				{ status: 400 }
			)
		}

		try {
			const newCourse = await createCourse({
				title,
				description,
				order_index: Date.now(), // Простой способ генерации порядка
			})

			return NextResponse.json({ course: newCourse }, { status: 201 })
		} catch (blobError) {
			console.log('Blob storage недоступен')
			return NextResponse.json(
				{ error: 'База данных недоступна' },
				{ status: 503 }
			)
		}
	} catch (error) {
		console.error('Ошибка создания курса:', error)
		return NextResponse.json(
			{ error: 'Ошибка создания курса' },
			{ status: 500 }
		)
	}
}
