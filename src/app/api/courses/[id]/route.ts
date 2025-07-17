import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import db from '@/lib/database'
import { Course } from '@/types'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)

		const course = db
			.prepare('SELECT * FROM courses WHERE id = ?')
			.get(courseId) as Course

		if (!course) {
			return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
		}

		return NextResponse.json({ course })
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
		const { title, description, image_url, order_index } = await request.json()

		if (!title) {
			return NextResponse.json(
				{ error: 'Название курса обязательно' },
				{ status: 400 }
			)
		}

		db.prepare(
			`
      UPDATE courses 
      SET title = ?, description = ?, image_url = ?, order_index = ?
      WHERE id = ?
    `
		).run(title, description, image_url, order_index, courseId)

		const course = db
			.prepare('SELECT * FROM courses WHERE id = ?')
			.get(courseId) as Course

		return NextResponse.json({ course })
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

		db.prepare('DELETE FROM courses WHERE id = ?').run(courseId)

		return NextResponse.json({ message: 'Курс удален' })
	} catch (error) {
		console.error('Ошибка удаления курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
