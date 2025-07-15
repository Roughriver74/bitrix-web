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
    const courseId = searchParams.get('courseId');

    let query = 'SELECT * FROM tests';
    let params: any[] = [];

    if (courseId) {
      query += ' WHERE course_id = ?';
      params.push(courseId);
    }

    query += ' ORDER BY created_at DESC';

    const tests = db.prepare(query).all(...params);
    
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

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    // Проверяем, что пользователь админ
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 });
    }

    const { course_id, lesson_id, title, description } = await request.json();

    const result = db.prepare(`
      INSERT INTO tests (course_id, lesson_id, title, description)
      VALUES (?, ?, ?, ?)
    `).run(course_id, lesson_id, title, description);

    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json({ test });
  } catch (error) {
    console.error('Ошибка создания теста:', error);
    return NextResponse.json({ error: 'Ошибка создания теста' }, { status: 500 });
  }
}