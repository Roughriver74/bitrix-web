import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const userId = searchParams.get('userId');

    let query = 'SELECT * FROM test_results';
    const params: (string | number)[] = [];

    if (testId && userId) {
      query += ' WHERE test_id = ? AND user_id = ?';
      params.push(testId, userId);
    } else if (testId) {
      query += ' WHERE test_id = ?';
      params.push(testId);
    } else if (userId) {
      query += ' WHERE user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY completed_at DESC';

    const results = db.prepare(query).all(...params);
    
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Ошибка загрузки результатов:', error);
    return NextResponse.json({ error: 'Ошибка загрузки результатов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    const { test_id, answers } = await request.json();

    // Получаем вопросы теста
    const questions = db.prepare('SELECT * FROM test_questions WHERE test_id = ? ORDER BY order_index').all(test_id) as { id: number; test_id: number; question: string; options: string; correct_answer: number; order_index: number }[];
    
    // Подсчитываем баллы
    let score = 0;
    const maxScore = questions.length;
    
    questions.forEach((question, index) => {
      if (answers[index] === question.correct_answer) {
        score++;
      }
    });

    // Сохраняем результат
    const result = db.prepare(`
      INSERT INTO test_results (user_id, test_id, score, max_score, answers)
      VALUES (?, ?, ?, ?, ?)
    `).run(decoded.userId, test_id, score, maxScore, JSON.stringify(answers));

    // Обновляем прогресс пользователя
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(test_id) as { id: number; course_id: number; lesson_id?: number; title: string; description?: string; created_at: string } | undefined;
    if (test) {
      db.prepare(`
        INSERT OR REPLACE INTO user_progress (user_id, course_id, lesson_id, completed, score, completed_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
      `).run(decoded.userId, test.course_id, test.lesson_id, 1, score);
    }

    const testResult = db.prepare('SELECT * FROM test_results WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json({ result: testResult, score, maxScore });
  } catch (error) {
    console.error('Ошибка сохранения результата:', error);
    return NextResponse.json({ error: 'Ошибка сохранения результата' }, { status: 500 });
  }
}