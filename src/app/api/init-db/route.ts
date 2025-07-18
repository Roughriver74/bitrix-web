import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/blob-storage'
import { seedBlobDatabase } from '@/lib/seed-blob'
import { createTables, createDefaultAdmin } from '@/lib/postgres'

export async function POST(request: Request) {
	try {
		console.log('Начинаем инициализацию баз данных...')

		const { searchParams } = new URL(request.url)
		const loadContent = searchParams.get('loadContent') === 'true'

		// Инициализируем Blob storage для пользователей
		console.log('Инициализация Blob storage...')
		await initializeDatabase()

		// Создаем таблицы PostgreSQL для контента (курсы, уроки, тесты)
		try {
			console.log('Создание таблиц PostgreSQL...')
			await createTables()
			await createDefaultAdmin()
		} catch (pgError) {
			console.log('PostgreSQL недоступен, пропускаем создание таблиц')
		}

		// Загружаем контент, если указан параметр
		if (loadContent) {
			console.log('Загрузка контента...')
			await seedBlobDatabase()
		}

		console.log('База данных успешно инициализирована')

		return NextResponse.json({
			message: loadContent
				? 'База данных инициализирована и контент загружен успешно'
				: 'База данных инициализирована успешно',
			success: true,
		})
	} catch (error) {
		console.error('Ошибка инициализации базы данных:', error)

		// Проверяем, не является ли ошибка дублированием (таблицы уже существуют)
		const errorMessage = error instanceof Error ? error.message : 'Unknown error'

		if (errorMessage.includes('already exists') || errorMessage.includes('duplicate key')) {
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
