import { NextRequest, NextResponse } from 'next/server';
import { getTestQuestionById, updateTestQuestion, deleteTestQuestion } from '@/lib/postgres';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const question = await getTestQuestionById(parseInt(id));
    
    if (!question) {
      return NextResponse.json(
        { error: 'Вопрос не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ question });
  } catch (error) {
    console.error('Ошибка получения вопроса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const user = await getUserFromToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const { question, options, correct_answer, order_index } = await request.json();
    
    const updatedQuestion = await updateTestQuestion(parseInt(id), {
      question,
      options,
      correct_answer,
      order_index
    });
    
    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Вопрос не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Вопрос обновлен успешно',
      question: updatedQuestion 
    });
  } catch (error) {
    console.error('Ошибка обновления вопроса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '') || 
                  request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }
    
    const user = await getUserFromToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    const success = await deleteTestQuestion(parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Вопрос не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Вопрос удален успешно' 
    });
  } catch (error) {
    console.error('Ошибка удаления вопроса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}