import { NextRequest, NextResponse } from 'next/server'
import { getAllCourses as getBlobCourses } from '@/lib/blob-storage'
import { createConnection } from '@/lib/postgres'

export async function GET(request: NextRequest) {
	try {
		const status = {
			blob: { available: false, courses: 0, error: null as any },
			postgres: { available: false, courses: 0, error: null as any },
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

		// Проверяем PostgreSQL
		try {
			if (process.env.POSTGRES_URL) {
				const sql = createConnection()
				const { rows } = await sql`SELECT COUNT(*) as count FROM courses`
				status.postgres.available = true
				status.postgres.courses = parseInt(rows[0].count)
			} else {
				status.postgres.error = 'POSTGRES_URL не настроен'
			}
		} catch (error) {
			console.error('Ошибка проверки PostgreSQL:', error)
			status.postgres.error = error
		}

		// Генерируем рекомендации
		if (!status.blob.available && !status.postgres.available) {
			status.recommendations.push(
				'❌ Ни одна база данных недоступна. Проверьте переменные окружения.'
			)
		}

		if (status.blob.available && status.blob.courses === 0) {
			status.recommendations.push(
				'🔵 Blob storage пуст. Рекомендуется загрузить данные.'
			)
		}

		if (status.postgres.available && status.postgres.courses === 0) {
			status.recommendations.push(
				'🟢 PostgreSQL пуст. Рекомендуется загрузить данные.'
			)
		}

		if (status.blob.courses > 0 && status.postgres.courses > 0) {
			status.recommendations.push('✅ Данные доступны в обеих базах.')
		} else if (status.blob.courses > 0 || status.postgres.courses > 0) {
			status.recommendations.push(
				'⚠️ Данные есть только в одной базе. Рекомендуется синхронизация.'
			)
		}

		if (status.blob.courses === 0 && status.postgres.courses === 0) {
			status.recommendations.push('🚨 Необходима немедленная миграция данных!')
		}

		return NextResponse.json({
			success: true,
			status,
			timestamp: new Date().toISOString(),
			needsMigration:
				status.blob.courses === 0 && status.postgres.courses === 0,
		})
	} catch (error) {
		console.error('Ошибка проверки статуса данных:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Внутренняя ошибка сервера',
				details: error,
			},
			{ status: 500 }
		)
	}
}
