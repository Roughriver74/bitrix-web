import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getLessonById, updateLesson, deleteLesson } from '@/lib/postgres'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params
		const lesson = await getLessonById(parseInt(id))

		if (!lesson) {
			return NextResponse.json({ error: 'Урок не найден' }, { status: 404 })
		}

		return NextResponse.json({ lesson })
	} catch (error) {
		console.error('Ошибка получения урока:', error)
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

		const user = getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const { id } = await params
		const { title, content, order_index } = await request.json()

		const lesson = await updateLesson(parseInt(id), {
			title,
			content,
			order_index,
		})

		if (!lesson) {
			return NextResponse.json({ error: 'Урок не найден' }, { status: 404 })
		}

		return NextResponse.json({
			message: 'Урок обновлен успешно',
			lesson,
		})
	} catch (error) {
		console.error('Ошибка обновления урока:', error)
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

		const user = getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const { id } = await params
		const success = await deleteLesson(parseInt(id))

		if (!success) {
			return NextResponse.json({ error: 'Урок не найден' }, { status: 404 })
		}

		return NextResponse.json({
			message: 'Урок удален успешно',
		})
	} catch (error) {
		console.error('Ошибка удаления урока:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
