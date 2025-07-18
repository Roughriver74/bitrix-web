import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json({ error: 'Токен не найден' }, { status: 401 })
		}

		const user = await getUserFromToken(token)

		if (!user) {
			return NextResponse.json(
				{ error: 'Пользователь не найден' },
				{ status: 401 }
			)
		}

		return NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
			},
		})
	} catch (error) {
		console.error('Ошибка проверки пользователя:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
