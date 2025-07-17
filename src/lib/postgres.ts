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

// Функция для создания всех таблиц
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
        total_questions INTEGER NOT NULL,
        answers TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Создание таблицы user_progress
    await sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
        lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
        completed BOOLEAN DEFAULT FALSE,
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

export default sql;