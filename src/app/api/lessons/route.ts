import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import { getLessonsByCourse, createLesson } from '@/lib/postgres';
import { Lesson } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    
    if (!courseId) {
      return NextResponse.json(
        { error: 'ID курса обязателен' },
        { status: 400 }
      );
    }
    
    const lessons = await getLessonsByCourse(parseInt(courseId));
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Ошибка получения уроков:', error);
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
    
    const user = getUserFromToken(token);
    
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }
    
    const { course_id, title, content, order_index } = await request.json();
    
    if (!course_id || !title || !content) {
      return NextResponse.json(
        { error: 'Обязательные поля: course_id, title, content' },
        { status: 400 }
      );
    }
    
    const lesson = await createLesson({
      course_id: parseInt(course_id),
      title,
      content,
      order_index: order_index || 0
    });
    
    return NextResponse.json({ 
      message: 'Урок создан успешно',
      lesson 
    });
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
