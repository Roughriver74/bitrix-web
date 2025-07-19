import { NextRequest, NextResponse } from 'next/server'
import { getAllCourses as getBlobCourses } from '@/lib/blob-storage'
import { getAllCourses as getLocalCourses } from '@/lib/local-storage'

export async function GET(request: NextRequest) {
	try {
		const status = {
			blob: { available: false, courses: 0, error: null as any },
			local: { available: false, courses: 0, error: null as any },
			recommendations: [] as string[],
		}

		// Проверяем Blob storage
		try {
			if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'blob_fake_token_for_development') {
				const blobCourses = await getBlobCourses()
				status.blob.available = true
				status.blob.courses = blobCourses.length
			} else {
				status.blob.error = 'BLOB_READ_WRITE_TOKEN не настроен или является заглушкой'
			}
		} catch (error) {
			console.error('Ошибка проверки Blob storage:', error)
			status.blob.error = error
		}

		// Проверяем локальную базу данных
		try {
			const localCourses = await getLocalCourses()
			status.local.available = true
			status.local.courses = localCourses.length
		} catch (error) {
			console.error('Ошибка проверки локальной базы данных:', error)
			status.local.error = error
		}

		// Генерируем рекомендации
		if (!status.blob.available && !status.local.available) {
			status.recommendations.push(
				'❌ Все базы данных недоступны. Проверьте настройки.'
			)
		} else if (!status.blob.available && status.local.available) {
			status.recommendations.push(
				'⚠️ Blob storage недоступен, используется локальная база данных.'
			)
		} else if (status.blob.available && status.blob.courses === 0) {
			status.recommendations.push(
				'🔄 Blob storage доступен, но пуст. Выполните миграцию данных.'
			)
		} else if (status.blob.available && status.blob.courses > 0) {
			status.recommendations.push(
				'✅ Blob storage настроен и содержит данные.'
			)
		}

		if (status.local.available && status.local.courses > 0) {
			status.recommendations.push(
				'📦 Локальная база данных содержит данные и готова к работе.'
			)
		}

		const hasData = (status.blob.available && status.blob.courses > 0) || 
		                (status.local.available && status.local.courses > 0)
		const isHealthy = status.blob.available || status.local.available

		return NextResponse.json({
			...status,
			overall: {
				healthy: isHealthy,
				hasData,
				message: hasData 
					? 'Система работает нормально' 
					: 'Система доступна, но требуется инициализация данных'
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
