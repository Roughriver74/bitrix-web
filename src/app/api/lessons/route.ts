import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import db from '@/lib/database';
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
    
    const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(courseId) as Lesson[];
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
        { error: 'ID курса, название и содержание обязательны' },
        { status: 400 }
      );
    }
    
    const result = db.prepare(`
      INSERT INTO lessons (course_id, title, content, order_index)
      VALUES (?, ?, ?, ?)
    `).run(course_id, title, content, order_index || 0);
    
    const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(result.lastInsertRowid) as Lesson;
    
    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}