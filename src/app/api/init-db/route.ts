import { NextResponse } from 'next/server'
import { initializeDatabase } from '@/lib/blob-storage'
import { seedBlobDatabase } from '@/lib/seed-blob'

export async function POST(request: Request) {
	try {
		console.log('Начинаем инициализацию Blob storage...')

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

		if (!blobAvailable) {
			return NextResponse.json({
				message: 'Ошибка: Blob storage недоступен. Проверьте BLOB_READ_WRITE_TOKEN',
				error: true,
				blobAvailable: false,
				success: false,
			}, { status: 500 })
		}

		// Загружаем контент в Blob storage
		console.log('Загрузка контента в Blob storage...')
		try {
			await seedBlobDatabase()
			console.log('Контент загружен в Blob storage')
		} catch (seedError) {
			console.log('Ошибка загрузки контента в Blob storage:', seedError)
			return NextResponse.json({
				message: 'Ошибка загрузки контента в Blob storage',
				error: seedError,
				success: false,
			}, { status: 500 })
		}

		console.log('Blob storage успешно инициализирован с контентом')

		return NextResponse.json({
			message: 'Blob storage инициализирован и контент загружен успешно',
			blobAvailable: true,
			success: true,
		})
	} catch (error) {
		console.error('Ошибка инициализации Blob storage:', error)

		const errorMessage =
			error instanceof Error ? error.message : 'Unknown error'

		return NextResponse.json(
			{
				error: 'Ошибка инициализации Blob storage',
				details: errorMessage,
				success: false,
			},
			{ status: 500 }
		)
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Используйте POST для инициализации Blob storage',
		endpoint: '/api/init-db',
		method: 'POST',
	})
}
