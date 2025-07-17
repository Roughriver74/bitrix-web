'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState, useCallback } from 'react'
import MarkdownRenderer from '@/components/MarkdownRenderer'

interface Course {
	id: number
	title: string
	description: string
	order_index: number
	created_at: string
}

interface Lesson {
	id: number
	course_id: number
	title: string
	content: string
	order_index: number
	created_at: string
}

export default function CoursePage() {
	const params = useParams()
	const courseId = params.id as string
	const { user, loading } = useAuth()
	const [course, setCourse] = useState<Course | null>(null)
	const [lessons, setLessons] = useState<Lesson[]>([])
	const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
	const [loadingContent, setLoadingContent] = useState(true)

	const fetchCourse = useCallback(async () => {
		if (!courseId) return
		try {
			const response = await fetch(`/api/courses/${courseId}`)
			if (response.ok) {
				const data = await response.json()
				setCourse(data)
			}
		} catch (error) {
			console.error('Ошибка загрузки курса:', error)
		}
	}, [courseId])

	const fetchLessons = useCallback(async () => {
		if (!courseId) return
		try {
			const response = await fetch(`/api/courses/${courseId}/lessons`)
			if (response.ok) {
				const data = await response.json()
				setLessons(data)
				if (data.length > 0) {
					setCurrentLesson(data[0])
				}
			}
		} catch (error) {
			console.error('Ошибка загрузки уроков:', error)
		} finally {
			setLoadingContent(false)
		}
	}, [courseId])

	useEffect(() => {
		if (user && courseId) {
			fetchCourse()
			fetchLessons()
		}
	}, [user, courseId, fetchCourse, fetchLessons])

	if (loading || loadingContent) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
				<div className='text-xl text-white'>Загрузка...</div>
			</div>
		)
	}

	if (!user) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-white mb-4'>
						Необходима авторизация
					</h2>
					<Link href='/' className='text-blue-400 hover:text-blue-300'>
						Вернуться на главную
					</Link>
				</div>
			</div>
		)
	}

	if (!course) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-white mb-4'>Курс не найден</h2>
					<Link href='/modules' className='text-blue-400 hover:text-blue-300'>
						Назад к модулям
					</Link>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
			<div className='container mx-auto px-4 py-8'>
				<nav className='flex justify-between items-center mb-8'>
					<Link href='/modules' className='text-blue-400 hover:text-blue-300'>
						← Назад к модулям
					</Link>
					<div className='text-lg font-semibold text-white'>{user?.name}</div>
				</nav>

				<div className='grid lg:grid-cols-4 gap-8'>
					{/* Боковая панель с навигацией */}
					<div className='lg:col-span-1'>
						<div className='bg-gray-800 rounded-lg shadow-lg p-6 sticky top-8'>
							<h2 className='text-xl font-bold text-white mb-4'>
								{course.title}
							</h2>
							<p className='text-gray-300 mb-6 text-sm'>{course.description}</p>

							<div className='space-y-3'>
								<h3 className='font-semibold text-white mb-3'>Уроки:</h3>
								{lessons.map(lesson => (
									<button
										key={lesson.id}
										onClick={() => setCurrentLesson(lesson)}
										className={`w-full text-left p-3 rounded-lg transition-colors ${
											currentLesson?.id === lesson.id
												? 'bg-blue-900 text-blue-200 border-l-4 border-blue-400'
												: 'hover:bg-gray-700 text-gray-300'
										}`}
									>
										<div className='font-medium'>{lesson.title}</div>
										<div className='text-sm text-gray-400'>
											Урок {lesson.order_index}
										</div>
									</button>
								))}
							</div>

							<div className='mt-8 pt-6 border-t'>
								<Link
									href={`/courses/${courseId}/test`}
									className='w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-center block'
								>
									Пройти тест
								</Link>
							</div>
						</div>
					</div>

					{/* Основной контент */}
					<div className='lg:col-span-3'>
						<div className='bg-gray-800 rounded-lg shadow-lg'>
							{currentLesson ? (
								<div className='p-8'>
									<div className='flex items-center justify-between mb-6'>
										<h1 className='text-3xl font-bold text-white'>
											{currentLesson.title}
										</h1>
										<div className='text-sm text-gray-400'>
											Урок {currentLesson.order_index}
										</div>
									</div>

									<MarkdownRenderer content={currentLesson.content} />

									<div className='mt-8 pt-6 border-t flex justify-between items-center'>
										<div className='flex space-x-4'>
											{lessons.findIndex(l => l.id === currentLesson.id) >
												0 && (
												<button
													onClick={() => {
														const currentIndex = lessons.findIndex(
															l => l.id === currentLesson.id
														)
														setCurrentLesson(lessons[currentIndex - 1])
													}}
													className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors'
												>
													← Предыдущий урок
												</button>
											)}
											{lessons.findIndex(l => l.id === currentLesson.id) <
												lessons.length - 1 && (
												<button
													onClick={() => {
														const currentIndex = lessons.findIndex(
															l => l.id === currentLesson.id
														)
														setCurrentLesson(lessons[currentIndex + 1])
													}}
													className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors'
												>
													Следующий урок →
												</button>
											)}
										</div>

										<div className='text-sm text-gray-400'>
											{lessons.findIndex(l => l.id === currentLesson.id) + 1} из{' '}
											{lessons.length}
										</div>
									</div>
								</div>
							) : (
								<div className='p-8 text-center'>
									<h2 className='text-2xl font-bold text-white mb-4'>
										Уроки не найдены
									</h2>
									<p className='text-gray-300'>
										Для этого курса пока нет доступных уроков
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
