import { NextRequest, NextResponse } from 'next/server';
import { getLessonsByCourse } from '@/lib/postgres';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const courseId = parseInt(id);

    if (isNaN(courseId)) {
      return NextResponse.json(
        { error: 'Некорректный ID курса' },
        { status: 400 }
      );
    }

    const lessons = await getLessonsByCourse(courseId);
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Ошибка получения уроков курса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}