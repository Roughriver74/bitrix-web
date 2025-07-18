import { NextResponse } from 'next/server';
import { createTables, createDefaultAdmin } from '@/lib/postgres';
import { seedPostgresDatabase } from '@/lib/seed-postgres';
import { checkPostgresConnection } from '@/lib/postgres-check';

export async function POST(request: Request) {
  try {
    // Проверяем подключение к PostgreSQL
    if (!checkPostgresConnection()) {
      return NextResponse.json({
        error: 'PostgreSQL не настроен',
        message: 'Отсутствуют переменные окружения для подключения к PostgreSQL',
        requiredVars: ['POSTGRES_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'],
        success: false
      }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const loadContent = searchParams.get('loadContent') === 'true';
    
    // Создаем таблицы
    await createTables();
    
    // Создаем администраторов
    await createDefaultAdmin();
    
    // Загружаем контент, если указан параметр
    if (loadContent) {
      await seedPostgresDatabase();
    }
    
    return NextResponse.json({ 
      message: loadContent 
        ? 'База данных инициализирована и контент загружен успешно'
        : 'База данных инициализирована успешно',
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