// Локальная система хранения данных для случаев когда Blob Storage недоступен
import { Course, Lesson, Test, TestQuestion, User, TestResult } from './blob-storage'
import { hash } from 'bcryptjs'

// Структура данных в памяти
interface LocalDatabase {
  users: User[]
  courses: Course[]
  lessons: Lesson[]
  tests: Test[]
  test_questions: TestQuestion[]
  test_results: TestResult[]
  last_ids: {
    users: number
    courses: number
    lessons: number
    tests: number
    test_questions: number
    test_results: number
  }
}

// Глобальная переменная для хранения данных в памяти
let localDatabase: LocalDatabase | null = null

// Инициализация локальной базы данных
async function initializeLocalDatabase(): Promise<LocalDatabase> {
  if (localDatabase) {
    return localDatabase
  }

  const adminPassword = await hash('admin123', 10)
  const userPassword = await hash('bitrix2024', 10)
  
  localDatabase = {
    users: [
      {
        id: 1,
        email: 'admin@bitrix24course.ru',
        name: 'Администратор',
        password: adminPassword,
        is_admin: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        email: 'roughriver74@gmail.com', 
        name: 'Евгений',
        password: userPassword,
        is_admin: true,
        created_at: new Date().toISOString()
      }
    ],
    courses: [
      {
        id: 1,
        title: 'Основы работы с Битрикс24',
        description: 'Изучение базовых возможностей платформы: CRM, задачи, проекты',
        order_index: 1,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        title: 'CRM и управление клиентами',
        description: 'Работа с лидами, сделками, контактами и компаниями',
        order_index: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        title: 'Задачи и проекты',
        description: 'Планирование работы, создание задач и управление проектами',
        order_index: 3,
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        title: 'Автоматизация и роботы',
        description: 'Настройка автоматических процессов и бизнес-процессов',
        order_index: 4,
        created_at: new Date().toISOString(),
      },
      {
        id: 5,
        title: 'Отчеты и аналитика',
        description: 'Создание отчетов и анализ данных в Битрикс24',
        order_index: 5,
        created_at: new Date().toISOString(),
      },
    ],
    lessons: [
      {
        id: 1,
        course_id: 1,
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
        order_index: 0,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        course_id: 1,
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
        order_index: 1,
        created_at: new Date().toISOString(),
      }
    ],
    tests: [
      {
        id: 1,
        course_id: 1,
        lesson_id: null,
        title: 'Тест: Основы работы с Битрикс24',
        description: 'Проверочный тест по курсу',
        created_at: new Date().toISOString(),
      }
    ],
    test_questions: [
      {
        id: 1,
        test_id: 1,
        question: 'Что такое Битрикс24?',
        options: [
          'Только CRM система',
          'Комплексное решение для автоматизации бизнеса',
          'Система управления сайтами',
          'Программа для видеозвонков'
        ],
        correct_answer: 1,
        order_index: 0,
      },
      {
        id: 2,
        test_id: 1,
        question: 'Какие основные модули входят в Битрикс24?',
        options: [
          'Только CRM и задачи',
          'CRM, задачи, документы, общение, сайты',
          'Только общение и документы',
          'Только аналитика'
        ],
        correct_answer: 1,
        order_index: 1,
      }
    ],
    test_results: [],
    last_ids: {
      users: 2,
      courses: 5,
      lessons: 2,
      tests: 1,
      test_questions: 2,
      test_results: 0
    }
  }

  return localDatabase
}

// Получить следующий ID
function getNextId(table: keyof LocalDatabase['last_ids']): number {
  if (!localDatabase) {
    throw new Error('Database not initialized')
  }
  localDatabase.last_ids[table]++
  return localDatabase.last_ids[table]
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ===

export async function getAllUsers(): Promise<User[]> {
  const db = await initializeLocalDatabase()
  return db.users
}

export async function getUserById(id: number): Promise<User | null> {
  const db = await initializeLocalDatabase()
  return db.users.find(user => user.id === id) || null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await initializeLocalDatabase()
  return db.users.find(user => user.email === email) || null
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const db = await initializeLocalDatabase()
  
  const existingUser = db.users.find(user => user.email === userData.email)
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует')
  }
  
  const newUser: User = {
    ...userData,
    id: getNextId('users'),
    created_at: new Date().toISOString()
  }
  
  db.users.push(newUser)
  return newUser
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С КУРСАМИ ===

export async function getAllCourses(): Promise<Course[]> {
  const db = await initializeLocalDatabase()
  return db.courses.sort((a, b) => a.order_index - b.order_index)
}

export async function getCourseById(id: number): Promise<Course | null> {
  const db = await initializeLocalDatabase()
  return db.courses.find(course => course.id === id) || null
}

export async function createCourse(courseData: Omit<Course, 'id' | 'created_at'>): Promise<Course> {
  const db = await initializeLocalDatabase()
  
  const newCourse: Course = {
    ...courseData,
    id: getNextId('courses'),
    created_at: new Date().toISOString()
  }
  
  db.courses.push(newCourse)
  return newCourse
}

export async function updateCourse(id: number, updates: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course | null> {
  const db = await initializeLocalDatabase()
  const courseIndex = db.courses.findIndex(course => course.id === id)
  
  if (courseIndex === -1) return null
  
  db.courses[courseIndex] = { ...db.courses[courseIndex], ...updates }
  return db.courses[courseIndex]
}

export async function deleteCourse(id: number): Promise<boolean> {
  const db = await initializeLocalDatabase()
  const courseIndex = db.courses.findIndex(course => course.id === id)
  
  if (courseIndex === -1) return false
  
  // Удаляем связанные данные
  db.lessons = db.lessons.filter(lesson => lesson.course_id !== id)
  db.tests = db.tests.filter(test => test.course_id !== id)
  db.courses.splice(courseIndex, 1)
  
  return true
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С УРОКАМИ ===

export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
  const db = await initializeLocalDatabase()
  return db.lessons
    .filter(lesson => lesson.course_id === courseId)
    .sort((a, b) => a.order_index - b.order_index)
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  const db = await initializeLocalDatabase()
  return db.lessons.find(lesson => lesson.id === id) || null
}

export async function createLesson(lessonData: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
  const db = await initializeLocalDatabase()
  
  const newLesson: Lesson = {
    ...lessonData,
    id: getNextId('lessons'),
    created_at: new Date().toISOString()
  }
  
  db.lessons.push(newLesson)
  return newLesson
}

export async function updateLesson(id: number, updates: Partial<Omit<Lesson, 'id' | 'created_at'>>): Promise<Lesson | null> {
  const db = await initializeLocalDatabase()
  const lessonIndex = db.lessons.findIndex(lesson => lesson.id === id)
  
  if (lessonIndex === -1) return null
  
  db.lessons[lessonIndex] = { ...db.lessons[lessonIndex], ...updates }
  return db.lessons[lessonIndex]
}

export async function deleteLesson(id: number): Promise<boolean> {
  const db = await initializeLocalDatabase()
  const lessonIndex = db.lessons.findIndex(lesson => lesson.id === id)
  
  if (lessonIndex === -1) return false
  
  db.lessons.splice(lessonIndex, 1)
  return true
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕСТАМИ ===

export async function getTestsByCourse(courseId: number): Promise<Test[]> {
  const db = await initializeLocalDatabase()
  return db.tests.filter(test => test.course_id === courseId)
}

export async function getTestById(id: number): Promise<Test | null> {
  const db = await initializeLocalDatabase()
  return db.tests.find(test => test.id === id) || null
}

export async function createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test> {
  const db = await initializeLocalDatabase()
  
  const newTest: Test = {
    ...testData,
    id: getNextId('tests'),
    created_at: new Date().toISOString()
  }
  
  db.tests.push(newTest)
  return newTest
}

export async function updateTest(id: number, updates: Partial<Omit<Test, 'id' | 'created_at'>>): Promise<Test | null> {
  const db = await initializeLocalDatabase()
  const testIndex = db.tests.findIndex(test => test.id === id)
  
  if (testIndex === -1) return null
  
  db.tests[testIndex] = { ...db.tests[testIndex], ...updates }
  return db.tests[testIndex]
}

export async function deleteTest(id: number): Promise<boolean> {
  const db = await initializeLocalDatabase()
  const testIndex = db.tests.findIndex(test => test.id === id)
  
  if (testIndex === -1) return false
  
  // Удаляем связанные вопросы
  db.test_questions = db.test_questions.filter(question => question.test_id !== id)
  db.tests.splice(testIndex, 1)
  
  return true
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ВОПРОСАМИ ТЕСТОВ ===

export async function getTestQuestions(testId: number): Promise<TestQuestion[]> {
  const db = await initializeLocalDatabase()
  return db.test_questions
    .filter(question => question.test_id === testId)
    .sort((a, b) => a.order_index - b.order_index)
}

export async function createTestQuestion(questionData: Omit<TestQuestion, 'id'>): Promise<TestQuestion> {
  const db = await initializeLocalDatabase()
  
  const newQuestion: TestQuestion = {
    ...questionData,
    id: getNextId('test_questions')
  }
  
  db.test_questions.push(newQuestion)
  return newQuestion
}

export async function updateTestQuestion(id: number, updates: Partial<Omit<TestQuestion, 'id'>>): Promise<TestQuestion | null> {
  const db = await initializeLocalDatabase()
  const questionIndex = db.test_questions.findIndex(question => question.id === id)
  
  if (questionIndex === -1) return null
  
  db.test_questions[questionIndex] = { ...db.test_questions[questionIndex], ...updates }
  return db.test_questions[questionIndex]
}

export async function deleteTestQuestion(id: number): Promise<boolean> {
  const db = await initializeLocalDatabase()
  const questionIndex = db.test_questions.findIndex(question => question.id === id)
  
  if (questionIndex === -1) return false
  
  db.test_questions.splice(questionIndex, 1)
  return true
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С РЕЗУЛЬТАТАМИ ТЕСТОВ ===

export async function createTestResult(resultData: Omit<TestResult, 'id' | 'created_at'>): Promise<TestResult> {
  const db = await initializeLocalDatabase()
  
  const newResult: TestResult = {
    ...resultData,
    id: getNextId('test_results'),
    created_at: new Date().toISOString()
  }
  
  db.test_results.push(newResult)
  return newResult
}

// === СИСТЕМНЫЕ ФУНКЦИИ ===

export async function initializeLocalDb(): Promise<void> {
  await initializeLocalDatabase()
  console.log('Локальная база данных инициализирована')
}

export function checkLocalConnection(): boolean {
  return true // Локальное хранилище всегда доступно
}