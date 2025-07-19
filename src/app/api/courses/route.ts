import { NextRequest, NextResponse } from 'next/server'
import { getAuthToken, getUserFromToken } from '@/lib/auth'
import { getAllCourses as getBlobCourses, createCourse as createBlobCourse } from '@/lib/blob-storage'
import { getAllCourses as getLocalCourses, createCourse as createLocalCourse } from '@/lib/local-storage'

export async function GET() {
	try {
		// Пытаемся получить из Blob storage
		try {
			if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'blob_fake_token_for_development') {
				const courses = await getBlobCourses()
				if (courses.length > 0) {
					console.log(`Получено ${courses.length} курсов из Blob storage`)
					return NextResponse.json({ courses })
				}
			}
		} catch (blobError) {
			console.log('Blob storage недоступен, используем локальную базу данных')
		}

		// Fallback к локальной базе данных
		console.log(`Используем локальную базу данных`)
		const courses = await getLocalCourses()
		return NextResponse.json({ courses })
	} catch (error) {
		console.error('Ошибка получения курсов:', error)
		return NextResponse.json(
			{ error: 'Ошибка получения курсов' },
			{ status: 500 }
		)
	}
}

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

		const { title, description, order_index } = await request.json()

		if (!title || !description) {
			return NextResponse.json(
				{ error: 'Название и описание обязательны' },
				{ status: 400 }
			)
		}

		try {
			// Пытаемся создать в Blob storage
			if (process.env.BLOB_READ_WRITE_TOKEN && process.env.BLOB_READ_WRITE_TOKEN !== 'blob_fake_token_for_development') {
				const newCourse = await createBlobCourse({
					title,
					description,
					order_index: order_index || Date.now(),
				})
				return NextResponse.json({ course: newCourse }, { status: 201 })
			}
		} catch (blobError) {
			console.log('Blob storage недоступен, используем локальную базу данных')
		}

		// Fallback к локальной базе данных
		const newCourse = await createLocalCourse({
			title,
			description,
			order_index: order_index || Date.now(),
		})

		return NextResponse.json({ course: newCourse }, { status: 201 })
	} catch (error) {
		console.error('Ошибка создания курса:', error)
		return NextResponse.json(
			{ error: 'Ошибка создания курса' },
			{ status: 500 }
		)
	}
}
