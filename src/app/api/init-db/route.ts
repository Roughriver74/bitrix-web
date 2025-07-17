import { NextResponse } from 'next/server';
import { createTables, createDefaultAdmin } from '@/lib/postgres';

export async function POST() {
  try {
    // Создаем таблицы
    await createTables();
    
    // Создаем администраторов
    await createDefaultAdmin();
    
    return NextResponse.json({ 
      message: 'База данных инициализирована успешно',
      success: true 
    });
  } catch (error) {
    console.error('Ошибка инициализации базы данных:', error);
    return NextResponse.json({ 
      error: 'Ошибка инициализации базы данных',
      details: error instanceof Error ? error.message : 'Unknown error',
      success: false 
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Используйте POST для инициализации базы данных' 
  });
}