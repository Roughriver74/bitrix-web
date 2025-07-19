'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Course } from '@/types'
import Link from 'next/link'

export default function AdminPage() {
	const { user, loading } = useAuth()
	const [courses, setCourses] = useState<Course[]>([])
	const [coursesLoading, setCoursesLoading] = useState(true)
	const [showCourseForm, setShowCourseForm] = useState(false)
	const [editingCourse, setEditingCourse] = useState<Course | null>(null)
	const [migrationStatus, setMigrationStatus] = useState<string>('')
	const [migrationLoading, setMigrationLoading] = useState(false)
	const [dataStatus, setDataStatus] = useState<any>(null)
	const [statusLoading, setStatusLoading] = useState(true)

	useEffect(() => {
		fetchCourses()
		fetchDataStatus()
	}, [])

	const fetchDataStatus = async () => {
		try {
			const response = await fetch('/api/data-status')
			if (response.ok) {
				const data = await response.json()
				setDataStatus(data.status)
			}
		} catch (error) {
			console.error('Ошибка загрузки статуса данных:', error)
		} finally {
			setStatusLoading(false)
		}
	}

	const fetchCourses = async () => {
		try {
			const response = await fetch('/api/courses')
			if (response.ok) {
				const data = await response.json()
				setCourses(data.courses)
			}
		} catch (error) {
			console.error('Ошибка загрузки курсов:', error)
		} finally {
			setCoursesLoading(false)
		}
	}

	const handleDeleteCourse = async (courseId: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот курс?')) {
			return
		}

		try {
			const response = await fetch(`/api/courses/${courseId}`, {
				method: 'DELETE',
			})

			if (response.ok) {
				setCourses(courses.filter(course => course.id !== courseId))
			}
		} catch (error) {
			console.error('Ошибка удаления курса:', error)
		}
	}

	const handleMigrateData = async () => {
		if (
			!confirm(
				'Вы уверены, что хотите мигрировать данные в Blob Storage? Это может занять некоторое время.'
			)
		) {
			return
		}

		setMigrationLoading(true)
		setMigrationStatus('Запуск миграции в Blob Storage...')

		try {
			const response = await fetch('/api/migrate-data?force=true', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			})

			const data = await response.json()

			if (response.ok && data.success) {
				setMigrationStatus('✅ Миграция в Blob Storage завершена успешно!')
				// Перезагружаем курсы и статус данных после миграции
				await fetchCourses()
				await fetchDataStatus()
			} else {
				setMigrationStatus(
					`❌ Ошибка миграции: ${data.error || 'Неизвестная ошибка'}`
				)
				console.error('Детали ошибки:', data.details)
			}
		} catch (error) {
			console.error('Ошибка миграции:', error)
			setMigrationStatus('❌ Ошибка соединения с сервером')
		} finally {
			setMigrationLoading(false)
			// Очищаем статус через 5 секунд
			setTimeout(() => setMigrationStatus(''), 5000)
		}
	}

	if (loading || coursesLoading) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-xl text-white'>Загрузка...</div>
			</div>
		)
	}

	if (!user || !user.is_admin) {
		return (
			<div className='min-h-screen bg-gray-900 flex items-center justify-center'>
				<div className='text-xl text-red-400'>Доступ запрещен</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gray-900'>
			<div className='container mx-auto px-4 py-8'>
				<div className='mb-6 md:mb-8'>
					<div className='flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-4'>
						<div>
							<h1 className='text-2xl md:text-3xl font-bold text-white'>Админ панель</h1>
							<p className='text-gray-300 text-sm md:text-base'>Управление курсами и уроками</p>
						</div>
						<div className='flex flex-wrap gap-2 md:space-x-2'>
							<Link
								href='/admin/tests'
								className='bg-green-600 text-white px-3 py-2 md:px-4 rounded text-sm md:text-base hover:bg-green-700 flex-1 md:flex-none text-center'
							>
								Управление тестами
							</Link>
							<Link
								href='/'
								className='bg-gray-600 text-white px-3 py-2 md:px-4 rounded text-sm md:text-base hover:bg-gray-700 flex-1 md:flex-none text-center'
							>
								На главную
							</Link>
						</div>
					</div>

					{/* Статус миграции */}
					{migrationStatus && (
						<div
							className={`mt-4 p-3 rounded-lg ${
								migrationStatus.includes('✅')
									? 'bg-green-900 text-green-200'
									: migrationStatus.includes('❌')
									? 'bg-red-900 text-red-200'
									: 'bg-blue-900 text-blue-200'
							}`}
						>
							{migrationStatus}
						</div>
					)}
				</div>

				{/* Статус баз данных */}
				<div className='bg-gray-800 rounded-lg shadow-md p-6 mb-8'>
					<h2 className='text-2xl font-semibold text-white mb-4'>
						Статус баз данных
					</h2>
					{statusLoading ? (
						<div className='text-gray-400'>Загрузка статуса...</div>
					) : dataStatus ? (
						<div className='space-y-4'>
							<div className='grid grid-cols-1 gap-4'>
								<div
									className={`p-4 rounded-lg ${
										dataStatus.blob.available ? 'bg-blue-900' : 'bg-red-900'
									}`}
								>
									<h3 className='text-lg font-medium text-white mb-2'>
										🔵 Vercel Blob Storage
									</h3>
									<p
										className={`text-sm ${
											dataStatus.blob.available
												? 'text-blue-200'
												: 'text-red-200'
										}`}
									>
										{dataStatus.blob.available
											? `✅ Доступен • ${dataStatus.blob.courses} курсов`
											: `❌ Недоступен • ${dataStatus.blob.error}`}
									</p>
								</div>
							</div>

							{dataStatus.recommendations.length > 0 && (
								<div className='bg-gray-700 p-4 rounded-lg'>
									<h4 className='text-white font-medium mb-2'>Рекомендации:</h4>
									<ul className='space-y-1'>
										{dataStatus.recommendations.map(
											(rec: string, index: number) => (
												<li key={index} className='text-gray-300 text-sm'>
													{rec}
												</li>
											)
										)}
									</ul>
								</div>
							)}
						</div>
					) : (
						<div className='text-red-400'>Ошибка загрузки статуса</div>
					)}
				</div>

				{/* Миграция данных */}
				<div className='bg-gray-800 rounded-lg shadow-md p-6 mb-8'>
					<h2 className='text-2xl font-semibold text-white mb-4'>
						Миграция данных
					</h2>
					<div className='flex justify-center'>
						<button
							onClick={handleMigrateData}
							disabled={migrationLoading}
							className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'
						>
							{migrationLoading ? 'Миграция...' : 'Загрузить в Blob Storage'}
						</button>
					</div>
					<p className='text-gray-400 text-sm mt-3 text-center'>
						Загружает курсы, уроки и тесты в Blob Storage. Используйте при пустой базе или проблемах с данными.
					</p>
				</div>

				{/* Управление курсами */}
				<div className='bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6 md:mb-8'>
					<div className='flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 mb-4 md:mb-6'>
						<h2 className='text-xl md:text-2xl font-semibold text-white'>Курсы</h2>
						<button
							onClick={() => setShowCourseForm(true)}
							className='bg-blue-600 text-white px-3 py-2 md:px-4 rounded text-sm md:text-base hover:bg-blue-700'
						>
							Добавить курс
						</button>
					</div>

					{courses.length === 0 ? (
						<p className='text-gray-400'>Нет курсов</p>
					) : (
						<div className='space-y-4'>
							{courses.map(course => (
								<div
									key={course.id}
									className='border border-gray-600 rounded-lg p-3 md:p-4 hover:bg-gray-700'
								>
									<div className='flex flex-col space-y-3 md:flex-row md:justify-between md:items-start md:space-y-0'>
										<div className='flex-1 min-w-0'>
											<h3 className='text-base md:text-lg font-semibold text-white mb-2 break-words'>
												{course.title}
											</h3>
											<p className='text-gray-300 text-sm md:text-base mb-2 break-words'>{course.description}</p>
											<div className='text-xs md:text-sm text-gray-400 flex flex-wrap gap-2'>
												<span>ID: {course.id}</span>
												<span className='hidden md:inline'>
													Создан: {new Date(course.created_at).toLocaleDateString()}
												</span>
											</div>
										</div>
										<div className='flex flex-wrap gap-2 md:flex-nowrap md:space-x-2 md:ml-4'>
											<button
												onClick={() => setEditingCourse(course)}
												className='bg-yellow-500 text-white px-2 py-1 md:px-3 rounded text-xs md:text-sm hover:bg-yellow-600 flex-1 md:flex-none'
											>
												Изменить
											</button>
											<Link
												href={`/admin/courses/${course.id}/lessons`}
												className='bg-green-500 text-white px-2 py-1 md:px-3 rounded text-xs md:text-sm hover:bg-green-600 flex-1 md:flex-none text-center'
											>
												Уроки
											</Link>
											<button
												onClick={() => handleDeleteCourse(course.id)}
												className='bg-red-500 text-white px-2 py-1 md:px-3 rounded text-xs md:text-sm hover:bg-red-600 flex-1 md:flex-none'
											>
												Удалить
											</button>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Статистика */}
				<div className='bg-gray-800 rounded-lg shadow-md p-6'>
					<h2 className='text-2xl font-semibold text-white mb-4'>Статистика</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						<div className='bg-blue-900 p-4 rounded-lg'>
							<h3 className='text-lg font-medium text-blue-200'>
								Всего курсов
							</h3>
							<p className='text-2xl font-bold text-blue-400'>
								{courses.length}
							</p>
						</div>
						<div className='bg-green-900 p-4 rounded-lg'>
							<h3 className='text-lg font-medium text-green-200'>
								Активных пользователей
							</h3>
							<p className='text-2xl font-bold text-green-400'>-</p>
						</div>
						<div className='bg-purple-900 p-4 rounded-lg'>
							<h3 className='text-lg font-medium text-purple-200'>
								Пройденных тестов
							</h3>
							<p className='text-2xl font-bold text-purple-400'>-</p>
						</div>
					</div>
				</div>
			</div>

			{/* Модальное окно для добавления/редактирования курса */}
			{(showCourseForm || editingCourse) && (
				<CourseFormModal
					course={editingCourse}
					onClose={() => {
						setShowCourseForm(false)
						setEditingCourse(null)
					}}
					onSave={() => {
						setShowCourseForm(false)
						setEditingCourse(null)
						fetchCourses()
					}}
				/>
			)}
		</div>
	)
}

interface CourseFormModalProps {
	course?: Course | null
	onClose: () => void
	onSave: () => void
}

function CourseFormModal({ course, onClose, onSave }: CourseFormModalProps) {
	const [title, setTitle] = useState(course?.title || '')
	const [description, setDescription] = useState(course?.description || '')
	const [orderIndex, setOrderIndex] = useState(course?.order_index || 0)
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)

		try {
			const url = course ? `/api/courses/${course.id}` : '/api/courses'
			const method = course ? 'PUT' : 'POST'

			const response = await fetch(url, {
				method,
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title,
					description,
					order_index: orderIndex,
				}),
			})

			if (response.ok) {
				onSave()
			}
		} catch (error) {
			console.error('Ошибка сохранения курса:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
			<div className='bg-gray-800 rounded-lg max-w-md w-full p-6'>
				<h3 className='text-lg font-semibold text-white mb-4'>
					{course ? 'Редактировать курс' : 'Добавить курс'}
				</h3>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Название
						</label>
						<input
							type='text'
							value={title}
							onChange={e => setTitle(e.target.value)}
							required
							className='w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Описание
						</label>
						<textarea
							value={description}
							onChange={e => setDescription(e.target.value)}
							rows={3}
							className='w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Порядок
						</label>
						<input
							type='number'
							value={orderIndex}
							onChange={e => setOrderIndex(parseInt(e.target.value) || 0)}
							className='w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white'
						/>
					</div>

					<div className='flex space-x-3'>
						<button
							type='submit'
							disabled={loading}
							className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300'
						>
							{loading ? 'Сохранение...' : 'Сохранить'}
						</button>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 bg-gray-600 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-700'
						>
							Отмена
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
