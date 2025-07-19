import { NextRequest, NextResponse } from 'next/server'
import { getAllCourses as getBlobCourses } from '@/lib/blob-storage'

export async function GET(request: NextRequest) {
	try {
		const status = {
			blob: { available: false, courses: 0, error: null as any },
			recommendations: [] as string[],
		}

		// Проверяем Blob storage
		try {
			if (process.env.BLOB_READ_WRITE_TOKEN) {
				const blobCourses = await getBlobCourses()
				status.blob.available = true
				status.blob.courses = blobCourses.length
			} else {
				status.blob.error = 'BLOB_READ_WRITE_TOKEN не настроен'
			}
		} catch (error) {
			console.error('Ошибка проверки Blob storage:', error)
			status.blob.error = error
		}

		// Генерируем рекомендации
		if (!status.blob.available) {
			status.recommendations.push(
				'❌ Blob storage недоступен. Проверьте переменную BLOB_READ_WRITE_TOKEN.'
			)
		}

		if (status.blob.available && status.blob.courses === 0) {
			status.recommendations.push(
				'🔄 Blob storage доступен, но пуст. Выполните миграцию данных.'
			)
		}

		if (status.blob.available && status.blob.courses > 0) {
			status.recommendations.push(
				'✅ Blob storage настроен и содержит данные.'
			)
		}

		const hasData = status.blob.available && status.blob.courses > 0

		return NextResponse.json({
			...status,
			overall: {
				healthy: status.blob.available,
				hasData,
				message: hasData 
					? 'Система работает нормально' 
					: 'Требуется настройка или миграция данных'
			}
		})
	} catch (error) {
		console.error('Ошибка проверки статуса:', error)
		return NextResponse.json(
			{ 
				error: 'Ошибка проверки статуса баз данных',
				details: error instanceof Error ? error.message : 'Unknown error'
			},
			{ status: 500 }
		)
	}
}
