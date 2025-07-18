import { NextRequest, NextResponse } from 'next/server';
import { createTestResult, getUserFromToken } from '@/lib/postgres';
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
    const { test_id, score, answers, total_questions } = await request.json();

    if (!test_id || score === undefined || !answers || !total_questions) {
      return NextResponse.json({
        error: 'Обязательные поля: test_id, score, answers, total_questions'
      }, { status: 400 });
    }

    const result = await createTestResult({
      user_id: decoded.userId,
      test_id: parseInt(test_id),
      score: parseInt(score),
      total_questions: parseInt(total_questions),
      answers: JSON.stringify(answers)
    });

    return NextResponse.json({ 
      message: 'Результат теста сохранен успешно',
      result 
    });
  } catch (error) {
    console.error('Ошибка сохранения результата теста:', error);
    return NextResponse.json({ error: 'Ошибка сохранения результата теста' }, { status: 500 });
  }
}