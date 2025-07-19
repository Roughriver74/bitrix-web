import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getCourseById } from '@/lib/blob-storage'

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url)
		const courseId = searchParams.get('course_id')

		if (!courseId) {
			return NextResponse.json(
				{ error: 'course_id параметр обязателен' },
				{ status: 400 }
			)
		}

		// Получаем курс с уроками
		const course = await getCourseById(parseInt(courseId))
		
		if (!course) {
			return NextResponse.json({ lessons: [] })
		}

		return NextResponse.json({ lessons: course.lessons || [] })
	} catch (error) {
		console.error('Ошибка получения уроков:', error)
		return NextResponse.json({ lessons: [] })
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

		// Пока что возвращаем заглушку для создания уроков
		// В будущем можно реализовать создание уроков через blob storage
		return NextResponse.json({ 
			message: 'Создание уроков через blob storage пока не реализовано' 
		}, { status: 501 })
	} catch (error) {
		console.error('Ошибка создания урока:', error)
		return NextResponse.json(
			{ error: 'Ошибка создания урока' },
			{ status: 500 }
		)
	}
}