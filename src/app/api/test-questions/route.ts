import { NextRequest, NextResponse } from 'next/server';
import { getTestQuestions, createTestQuestion, getUserFromToken } from '@/lib/postgres';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json({ error: 'ID теста обязателен' }, { status: 400 });
    }

    const questions = await getTestQuestions(parseInt(testId));
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

    // Проверяем, что пользователь админ
    const user = await getUserFromToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const { test_id, question, options, correct_answer, order_index } = await request.json();

    if (!test_id || !question || !options || correct_answer === undefined) {
      return NextResponse.json({
        error: 'Обязательные поля: test_id, question, options, correct_answer'
      }, { status: 400 });
    }

    const testQuestion = await createTestQuestion({
      test_id: parseInt(test_id),
      question,
      options,
      correct_answer: parseInt(correct_answer),
      order_index: order_index || 0
    });

    return NextResponse.json({ 
      message: 'Вопрос создан успешно',
      question: testQuestion 
    });
  } catch (error) {
    console.error('Ошибка создания вопроса:', error);
    return NextResponse.json({ error: 'Ошибка создания вопроса' }, { status: 500 });
  }
}