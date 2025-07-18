import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { sql } from '@vercel/postgres'
import { Course } from '@/types'

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const resolvedParams = await params
		const courseId = parseInt(resolvedParams.id)

		const result = await sql`
			SELECT * FROM courses WHERE id = ${courseId}
		`

		if (result.rows.length === 0) {
			return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
		}

		const course = result.rows[0] as Course
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
		const { title, description, order_index } = await request.json()

		if (!title) {
			return NextResponse.json(
				{ error: 'Название курса обязательно' },
				{ status: 400 }
			)
		}

		const result = await sql`
			UPDATE courses 
			SET title = ${title}, description = ${description}, order_index = ${order_index}
			WHERE id = ${courseId}
			RETURNING *
		`

		if (result.rows.length === 0) {
			return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
		}

		const course = result.rows[0] as Course
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

		const result = await sql`
			DELETE FROM courses WHERE id = ${courseId}
		`

		if ((result.rowCount || 0) === 0) {
			return NextResponse.json({ error: 'Курс не найден' }, { status: 404 })
		}

		return NextResponse.json({ message: 'Курс удален' })
	} catch (error) {
		console.error('Ошибка удаления курса:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
