import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    // Проверяем, что пользователь админ
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as { id: number; email: string; name: string; is_admin: boolean } | undefined;
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 });
    }

    const { id } = await params;
    const { question, options, correct_answer, order_index } = await request.json();

    db.prepare(`
      UPDATE test_questions 
      SET question = ?, options = ?, correct_answer = ?, order_index = ?
      WHERE id = ?
    `).run(question, JSON.stringify(options), correct_answer, order_index, id);

    const questionData = db.prepare('SELECT * FROM test_questions WHERE id = ?').get(id);
    
    return NextResponse.json({ question: questionData });
  } catch (error) {
    console.error('Ошибка обновления вопроса:', error);
    return NextResponse.json({ error: 'Ошибка обновления вопроса' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: number };
    
    // Проверяем, что пользователь админ
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as { id: number; email: string; name: string; is_admin: boolean } | undefined;
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Нет прав доступа' }, { status: 403 });
    }

    const { id } = await params;

    db.prepare('DELETE FROM test_questions WHERE id = ?').run(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления вопроса:', error);
    return NextResponse.json({ error: 'Ошибка удаления вопроса' }, { status: 500 });
  }
}