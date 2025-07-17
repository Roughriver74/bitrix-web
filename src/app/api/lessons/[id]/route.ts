import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import db from '@/lib/database'
import { Lesson } from '@/types'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const resolvedParams = await params
		const lessonId = parseInt(resolvedParams.id)

		const lesson = db
			.prepare('SELECT * FROM lessons WHERE id = ?')
			.get(lessonId) as Lesson

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

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const resolvedParams = await params
		const lessonId = parseInt(resolvedParams.id)
		const { title, content, order_index } = await request.json()

		if (!title || !content) {
			return NextResponse.json(
				{ error: 'Название и содержание обязательны' },
				{ status: 400 }
			)
		}

		db.prepare(
			`
      UPDATE lessons 
      SET title = ?, content = ?, order_index = ?
      WHERE id = ?
    `
		).run(title, content, order_index, lessonId)

		const lesson = db
			.prepare('SELECT * FROM lessons WHERE id = ?')
			.get(lessonId) as Lesson

		return NextResponse.json({ lesson })
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

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const resolvedParams = await params
		const lessonId = parseInt(resolvedParams.id)

		db.prepare('DELETE FROM lessons WHERE id = ?').run(lessonId)

		return NextResponse.json({ message: 'Урок удален' })
	} catch (error) {
		console.error('Ошибка удаления урока:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
