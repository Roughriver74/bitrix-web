import { NextResponse } from 'next/server'
import { createTables, createDefaultAdmin } from '@/lib/postgres'

export async function POST() {
	try {
		console.log('Начинаем инициализацию базы данных...')

		// Создаем таблицы
		console.log('Создание таблиц...')
		await createTables()

		// Создаем администраторов
		console.log('Создание администраторов...')
		await createDefaultAdmin()

		console.log('База данных успешно инициализирована')

		return NextResponse.json({
			message: 'База данных инициализирована успешно',
			success: true,
		})
	} catch (error) {
		console.error('Ошибка инициализации базы данных:', error)

		// Проверяем, не является ли ошибка дублированием (таблицы уже существуют)
		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'

		if (
			errorMessage.includes('already exists') ||
			errorMessage.includes('duplicate key')
		) {
			console.log('База данных уже инициализирована')
			return NextResponse.json({
				message: 'База данных уже инициализирована',
				success: true,
			})
		}

		return NextResponse.json(
			{
				error: 'Ошибка инициализации базы данных',
				details: errorMessage,
				success: false,
			},
			{ status: 500 }
		)
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Используйте POST для инициализации базы данных',
		endpoint: '/api/init-db',
		method: 'POST',
	})
}
