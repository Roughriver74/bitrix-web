import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken, getUserFromToken } from '@/lib/auth';
import db from '@/lib/database';
import { Course } from '@/types';

export async function GET() {
  try {
    const courses = db.prepare('SELECT * FROM courses ORDER BY order_index ASC').all() as Course[];
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
    
    const user = getUserFromToken(token);
    
    if (!user || !user.is_admin) {
      return NextResponse.json(
        { error: 'Недостаточно прав' },
        { status: 403 }
      );
    }
    
    const { title, description, image_url, order_index } = await request.json();
    
    if (!title) {
      return NextResponse.json(
        { error: 'Название курса обязательно' },
        { status: 400 }
      );
    }
    
    const result = db.prepare(`
      INSERT INTO courses (title, description, image_url, order_index)
      VALUES (?, ?, ?, ?)
    `).run(title, description, image_url, order_index || 0);
    
    const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid) as Course;
    
    return NextResponse.json({ course });
  } catch (error) {
    console.error('Ошибка создания курса:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}