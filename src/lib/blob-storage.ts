import { put, head, del, list } from '@vercel/blob';
import { hash } from 'bcryptjs';

// Интерфейсы для данных
export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  is_admin: boolean;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  order_index: number;
  created_at: string;
}

export interface Test {
  id: number;
  course_id: number;
  lesson_id: number | null;
  title: string;
  description: string;
  created_at: string;
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}

export interface TestResult {
  id: number;
  user_id: number;
  test_id: number;
  score: number;
  total_questions: number;
  answers: string;
  created_at: string;
}

// Структура данных в памяти
interface DatabaseState {
  users: User[];
  courses: Course[];
  lessons: Lesson[];
  tests: Test[];
  test_questions: TestQuestion[];
  test_results: TestResult[];
  last_ids: {
    users: number;
    courses: number;
    lessons: number;
    tests: number;
    test_questions: number;
    test_results: number;
  };
}

const BLOB_NAME = 'bitrix24-database.json';

// Инициализация базы данных
async function getInitialDatabase(): Promise<DatabaseState> {
  const adminPassword = await hash('admin123', 10);
  const userPassword = await hash('bitrix2024', 10);
  
  return {
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
    courses: [],
    lessons: [],
    tests: [],
    test_questions: [],
    test_results: [],
    last_ids: {
      users: 2,
      courses: 0,
      lessons: 0,
      tests: 0,
      test_questions: 0,
      test_results: 0
    }
  };
}

// Загрузка данных из Blob
async function loadDatabase(): Promise<DatabaseState> {
  try {
    // Попробуем найти файл по точному имени
    const blobList = await list();
    const dbBlob = blobList.blobs.find(blob => blob.pathname === BLOB_NAME);
    
    if (!dbBlob) {
      console.log('База данных не найдена, создаем новую');
      return await getInitialDatabase();
    }

    console.log('Найден файл базы данных:', dbBlob.url);
    const response = await fetch(dbBlob.url);
    if (!response.ok) {
      throw new Error('Не удалось загрузить данные');
    }
    
    const data = await response.json();
    console.log('База данных загружена из Blob, пользователей:', data.users?.length || 0);
    return data;
  } catch (error) {
    console.error('Ошибка загрузки базы данных:', error);
    console.log('Создаем новую базу данных');
    return await getInitialDatabase();
  }
}

// Сохранение данных в Blob
async function saveDatabase(data: DatabaseState): Promise<void> {
  try {
    const blob = await put(BLOB_NAME, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json'
    });
    console.log('База данных сохранена в Blob:', blob.url, 'пользователей:', data.users.length);
  } catch (error) {
    console.error('Ошибка сохранения базы данных:', error);
    throw error;
  }
}

// Генерация следующего ID
function getNextId(data: DatabaseState, table: keyof DatabaseState['last_ids']): number {
  data.last_ids[table]++;
  return data.last_ids[table];
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ===

export async function getAllUsers(): Promise<User[]> {
  const data = await loadDatabase();
  return data.users;
}

export async function getUserById(id: number): Promise<User | null> {
  const data = await loadDatabase();
  return data.users.find(user => user.id === id) || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const data = await loadDatabase();
  console.log('Поиск пользователя по email:', email, 'всего пользователей:', data.users.length);
  const user = data.users.find(user => user.email === email) || null;
  console.log('Пользователь найден:', !!user);
  return user;
}

export async function createUser(userData: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const data = await loadDatabase();
  
  // Проверяем, не существует ли уже пользователь с таким email
  const existingUser = data.users.find(user => user.email === userData.email);
  if (existingUser) {
    throw new Error('Пользователь с таким email уже существует');
  }
  
  const newUser: User = {
    ...userData,
    id: getNextId(data, 'users'),
    created_at: new Date().toISOString()
  };
  
  console.log('Создаем нового пользователя:', newUser.email, 'ID:', newUser.id);
  data.users.push(newUser);
  await saveDatabase(data);
  
  return newUser;
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С КУРСАМИ ===

export async function getAllCourses(): Promise<Course[]> {
  const data = await loadDatabase();
  return data.courses.sort((a, b) => a.order_index - b.order_index);
}

export async function getCourseById(id: number): Promise<Course | null> {
  const data = await loadDatabase();
  return data.courses.find(course => course.id === id) || null;
}

export async function createCourse(courseData: Omit<Course, 'id' | 'created_at'>): Promise<Course> {
  const data = await loadDatabase();
  
  const newCourse: Course = {
    ...courseData,
    id: getNextId(data, 'courses'),
    created_at: new Date().toISOString()
  };
  
  data.courses.push(newCourse);
  await saveDatabase(data);
  
  return newCourse;
}

export async function updateCourse(id: number, updates: Partial<Omit<Course, 'id' | 'created_at'>>): Promise<Course | null> {
  const data = await loadDatabase();
  const courseIndex = data.courses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) return null;
  
  data.courses[courseIndex] = { ...data.courses[courseIndex], ...updates };
  await saveDatabase(data);
  
  return data.courses[courseIndex];
}

export async function deleteCourse(id: number): Promise<boolean> {
  const data = await loadDatabase();
  const courseIndex = data.courses.findIndex(course => course.id === id);
  
  if (courseIndex === -1) return false;
  
  // Удаляем связанные данные
  data.lessons = data.lessons.filter(lesson => lesson.course_id !== id);
  data.tests = data.tests.filter(test => test.course_id !== id);
  data.courses.splice(courseIndex, 1);
  
  await saveDatabase(data);
  return true;
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С УРОКАМИ ===

export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
  const data = await loadDatabase();
  return data.lessons
    .filter(lesson => lesson.course_id === courseId)
    .sort((a, b) => a.order_index - b.order_index);
}

export async function getLessonById(id: number): Promise<Lesson | null> {
  const data = await loadDatabase();
  return data.lessons.find(lesson => lesson.id === id) || null;
}

export async function createLesson(lessonData: Omit<Lesson, 'id' | 'created_at'>): Promise<Lesson> {
  const data = await loadDatabase();
  
  const newLesson: Lesson = {
    ...lessonData,
    id: getNextId(data, 'lessons'),
    created_at: new Date().toISOString()
  };
  
  data.lessons.push(newLesson);
  await saveDatabase(data);
  
  return newLesson;
}

export async function updateLesson(id: number, updates: Partial<Omit<Lesson, 'id' | 'created_at'>>): Promise<Lesson | null> {
  const data = await loadDatabase();
  const lessonIndex = data.lessons.findIndex(lesson => lesson.id === id);
  
  if (lessonIndex === -1) return null;
  
  data.lessons[lessonIndex] = { ...data.lessons[lessonIndex], ...updates };
  await saveDatabase(data);
  
  return data.lessons[lessonIndex];
}

export async function deleteLesson(id: number): Promise<boolean> {
  const data = await loadDatabase();
  const lessonIndex = data.lessons.findIndex(lesson => lesson.id === id);
  
  if (lessonIndex === -1) return false;
  
  data.lessons.splice(lessonIndex, 1);
  await saveDatabase(data);
  return true;
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕСТАМИ ===

export async function getTestsByCourse(courseId: number): Promise<Test[]> {
  const data = await loadDatabase();
  return data.tests.filter(test => test.course_id === courseId);
}

export async function getTestById(id: number): Promise<Test | null> {
  const data = await loadDatabase();
  return data.tests.find(test => test.id === id) || null;
}

export async function createTest(testData: Omit<Test, 'id' | 'created_at'>): Promise<Test> {
  const data = await loadDatabase();
  
  const newTest: Test = {
    ...testData,
    id: getNextId(data, 'tests'),
    created_at: new Date().toISOString()
  };
  
  data.tests.push(newTest);
  await saveDatabase(data);
  
  return newTest;
}

export async function updateTest(id: number, updates: Partial<Omit<Test, 'id' | 'created_at'>>): Promise<Test | null> {
  const data = await loadDatabase();
  const testIndex = data.tests.findIndex(test => test.id === id);
  
  if (testIndex === -1) return null;
  
  data.tests[testIndex] = { ...data.tests[testIndex], ...updates };
  await saveDatabase(data);
  
  return data.tests[testIndex];
}

export async function deleteTest(id: number): Promise<boolean> {
  const data = await loadDatabase();
  const testIndex = data.tests.findIndex(test => test.id === id);
  
  if (testIndex === -1) return false;
  
  // Удаляем связанные вопросы
  data.test_questions = data.test_questions.filter(question => question.test_id !== id);
  data.tests.splice(testIndex, 1);
  
  await saveDatabase(data);
  return true;
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С ВОПРОСАМИ ТЕСТОВ ===

export async function getTestQuestions(testId: number): Promise<TestQuestion[]> {
  const data = await loadDatabase();
  return data.test_questions
    .filter(question => question.test_id === testId)
    .sort((a, b) => a.order_index - b.order_index);
}

export async function getTestQuestionById(id: number): Promise<TestQuestion | null> {
  const data = await loadDatabase();
  return data.test_questions.find(question => question.id === id) || null;
}

export async function createTestQuestion(questionData: Omit<TestQuestion, 'id'>): Promise<TestQuestion> {
  const data = await loadDatabase();
  
  const newQuestion: TestQuestion = {
    ...questionData,
    id: getNextId(data, 'test_questions')
  };
  
  data.test_questions.push(newQuestion);
  await saveDatabase(data);
  
  return newQuestion;
}

export async function updateTestQuestion(id: number, updates: Partial<Omit<TestQuestion, 'id'>>): Promise<TestQuestion | null> {
  const data = await loadDatabase();
  const questionIndex = data.test_questions.findIndex(question => question.id === id);
  
  if (questionIndex === -1) return null;
  
  data.test_questions[questionIndex] = { ...data.test_questions[questionIndex], ...updates };
  await saveDatabase(data);
  
  return data.test_questions[questionIndex];
}

export async function deleteTestQuestion(id: number): Promise<boolean> {
  const data = await loadDatabase();
  const questionIndex = data.test_questions.findIndex(question => question.id === id);
  
  if (questionIndex === -1) return false;
  
  data.test_questions.splice(questionIndex, 1);
  await saveDatabase(data);
  return true;
}

// === ФУНКЦИИ ДЛЯ РАБОТЫ С РЕЗУЛЬТАТАМИ ТЕСТОВ ===

export async function createTestResult(resultData: Omit<TestResult, 'id' | 'created_at'>): Promise<TestResult> {
  const data = await loadDatabase();
  
  const newResult: TestResult = {
    ...resultData,
    id: getNextId(data, 'test_results'),
    created_at: new Date().toISOString()
  };
  
  data.test_results.push(newResult);
  await saveDatabase(data);
  
  return newResult;
}

// === СИСТЕМНЫЕ ФУНКЦИИ ===

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('Инициализация базы данных...');
    const data = await getInitialDatabase();
    await saveDatabase(data);
    console.log('База данных инициализирована успешно');
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    throw error;
  }
}

export async function checkBlobConnection(): Promise<boolean> {
  try {
    // Проверяем переменную окружения
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return false;
    }
    
    // Проверяем доступ к Blob
    await list({ limit: 1 });
    return true;
  } catch (error) {
    console.error('Ошибка подключения к Blob:', error);
    return false;
  }
}