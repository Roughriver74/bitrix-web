import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/blob-storage'
import { seedBlobDatabase } from '@/lib/seed-blob'
import { createTables, createDefaultAdmin } from '@/lib/postgres'
import { seedPostgresDatabase } from '@/lib/seed-postgres'

export async function POST(request: Request) {
	try {
		console.log('Начинаем инициализацию баз данных...')

		const { searchParams } = new URL(request.url)
		const loadContent = searchParams.get('loadContent') === 'true'

		// Проверяем доступность Blob storage
		let blobAvailable = false
		try {
			console.log('Проверка доступности Blob storage...')
			if (process.env.BLOB_READ_WRITE_TOKEN) {
				await initializeDatabase()
				blobAvailable = true
				console.log('Blob storage доступен')
			} else {
				console.log('Blob storage недоступен (нет токена)')
			}
		} catch (blobError) {
			console.log('Blob storage недоступен:', blobError)
		}

		// Создаем таблицы PostgreSQL для контента (курсы, уроки, тесты)
		let postgresAvailable = false
		try {
			console.log('Создание таблиц PostgreSQL...')
			await createTables()
			await createDefaultAdmin()
			postgresAvailable = true
			console.log('PostgreSQL подключен успешно')
		} catch (pgError) {
			console.log('PostgreSQL недоступен, пропускаем создание таблиц')
		}

		// Загружаем контент (всегда загружаем при инициализации)
		console.log('Загрузка контента...')

		// Загружаем в Blob storage, если доступен
		if (blobAvailable) {
			try {
				await seedBlobDatabase()
				console.log('Контент загружен в Blob storage')
			} catch (seedError) {
				console.log('Ошибка загрузки контента в Blob storage:', seedError)
			}
		}

		// Загружаем в PostgreSQL, если доступен
		if (postgresAvailable) {
			try {
				await seedPostgresDatabase()
				console.log('Контент загружен в PostgreSQL')
			} catch (seedError) {
				console.log('Ошибка загрузки контента в PostgreSQL:', seedError)
			}
		}

		if (!blobAvailable && !postgresAvailable) {
			return NextResponse.json({
				message: 'Предупреждение: ни Blob storage, ни PostgreSQL не доступны',
				warning: true,
				blobAvailable: false,
				postgresAvailable: false,
				success: true,
			})
		}

		console.log('База данных успешно инициализирована с контентом')

		return NextResponse.json({
			message: 'База данных инициализирована и контент загружен успешно',
			blobAvailable,
			postgresAvailable,
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
