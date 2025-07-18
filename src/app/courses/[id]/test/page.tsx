'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useEffect, useState } from 'react'

interface Question {
	id: number
	question: string
	options: string[]
	correct_answer: number
}

interface Test {
	id: number
	course_id: number
	title: string
	description: string
	questions: Question[]
}

interface TestResult {
	courseId: number
	userId: number
	score: number
	correctAnswers: number
	totalQuestions: number
	answers: number[]
	completedAt: string
}

export default function TestPage() {
	const params = useParams()
	const router = useRouter()
	const courseId = params.id as string
	const { user, loading } = useAuth()

	const [test, setTest] = useState<Test | null>(null)
	const [loadingTest, setLoadingTest] = useState(true)
	const [currentQuestion, setCurrentQuestion] = useState(0)
	const [answers, setAnswers] = useState<number[]>([])
	const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
	const [isCompleted, setIsCompleted] = useState(false)
	const [result, setResult] = useState<TestResult | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	useEffect(() => {
		if (user && courseId) {
			fetchTest()
		}
	}, [user, courseId])

	const fetchTest = async () => {
		try {
			const response = await fetch(`/api/courses/${courseId}/test`)
			if (response.ok) {
				const data = await response.json()
				setTest(data.test)
				setAnswers(new Array(data.test.questions.length).fill(-1))
			} else {
				console.error('Ошибка загрузки теста:', response.status)
			}
		} catch (error) {
			console.error('Ошибка загрузки теста:', error)
		} finally {
			setLoadingTest(false)
		}
	}

	const handleAnswerSelect = (answerIndex: number) => {
		setSelectedAnswer(answerIndex)
	}

	const handleNextQuestion = () => {
		if (selectedAnswer === null) return

		const newAnswers = [...answers]
		newAnswers[currentQuestion] = selectedAnswer
		setAnswers(newAnswers)
		setSelectedAnswer(null)

		if (currentQuestion < test!.questions.length - 1) {
			setCurrentQuestion(currentQuestion + 1)
		} else {
			submitTest(newAnswers)
		}
	}

	const handlePrevQuestion = () => {
		if (currentQuestion > 0) {
			setCurrentQuestion(currentQuestion - 1)
			setSelectedAnswer(
				answers[currentQuestion - 1] >= 0 ? answers[currentQuestion - 1] : null
			)
		}
	}

	const submitTest = async (finalAnswers: number[]) => {
		setIsSubmitting(true)
		try {
			const response = await fetch(`/api/courses/${courseId}/test`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ answers: finalAnswers }),
			})

			if (response.ok) {
				const data = await response.json()
				setResult(data.result)
				setIsCompleted(true)
			} else {
				console.error('Ошибка отправки результатов теста')
			}
		} catch (error) {
			console.error('Ошибка отправки результатов теста:', error)
		} finally {
			setIsSubmitting(false)
		}
	}

	const getScoreColor = (score: number) => {
		if (score >= 80) return 'text-green-500'
		if (score >= 60) return 'text-yellow-500'
		return 'text-red-500'
	}

	const getScoreMessage = (score: number) => {
		if (score >= 80) return 'Отличный результат! 🎉'
		if (score >= 60) return 'Хорошо! Можно лучше 👍'
		return 'Нужно повторить материал 📚'
	}

	if (loading || loadingTest) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
				<div className='text-xl text-white'>Загрузка теста...</div>
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

	if (!test) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center'>
				<div className='text-center'>
					<h2 className='text-2xl font-bold text-white mb-4'>Тест не найден</h2>
					<Link
						href={`/courses/${courseId}`}
						className='text-blue-400 hover:text-blue-300'
					>
						Назад к курсу
					</Link>
				</div>
			</div>
		)
	}

	if (isCompleted && result) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
				<div className='container mx-auto px-4 py-8'>
					<nav className='flex justify-between items-center mb-8'>
						<Link
							href={`/courses/${courseId}`}
							className='text-blue-400 hover:text-blue-300'
						>
							← Назад к курсу
						</Link>
						<div className='text-lg font-semibold text-white'>{user?.name}</div>
					</nav>

					<div className='max-w-2xl mx-auto'>
						<div className='bg-gray-800 rounded-lg shadow-lg p-8 text-center'>
							<h1 className='text-3xl font-bold text-white mb-6'>
								Тест завершен!
							</h1>

							<div className='mb-8'>
								<div
									className={`text-6xl font-bold mb-4 ${getScoreColor(
										result.score
									)}`}
								>
									{result.score}%
								</div>
								<div className='text-xl text-gray-300 mb-2'>
									{getScoreMessage(result.score)}
								</div>
								<div className='text-gray-400'>
									Правильных ответов: {result.correctAnswers} из{' '}
									{result.totalQuestions}
								</div>
							</div>

							<div className='space-y-4'>
								<Link
									href={`/courses/${courseId}`}
									className='inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors mr-4'
								>
									Вернуться к курсу
								</Link>
								<Link
									href='/modules'
									className='inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors'
								>
									Все курсы
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	const currentQ = test.questions[currentQuestion]
	const progress = ((currentQuestion + 1) / test.questions.length) * 100

	return (
		<div className='min-h-screen bg-gradient-to-br from-gray-900 to-gray-800'>
			<div className='container mx-auto px-4 py-8'>
				<nav className='flex justify-between items-center mb-8'>
					<Link
						href={`/courses/${courseId}`}
						className='text-blue-400 hover:text-blue-300'
					>
						← Назад к курсу
					</Link>
					<div className='text-lg font-semibold text-white'>{user?.name}</div>
				</nav>

				<div className='max-w-3xl mx-auto'>
					{/* Заголовок теста */}
					<div className='text-center mb-8'>
						<h1 className='text-3xl font-bold text-white mb-2'>{test.title}</h1>
						<p className='text-gray-300'>{test.description}</p>
					</div>

					{/* Прогресс бар */}
					<div className='mb-8'>
						<div className='flex justify-between text-sm text-gray-400 mb-2'>
							<span>
								Вопрос {currentQuestion + 1} из {test.questions.length}
							</span>
							<span>{Math.round(progress)}%</span>
						</div>
						<div className='w-full bg-gray-700 rounded-full h-2'>
							<div
								className='bg-blue-500 h-2 rounded-full transition-all duration-300'
								style={{ width: `${progress}%` }}
							></div>
						</div>
					</div>

					{/* Вопрос */}
					<div className='bg-gray-800 rounded-lg shadow-lg p-8'>
						<h2 className='text-2xl font-bold text-white mb-6'>
							{currentQ.question}
						</h2>

						<div className='space-y-4 mb-8'>
							{currentQ.options.map((option, index) => (
								<button
									key={index}
									onClick={() => handleAnswerSelect(index)}
									className={`w-full text-left p-4 rounded-lg border transition-colors ${
										selectedAnswer === index
											? 'bg-blue-600 border-blue-500 text-white'
											: 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
									}`}
								>
									<div className='flex items-center'>
										<div
											className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
												selectedAnswer === index
													? 'border-white bg-white'
													: 'border-gray-400'
											}`}
										>
											{selectedAnswer === index && (
												<div className='w-3 h-3 rounded-full bg-blue-600'></div>
											)}
										</div>
										<span>{option}</span>
									</div>
								</button>
							))}
						</div>

						{/* Навигация */}
						<div className='flex justify-between items-center'>
							<button
								onClick={handlePrevQuestion}
								disabled={currentQuestion === 0}
								className={`px-6 py-3 rounded-lg transition-colors ${
									currentQuestion === 0
										? 'bg-gray-600 text-gray-400 cursor-not-allowed'
										: 'bg-gray-600 text-white hover:bg-gray-700'
								}`}
							>
								← Назад
							</button>

							<div className='text-gray-400 text-sm'>
								{answers.filter(a => a >= 0).length} / {test.questions.length}{' '}
								отвечено
							</div>

							<button
								onClick={handleNextQuestion}
								disabled={selectedAnswer === null || isSubmitting}
								className={`px-6 py-3 rounded-lg transition-colors ${
									selectedAnswer === null || isSubmitting
										? 'bg-gray-600 text-gray-400 cursor-not-allowed'
										: currentQuestion === test.questions.length - 1
										? 'bg-green-600 text-white hover:bg-green-700'
										: 'bg-blue-600 text-white hover:bg-blue-700'
								}`}
							>
								{isSubmitting
									? 'Отправка...'
									: currentQuestion === test.questions.length - 1
									? 'Завершить тест'
									: 'Далее →'}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
