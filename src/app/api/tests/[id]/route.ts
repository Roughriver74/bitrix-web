import { NextRequest, NextResponse } from 'next/server';
import { getTestById, updateTest, deleteTest } from '@/lib/postgres';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const test = await getTestById(parseInt(id));
    
    if (!test) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ test });
  } catch (error) {
    console.error('Ошибка получения теста:', error);
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
    const { title, description } = await request.json();
    
    const updatedTest = await updateTest(parseInt(id), {
      title,
      description
    });
    
    if (!updatedTest) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Тест обновлен успешно',
      test: updatedTest 
    });
  } catch (error) {
    console.error('Ошибка обновления теста:', error);
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
    const success = await deleteTest(parseInt(id));
    
    if (!success) {
      return NextResponse.json(
        { error: 'Тест не найден' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Тест удален успешно' 
    });
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}