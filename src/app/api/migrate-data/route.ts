import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { seedBlobDatabase } from '@/lib/seed-blob'

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

		console.log('Начинаем миграцию данных в Blob storage...')

		try {
			console.log('Миграция данных в Blob storage...')
			await seedBlobDatabase()
			console.log('Blob storage миграция завершена')

			return NextResponse.json({
				success: true,
				message: 'Данные успешно загружены в Blob storage',
				timestamp: new Date().toISOString(),
				target: 'blob'
			})

		} catch (error) {
			console.error('Ошибка миграции в Blob storage:', error)
			
			return NextResponse.json({
				success: false,
				message: `Ошибка миграции в Blob storage: ${error}`,
				error: error,
				timestamp: new Date().toISOString(),
			}, { status: 500 })
		}

	} catch (error) {
		console.error('Общая ошибка миграции:', error)
		return NextResponse.json(
			{
				success: false,
				error: 'Ошибка миграции данных',
				details: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		)
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'API для миграции данных в Blob storage',
		endpoints: {
			'POST': 'Миграция в Blob storage',
			'POST ?force=true': 'Принудительная миграция с перезаписью',
		},
		example: '/api/migrate-data',
	})
}
