import { sql } from '@vercel/postgres';
import Database from 'better-sqlite3';
import { createTables, createDefaultAdmin } from './postgres';

// Функция для миграции данных из SQLite в PostgreSQL
export async function migrateToPostgres() {
  try {
    console.log('Начинаем миграцию данных...');
    
    // Создаем таблицы в PostgreSQL
    await createTables();
    
    // Открываем SQLite базу данных
    const db = new Database('bitrix24_course.db');
    
    // Мигрируем курсы
    console.log('Миграция курсов...');
    const courses = db.prepare('SELECT * FROM courses').all();
    for (const course of courses) {
      await sql`
        INSERT INTO courses (title, description, created_at)
        VALUES (${course.title}, ${course.description}, ${course.created_at})
        ON CONFLICT DO NOTHING
      `;
    }
    
    // Мигрируем уроки
    console.log('Миграция уроков...');
    const lessons = db.prepare('SELECT * FROM lessons').all();
    for (const lesson of lessons) {
      await sql`
        INSERT INTO lessons (course_id, title, content, order_index, created_at)
        VALUES (${lesson.course_id}, ${lesson.title}, ${lesson.content}, ${lesson.order_index}, ${lesson.created_at})
        ON CONFLICT DO NOTHING
      `;
    }
    
    // Мигрируем тесты
    console.log('Миграция тестов...');
    const tests = db.prepare('SELECT * FROM tests').all();
    for (const test of tests) {
      await sql`
        INSERT INTO tests (course_id, lesson_id, title, description, created_at)
        VALUES (${test.course_id}, ${test.lesson_id || null}, ${test.title}, ${test.description}, ${test.created_at})
        ON CONFLICT DO NOTHING
      `;
    }
    
    // Мигрируем вопросы тестов
    console.log('Миграция вопросов тестов...');
    const questions = db.prepare('SELECT * FROM test_questions').all();
    for (const question of questions) {
      await sql`
        INSERT INTO test_questions (test_id, question, options, correct_answer, order_index)
        VALUES (${question.test_id}, ${question.question}, ${question.options}, ${question.correct_answer}, ${question.order_index})
        ON CONFLICT DO NOTHING
      `;
    }
    
    // Создаем администраторов
    await createDefaultAdmin();
    
    db.close();
    console.log('Миграция завершена успешно!');
  } catch (error) {
    console.error('Ошибка миграции:', error);
    throw error;
  }
}

// Запуск миграции, если файл запущен напрямую
if (require.main === module) {
  migrateToPostgres().catch(console.error);
}