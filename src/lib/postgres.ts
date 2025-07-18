import { sql } from '@vercel/postgres';

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

export interface UserProgress {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id: number;
  completed: boolean;
  created_at: string;
}

// Функция для создания таблиц
export async function createTables() {
  try {
    // Создание таблицы users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы courses
    await sql`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
<<<<<<< HEAD

        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы lessons
    await sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы tests
    await sql`
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы test_questions
    await sql`
      CREATE TABLE IF NOT EXISTS test_questions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer INTEGER NOT NULL,
        order_index INTEGER DEFAULT 0
      )
    `;

    // Создание таблицы test_results
    await sql`
      CREATE TABLE IF NOT EXISTS test_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        test_id INTEGER REFERENCES tests(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        max_score INTEGER NOT NULL,
        answers TEXT,
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы user_progress
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
        completed BOOLEAN DEFAULT FALSE,
        score INTEGER,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('Таблицы созданы успешно');
  } catch (error) {
    console.error('Ошибка создания таблиц:', error);
    throw error;
  }
}

// Функция для создания администратора
export async function createDefaultAdmin() {
  try {
    const bcrypt = await import('bcryptjs');
    
    // Создаем основного администратора
    const adminPassword = await bcrypt.hash('admin123', 10);
    await sql`
      INSERT INTO users (email, name, password, is_admin)
      VALUES ('admin@bitrix24course.ru', 'Администратор', ${adminPassword}, true)
      ON CONFLICT (email) DO UPDATE SET
        is_admin = true
    `;

    // Создаем дополнительного администратора
    const userPassword = await bcrypt.hash('bitrix2024', 10);
    await sql`
      INSERT INTO users (email, name, password, is_admin)
      VALUES ('roughriver74@gmail.com', 'Евгений', ${userPassword}, true)
      ON CONFLICT (email) DO UPDATE SET
        is_admin = true
    `;

    console.log('Администраторы созданы успешно');
  } catch (error) {
    console.error('Ошибка создания администраторов:', error);
    throw error;
  }
}

// Функции для работы с уроками
export async function getLessonsByCourse(courseId: number): Promise<Lesson[]> {
  try {
    const result = await sql`
      SELECT * FROM lessons 
      WHERE course_id = ${courseId} 
      ORDER BY order_index ASC
    `;
    return result.rows as Lesson[];
  } catch (error) {
    console.error('Ошибка получения уроков:', error);
    throw error;
  }
}

export async function getLessonById(lessonId: number): Promise<Lesson | null> {
  try {
    const result = await sql`
      SELECT * FROM lessons WHERE id = ${lessonId}
    `;
    return result.rows[0] as Lesson || null;
  } catch (error) {
    console.error('Ошибка получения урока:', error);
    throw error;
  }
}

export async function createLesson(lesson: {
  course_id: number;
  title: string;
  content: string;
  order_index: number;
}): Promise<Lesson> {
  try {
    const result = await sql`
      INSERT INTO lessons (course_id, title, content, order_index)
      VALUES (${lesson.course_id}, ${lesson.title}, ${lesson.content}, ${lesson.order_index})
      RETURNING *
    `;
    return result.rows[0] as Lesson;
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    throw error;
  }
}

export async function updateLesson(lessonId: number, updates: {
  title?: string;
  content?: string;
  order_index?: number;
}): Promise<Lesson | null> {
  try {
    if (Object.keys(updates).length === 0) {
      return await getLessonById(lessonId);
    }
    
    const result = await sql`
      UPDATE lessons 
      SET 
        title = COALESCE(${updates.title}, title),
        content = COALESCE(${updates.content}, content),
        order_index = COALESCE(${updates.order_index}, order_index)
      WHERE id = ${lessonId}
      RETURNING *
    `;
    
    return result.rows[0] as Lesson || null;
  } catch (error) {
    console.error('Ошибка обновления урока:', error);
    throw error;
  }
}

export async function deleteLesson(lessonId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM lessons WHERE id = ${lessonId}
    `;
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    throw error;
  }
}

// Функции для работы с тестами
export async function getTestsByCourse(courseId: number): Promise<Test[]> {
  try {
    const result = await sql`
      SELECT * FROM tests 
      WHERE course_id = ${courseId} 
      ORDER BY created_at DESC
    `;
    return result.rows as Test[];
  } catch (error) {
    console.error('Ошибка получения тестов:', error);
    throw error;
  }
}

export async function createTest(test: {
  course_id: number;
  lesson_id: number | null;
  title: string;
  description: string;
}): Promise<Test> {
  try {
    const result = await sql`
      INSERT INTO tests (course_id, lesson_id, title, description)
      VALUES (${test.course_id}, ${test.lesson_id}, ${test.title}, ${test.description})
      RETURNING *
    `;
    return result.rows[0] as Test;
  } catch (error) {
    console.error('Ошибка создания теста:', error);
    throw error;
  }
}

export async function getTestById(testId: number): Promise<Test | null> {
  try {
    const result = await sql`
      SELECT * FROM tests WHERE id = ${testId}
    `;
    return result.rows[0] as Test || null;
  } catch (error) {
    console.error('Ошибка получения теста:', error);
    throw error;
  }
}

export async function updateTest(testId: number, updates: {
  title?: string;
  description?: string;
}): Promise<Test | null> {
  try {
    if (Object.keys(updates).length === 0) {
      return await getTestById(testId);
    }
    
    const result = await sql`
      UPDATE tests 
      SET 
        title = COALESCE(${updates.title}, title),
        description = COALESCE(${updates.description}, description)
      WHERE id = ${testId}
      RETURNING *
    `;
    
    return result.rows[0] as Test || null;
  } catch (error) {
    console.error('Ошибка обновления теста:', error);
    throw error;
  }
}

export async function deleteTest(testId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM tests WHERE id = ${testId}
    `;
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    throw error;
  }
}

// Функции для работы с вопросами тестов
export async function getTestQuestions(testId: number): Promise<TestQuestion[]> {
  try {
    const result = await sql`
      SELECT id, test_id, question, options, correct_answer, order_index
      FROM test_questions 
      WHERE test_id = ${testId} 
      ORDER BY order_index ASC
    `;
    
    return result.rows.map(row => ({
      ...row,
      options: JSON.parse(row.options as string)
    })) as TestQuestion[];
  } catch (error) {
    console.error('Ошибка получения вопросов теста:', error);
    throw error;
  }
}

export async function createTestQuestion(question: {
  test_id: number;
  question: string;
  options: string[];
  correct_answer: number;
  order_index: number;
}): Promise<TestQuestion> {
  try {
    const result = await sql`
      INSERT INTO test_questions (test_id, question, options, correct_answer, order_index)
      VALUES (${question.test_id}, ${question.question}, ${JSON.stringify(question.options)}, ${question.correct_answer}, ${question.order_index})
      RETURNING *
    `;
    
    const row = result.rows[0];
    return {
      ...row,
      options: JSON.parse(row.options as string)
    } as TestQuestion;
  } catch (error) {
    console.error('Ошибка создания вопроса теста:', error);
    throw error;
  }
}

// Функции для работы с результатами тестов
export async function createTestResult(testResult: {
  user_id: number;
  test_id: number;
  score: number;
  total_questions: number;
  answers: string;
}): Promise<TestResult> {
  try {
    const result = await sql`
      INSERT INTO test_results (user_id, test_id, score, total_questions, answers)
      VALUES (${testResult.user_id}, ${testResult.test_id}, ${testResult.score}, ${testResult.total_questions}, ${testResult.answers})
      RETURNING *
    `;
    return result.rows[0] as TestResult;
  } catch (error) {
    console.error('Ошибка создания результата теста:', error);
    throw error;
  }
}

// Дополнительные функции для работы с вопросами тестов
export async function getTestQuestionById(questionId: number): Promise<TestQuestion | null> {
  try {
    const result = await sql`
      SELECT id, test_id, question, options, correct_answer, order_index
      FROM test_questions WHERE id = ${questionId}
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      options: JSON.parse(row.options as string)
    } as TestQuestion;
  } catch (error) {
    console.error('Ошибка получения вопроса теста:', error);
    throw error;
  }
}

export async function updateTestQuestion(questionId: number, updates: {
  question?: string;
  options?: string[];
  correct_answer?: number;
  order_index?: number;
}): Promise<TestQuestion | null> {
  try {
    if (Object.keys(updates).length === 0) {
      return await getTestQuestionById(questionId);
    }
    
    const result = await sql`
      UPDATE test_questions 
      SET 
        question = COALESCE(${updates.question}, question),
        options = COALESCE(${updates.options ? JSON.stringify(updates.options) : null}, options),
        correct_answer = COALESCE(${updates.correct_answer}, correct_answer),
        order_index = COALESCE(${updates.order_index}, order_index)
      WHERE id = ${questionId}
      RETURNING *
    `;
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      options: JSON.parse(row.options as string)
    } as TestQuestion;
  } catch (error) {
    console.error('Ошибка обновления вопроса теста:', error);
    throw error;
  }
}

export async function deleteTestQuestion(questionId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM test_questions WHERE id = ${questionId}
    `;
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Ошибка удаления вопроса теста:', error);
    throw error;
  }
}

// Функции для работы с пользователями
export async function getUserById(userId: number): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE id = ${userId}
    `;
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Ошибка получения пользователя по ID:', error);
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Ошибка получения пользователя по email:', error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  is_admin: boolean;
}): Promise<User | null> {
  try {
    const result = await sql`
      INSERT INTO users (email, password, name, is_admin)
      VALUES (${userData.email}, ${userData.password}, ${userData.name}, ${userData.is_admin})
      RETURNING *
    `;
    return result.rows[0] as User;
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    return null;
  }
}

// Функция для получения пользователя из токена (для совместимости)
export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    return await getUserById(decoded.userId);
  } catch (error) {
    console.error('Ошибка получения пользователя из токена:', error);
    return null;
  }
}

export default sql;