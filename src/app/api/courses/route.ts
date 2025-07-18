import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { getAllCourses, createCourse } from '@/lib/blob-storage';

export async function GET() {
  try {
    const courses = await getAllCourses();
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Ошибка получения курсов:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request);
    
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
    
    const { title, description } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Название курса обязательно' },
        { status: 400 }
      );
    }
    
    const course = await createCourse({
      title,
      description: description || '',
      order_index: 0
    });
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Ошибка создания курса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}