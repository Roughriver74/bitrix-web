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

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json({ error: 'Не указан ID теста' }, { status: 400 });
    }

    const questions = db.prepare('SELECT * FROM test_questions WHERE test_id = ? ORDER BY order_index').all(testId);
    
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Ошибка загрузки вопросов:', error);
    return NextResponse.json({ error: 'Ошибка загрузки вопросов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Проверяем, что пользователь админ
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 });
    }

    const { test_id, question, options, correct_answer, order_index } = await request.json();

    const result = db.prepare(`
      INSERT INTO test_questions (test_id, question, options, correct_answer, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(test_id, question, JSON.stringify(options), correct_answer, order_index);

    const questionData = db.prepare('SELECT * FROM test_questions WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json({ question: questionData });
  } catch (error) {
    console.error('Ошибка создания вопроса:', error);
    return NextResponse.json({ error: 'Ошибка создания вопроса' }, { status: 500 });
  }
}