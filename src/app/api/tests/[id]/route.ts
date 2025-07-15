import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const { id } = await params;
    
    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(id);
    
    if (!test) {
      return NextResponse.json({ error: 'Тест не найден' }, { status: 404 });
    }

    // Получаем вопросы теста
    const questions = db.prepare('SELECT * FROM test_questions WHERE test_id = ? ORDER BY order_index').all(id);
    
    return NextResponse.json({ test, questions });
  } catch (error) {
    console.error('Ошибка загрузки теста:', error);
    return NextResponse.json({ error: 'Ошибка загрузки теста' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const { title, description } = await request.json();

    db.prepare(`
      UPDATE tests 
      SET title = ?, description = ?
      WHERE id = ?
    `).run(title, description, id);

    const test = db.prepare('SELECT * FROM tests WHERE id = ?').get(id);
    
    return NextResponse.json({ test });
  } catch (error) {
    console.error('Ошибка обновления теста:', error);
    return NextResponse.json({ error: 'Ошибка обновления теста' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    // Удаляем вопросы теста
    db.prepare('DELETE FROM test_questions WHERE test_id = ?').run(id);
    
    // Удаляем результаты теста
    db.prepare('DELETE FROM test_results WHERE test_id = ?').run(id);
    
    // Удаляем сам тест
    db.prepare('DELETE FROM tests WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления теста:', error);
    return NextResponse.json({ error: 'Ошибка удаления теста' }, { status: 500 });
  }
}