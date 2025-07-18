import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createJwtToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json()

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email и пароль обязательны' },
				{ status: 400 }
			)
		}

		console.log('Попытка входа для:', email)

		const user = await authenticateUser(email, password)

		if (!user) {
			return NextResponse.json(
				{ error: 'Неверный email или пароль' },
				{ status: 401 }
			)
		}

		const token = createJwtToken(user)

		const response = NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
			},
			message: 'Вход выполнен успешно',
		})

		// Устанавливаем cookie с токеном
		response.cookies.set('auth-token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000, // 24 часа
		})

		console.log('Успешный вход для пользователя:', user.email)
		return response
	} catch (error) {
		console.error('Ошибка входа:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
