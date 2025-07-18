import {
	createCourse,
	createLesson,
	createTest,
	createTestQuestion,
	getAllCourses,
} from './blob-storage'
import {
	bitrixCourseStructure,
	advancedTests,
	advancedLessons,
} from './bitrix-content'

export async function seedBlobDatabase() {
	try {
		console.log('Начинаем загрузку контента в Vercel Blob...')

		// Проверяем, есть ли уже контент в базе
		const existingCourses = await getAllCourses()

		if (existingCourses.length > 0) {
			console.log(
				'База данных уже содержит курсы. Добавляем только новый контент...'
			)
		}

		// Добавляем базовый курс, если его нет
		if (existingCourses.length === 0) {
			await addBasicCourse()
		}

		// Добавляем новые продвинутые курсы
		for (const course of bitrixCourseStructure.courses) {
			// Проверяем, существует ли курс
			const existingCourse = existingCourses.find(c => c.title === course.title)

			let courseId
			if (!existingCourse) {
				// Создаем новый курс
				const newCourse = await createCourse({
					title: course.title,
					description: course.description,
					order_index:
						existingCourses.length +
						bitrixCourseStructure.courses.indexOf(course) +
						1,
				})
				courseId = newCourse.id
				console.log(`Создан курс: ${course.title}`)
			} else {
				courseId = existingCourse.id
				console.log(`Курс уже существует: ${course.title}`)
			}

			// Добавляем уроки к курсу
			for (let i = 0; i < course.lessons.length; i++) {
				const lesson = course.lessons[i]

				// Получаем полный контент урока
				let fullContent = lesson.content

				// Для продвинутых курсов используем полный контент
				if (course.title.includes('автоматизация')) {
					fullContent = advancedLessons.automation
				} else if (course.title.includes('Интеграции')) {
					fullContent = advancedLessons.integration
				} else if (course.title.includes('Аналитика')) {
					fullContent = advancedLessons.analytics
				}

				await createLesson({
					course_id: courseId,
					title: lesson.title,
					content: fullContent,
					order_index: i,
				})
				console.log(`  Добавлен урок: ${lesson.title}`)
			}

			// Добавляем тесты для курса
			let testTopic = ''

			if (course.title.includes('автоматизация')) {
				testTopic = 'automation'
			} else if (course.title.includes('Интеграции')) {
				testTopic = 'integration'
			} else if (course.title.includes('Аналитика')) {
				testTopic = 'analytics'
			}

			if (testTopic && advancedTests[testTopic as keyof typeof advancedTests]) {
				// Создаем тест для курса
				const testTitle = `Тест: ${course.title}`

				const newTest = await createTest({
					course_id: courseId,
					lesson_id: null,
					title: testTitle,
					description: 'Проверочный тест по курсу',
				})
				console.log(`  Создан тест: ${testTitle}`)

				// Добавляем вопросы к тесту
				const questions = advancedTests[testTopic as keyof typeof advancedTests]
				for (let j = 0; j < questions.length; j++) {
					const question = questions[j]

					await createTestQuestion({
						test_id: newTest.id,
						question: question.question,
						options: question.options,
						correct_answer: question.correct,
						order_index: j,
					})
					console.log(`    Добавлен вопрос ${j + 1}`)
				}
			}
		}

		console.log('Загрузка контента завершена успешно!')
	} catch (error) {
		console.error('Ошибка при загрузке контента:', error)
		throw error
	}
}

async function addBasicCourse() {
	console.log('Добавляем базовый курс...')

	const basicCourse = {
		title: 'Основы работы с Битрикс24',
		description:
			'Изучение базовых возможностей платформы: CRM, задачи, проекты',
		lessons: [
			{
				title: 'Введение в Битрикс24',
				content: `# Введение в Битрикс24

Битрикс24 — это комплексное решение для автоматизации бизнес-процессов компании.

## Основные модули:
- **CRM** — система управления клиентами
- **Задачи и проекты** — планирование работы
- **Документы** — совместная работа с файлами
- **Общение** — чаты, видеозвонки
- **Сайты** — создание корпоративных сайтов

## Первые шаги:
1. Регистрация аккаунта
2. Настройка профиля
3. Изучение интерфейса
4. Добавление сотрудников

Битрикс24 поможет организовать работу вашей команды и повысить эффективность бизнеса.`,
			},
			{
				title: 'Настройка CRM',
				content: `# Настройка CRM в Битрикс24

CRM (Customer Relationship Management) — система управления взаимоотношениями с клиентами.

## Основные сущности CRM:
- **Лиды** — потенциальные клиенты
- **Сделки** — процесс продаж
- **Контакты** — физические лица
- **Компании** — юридические лица

## Настройка воронки продаж:
1. Создание стадий сделок
2. Настройка полей
3. Автоматизация процессов
4. Назначение ответственных

## Работа с лидами:
- Создание лида вручную
- Импорт из файла
- Веб-формы на сайте
- Интеграция с рекламными системами

Правильная настройка CRM — основа эффективных продаж.`,
			},
		],
	}

	const course = await createCourse({
		title: basicCourse.title,
		description: basicCourse.description,
		order_index: 0,
	})

	for (let i = 0; i < basicCourse.lessons.length; i++) {
		const lesson = basicCourse.lessons[i]
		await createLesson({
			course_id: course.id,
			title: lesson.title,
			content: lesson.content,
			order_index: i,
		})
	}

	console.log(`Добавлен базовый курс: ${basicCourse.title}`)
}
