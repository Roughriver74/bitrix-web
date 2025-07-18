import { NextRequest, NextResponse } from 'next/server';
import { getTestsByCourse, createTest, getUserFromToken } from '@/lib/postgres';
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
    const courseId = searchParams.get('courseId');

    let tests: any[];
    if (courseId) {
      tests = await getTestsByCourse(parseInt(courseId));
    } else {
      // Если не указан courseId, возвращаем пустой массив или все тесты
      tests = [];
    }
    
    return NextResponse.json({ tests });
  } catch (error) {
    console.error('Ошибка загрузки тестов:', error);
    return NextResponse.json({ error: 'Ошибка загрузки тестов' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    // Проверяем, что пользователь админ
    const user = await getUserFromToken(token);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Недостаточно прав' }, { status: 403 });
    }

    const { course_id, lesson_id, title, description } = await request.json();

    if (!course_id || !title) {
      return NextResponse.json(
        { error: 'Обязательные поля: course_id, title' },
        { status: 400 }
      );
    }

    const test = await createTest({
      course_id: parseInt(course_id),
      lesson_id: lesson_id ? parseInt(lesson_id) : null,
      title,
      description: description || ''
    });

    return NextResponse.json({ 
      message: 'Тест создан успешно',
      test 
    });
  } catch (error) {
    console.error('Ошибка создания теста:', error);
    return NextResponse.json({ error: 'Ошибка создания теста' }, { status: 500 });
  }
}