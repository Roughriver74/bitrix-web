import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
	try {
		const token = getAuthToken(request)

		if (!token) {
			return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
		}

		const user = await getUserFromToken(token)

		if (!user || !user.is_admin) {
			return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 })
		}

		const formData = await request.formData()
		const file = formData.get('file') as File

		if (!file) {
			return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 })
		}

		// Проверяем тип файла
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ error: 'Неподдерживаемый тип файла' },
				{ status: 400 }
			)
		}

		// Создаем уникальное имя файла
		const timestamp = Date.now()
		const fileName = `${timestamp}_${file.name}`
		const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
		const filePath = path.join(uploadsDir, fileName)

		// Создаем папку uploads, если она не существует
		try {
			await mkdir(uploadsDir, { recursive: true })
		} catch {
			// Папка уже существует, игнорируем ошибку
		}

		// Создаем буфер из файла
		const buffer = Buffer.from(await file.arrayBuffer())

		// Сохраняем файл
		await writeFile(filePath, buffer)

		const fileUrl = `/api/uploads/${fileName}`

		return NextResponse.json({
			message: 'Файл успешно загружен',
			url: fileUrl,
		})
	} catch (error) {
		console.error('Ошибка загрузки файла:', error)
		return NextResponse.json(
			{ error: 'Внутренняя ошибка сервера' },
			{ status: 500 }
		)
	}
}
