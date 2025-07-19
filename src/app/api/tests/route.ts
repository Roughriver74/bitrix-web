import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getAllCourses } from '@/lib/blob-storage'

export async function GET() {
	try {
		// Получаем все курсы с тестами
		const courses = await getAllCourses()
		
		// Извлекаем тесты из всех курсов
		const tests = courses
			.filter(course => course.test)
			.map(course => ({
				...course.test!,
				course_title: course.title
			}))

		return NextResponse.json({ tests })
	} catch (error) {
		console.error('Ошибка получения тестов:', error)
		
		// Fallback к пустому массиву
		return NextResponse.json({ tests: [] })
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

		// Пока что возвращаем заглушку для создания тестов
		// В будущем можно реализовать создание тестов через blob storage
		return NextResponse.json({ 
			message: 'Создание тестов через blob storage пока не реализовано' 
		}, { status: 501 })
	} catch (error) {
		console.error('Ошибка создания теста:', error)
		return NextResponse.json(
			{ error: 'Ошибка создания теста' },
			{ status: 500 }
		)
	}
}