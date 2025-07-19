import { NextRequest, NextResponse } from 'next/server';
import { getCourseById } from '@/lib/blob-storage';

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

    // Получаем курс с уроками из Blob storage
    try {
      const course = await getCourseById(courseId);
      if (course && course.lessons) {
        return NextResponse.json({ lessons: course.lessons });
      } else {
        return NextResponse.json({ lessons: [] });
      }
    } catch (blobError) {
      console.log('Blob storage недоступен, возвращаем пустой массив');
      return NextResponse.json({ lessons: [] });
    }
  } catch (error) {
    console.error('Ошибка получения уроков курса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}