import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = parseInt(params.id);
    
    if (isNaN(courseId)) {
      return NextResponse.json({ error: 'Некорректный ID курса' }, { status: 400 });
    }

    const lessons = db.prepare(`
      SELECT * FROM lessons 
      WHERE course_id = ? 
      ORDER BY order_index ASC
    `).all(courseId);

    return NextResponse.json(lessons);
  } catch (error) {
    console.error('Ошибка при получении уроков:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}