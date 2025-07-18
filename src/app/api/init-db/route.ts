import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/blob-storage'
import { seedBlobDatabase } from '@/lib/seed-blob'
import { checkBlobConnection as checkBlobEnv } from '@/lib/postgres-check'

export async function POST(request: Request) {
	try {
		// Проверяем подключение к Blob
		if (!checkBlobEnv()) {
			return NextResponse.json(
				{
					error: 'Vercel Blob не настроен',
					message: 'Отсутствует переменная окружения BLOB_READ_WRITE_TOKEN',
					requiredVars: ['BLOB_READ_WRITE_TOKEN', 'JWT_SECRET'],
					success: false,
				},
				{ status: 503 }
			)
		}

		const { searchParams } = new URL(request.url)
		const loadContent = searchParams.get('loadContent') === 'true'

		// Инициализируем базу данных
		await initializeDatabase()

		// Загружаем контент, если указан параметр
		if (loadContent) {
			await seedBlobDatabase()
		}

		return NextResponse.json({
			message: loadContent
				? 'База данных инициализирована и контент загружен успешно'
				: 'База данных инициализирована успешно',
			success: true,
		})
	} catch (error) {
		console.error('Ошибка инициализации базы данных:', error)
		return NextResponse.json(
			{
				error: 'Ошибка инициализации базы данных',
				details: error instanceof Error ? error.message : 'Unknown error',
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
