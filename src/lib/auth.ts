import { NextRequest } from 'next/server'
import { User } from '@/types'
import * as jwt from 'jsonwebtoken'
import * as bcrypt from 'bcryptjs'
import { getUserByEmail, createUser, getUserById } from './blob-storage'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-demo'

// Локальные пользователи для демонстрации (когда Blob storage недоступен)
const localUsers: User[] = [
	{
		id: 1,
		email: 'admin@bitrix24course.ru',
		name: 'Администратор',
		password: '$2b$10$CQ4XxONqRnpm0Uu4mzyvG.wgCGkSnsxVx7g1GlXTtx2WPajRe6gc6', // admin123
		is_admin: true,
		created_at: new Date().toISOString(),
	},
	{
		id: 2,
		email: 'roughriver74@gmail.com',
		name: 'Евгений',
		password: '$2b$10$jegj2a5guUvkodAKgYnSduAAUiLtJ8bXBCg5XxBkdW/RX2w.ETFcy', // bitrix2024
		is_admin: true,
		created_at: new Date().toISOString(),
	},
	{
		id: 3,
		email: 'user@example.com',
		name: 'Пользователь',
		password: '$2b$10$CQ4XxONqRnpm0Uu4mzyvG.wgCGkSnsxVx7g1GlXTtx2WPajRe6gc6', // admin123
		is_admin: false,
		created_at: new Date().toISOString(),
	},
]

// Функция для хеширования пароля
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10)
}

// Функция для проверки пароля
export async function verifyPassword(
	password: string,
	hash: string
): Promise<boolean> {
	return bcrypt.compare(password, hash)
}

// Создание JWT токена
export function createJwtToken(user: User): string {
	return jwt.sign(
		{
			id: user.id,
			email: user.email,
			name: user.name,
			is_admin: user.is_admin,
		},
		JWT_SECRET,
		{ expiresIn: '24h' }
	)
}

// Получение пользователя по email (с fallback к локальным данным)
export async function getUserByEmailWithFallback(
	email: string
): Promise<User | null> {
	try {
		// Пытаемся получить из Blob storage
		return await getUserByEmail(email)
	} catch (error) {
		console.log('Blob storage недоступен, используем локальные данные')

		// Fallback к локальным данным
		const user = localUsers.find(u => u.email === email)
		return user || null
	}
}

// Получение пользователя по ID (с fallback к локальным данным)
export async function getUserByIdWithFallback(
	id: number
): Promise<User | null> {
	try {
		// Пытаемся получить из Blob storage
		return await getUserById(id)
	} catch (error) {
		console.log('Blob storage недоступен, используем локальные данные')

		// Fallback к локальным данным
		const user = localUsers.find(u => u.id === id)
		return user || null
	}
}

// Создание пользователя (с fallback к локальным данным)
export async function createUserWithFallback(
	userData: Omit<User, 'id' | 'created_at'>
): Promise<User> {
	try {
		// Пытаемся создать в Blob storage
		return await createUser(userData)
	} catch (error) {
		console.log(
			'Blob storage недоступен, создание пользователя недоступно в demo режиме'
		)
		throw new Error('Регистрация недоступна в demo режиме')
	}
}

// Аутентификация пользователя
export async function authenticateUser(
	email: string,
	password: string
): Promise<User | null> {
	try {
		const user = await getUserByEmailWithFallback(email)

		if (!user) {
			return null
		}

		const isValidPassword = await verifyPassword(password, user.password)
		if (!isValidPassword) {
			return null
		}

		return user
	} catch (error) {
		console.error('Ошибка аутентификации:', error)
		return null
	}
}

// Получение токена из заголовков
export function getAuthToken(request: NextRequest): string | null {
	const authHeader = request.headers.get('authorization')
	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.substring(7)
	}

	// Проверяем cookie
	const token = request.cookies.get('auth-token')?.value
	return token || null
}

// Получение пользователя из токена
export async function getUserFromToken(token: string): Promise<User | null> {
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as any
		const user = await getUserByIdWithFallback(decoded.id)
		return user
	} catch (error) {
		console.error('Ошибка верификации токена:', error)
		return null
	}
}

// Проверка, является ли пользователь администратором
export function isAdmin(user: User | null): boolean {
	return user?.is_admin === true
}
