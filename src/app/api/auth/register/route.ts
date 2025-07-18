import { NextRequest, NextResponse } from 'next/server'
import {
	hashPassword,
	createJwtToken,
	getUserByEmailWithFallback,
	createUserWithFallback,
} from '@/lib/auth'

export async function POST(request: NextRequest) {
	try {
		const { email, password, name } = await request.json()

		if (!email || !password || !name) {
			return NextResponse.json(
				{ error: 'Все поля обязательны' },
				{ status: 400 }
			)
		}

		if (password.length < 6) {
			return NextResponse.json(
				{ error: 'Пароль должен содержать минимум 6 символов' },
				{ status: 400 }
			)
		}

		console.log('Попытка регистрации для:', email)

		// Проверяем, существует ли пользователь
		const existingUser = await getUserByEmailWithFallback(email)
		if (existingUser) {
			return NextResponse.json(
				{ error: 'Пользователь с таким email уже существует' },
				{ status: 409 }
			)
		}

		// Хешируем пароль
		const hashedPassword = await hashPassword(password)

		// Создаем пользователя
		const user = await createUserWithFallback({
			email,
			password: hashedPassword,
			name,
			is_admin: false,
		})

		const token = createJwtToken(user)

		const response = NextResponse.json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				is_admin: user.is_admin,
			},
			message: 'Регистрация выполнена успешно',
		})

		// Устанавливаем cookie с токеном
		response.cookies.set('auth-token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 24 * 60 * 60 * 1000, // 24 часа
		})

		console.log('Успешная регистрация пользователя:', user.email)
		return response
	} catch (error) {
		console.error('Ошибка регистрации:', error)

		// Проверяем, не является ли это ошибкой demo режима
		const errorMessage =
			error instanceof Error ? error.message : 'Внутренняя ошибка сервера'
		if (errorMessage.includes('demo режиме')) {
			return NextResponse.json({ error: errorMessage }, { status: 503 })
		}

		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
