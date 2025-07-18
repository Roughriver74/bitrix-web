import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { seedBlobDatabase } from '@/lib/seed-blob'
import { seedPostgresDatabase } from '@/lib/seed-postgres'

export async function POST(request: NextRequest) {
	try {
		// Проверяем авторизацию админа
		const token = getAuthToken(request)
		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)
		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const { searchParams } = new URL(request.url)
		const force = searchParams.get('force') === 'true'
		const target = searchParams.get('target') || 'all' // 'blob', 'postgres', 'all'

		console.log('Начинаем принудительную миграцию данных...')

		const results = {
			blob: { success: false, message: '', error: null as any },
			postgres: { success: false, message: '', error: null as any },
		}

		// Миграция в Blob storage
		if (target === 'blob' || target === 'all') {
			try {
				console.log('Миграция данных в Blob storage...')
				await seedBlobDatabase()
				results.blob.success = true
				results.blob.message = 'Данные успешно загружены в Blob storage'
				console.log('Blob storage миграция завершена')
			} catch (error) {
				console.error('Ошибка миграции в Blob storage:', error)
				results.blob.error = error
				results.blob.message = `Ошибка миграции в Blob storage: ${error}`
			}
		}

		// Миграция в PostgreSQL
		if (target === 'postgres' || target === 'all') {
			try {
				console.log('Миграция данных в PostgreSQL...')
				await seedPostgresDatabase()
				results.postgres.success = true
				results.postgres.message = 'Данные успешно загружены в PostgreSQL'
				console.log('PostgreSQL миграция завершена')
			} catch (error) {
				console.error('Ошибка миграции в PostgreSQL:', error)
				results.postgres.error = error
				results.postgres.message = `Ошибка миграции в PostgreSQL: ${error}`
			}
		}

		const overallSuccess =
			(target === 'blob' && results.blob.success) ||
			(target === 'postgres' && results.postgres.success) ||
			(target === 'all' && (results.blob.success || results.postgres.success))

		return NextResponse.json({
			success: overallSuccess,
			message: 'Миграция данных завершена',
			details: results,
			timestamp: new Date().toISOString(),
		})
	} catch (error) {
		console.error('Ошибка миграции данных:', error)
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

export async function GET(request: NextRequest) {
	try {
		// Проверяем авторизацию админа
		const token = getAuthToken(request)
		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)
		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		return NextResponse.json({
			message: 'Эндпоинт для миграции данных',
			usage: {
				'POST ?target=blob': 'Миграция только в Blob storage',
				'POST ?target=postgres': 'Миграция только в PostgreSQL',
				'POST ?target=all': 'Миграция в обе базы данных (по умолчанию)',
				'POST ?force=true': 'Принудительная миграция (перезапись данных)',
			},
			examples: [
				'/api/migrate-data?target=blob',
				'/api/migrate-data?target=all&force=true',
			],
		})
	} catch (error) {
		console.error('Ошибка получения информации о миграции:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
