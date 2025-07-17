import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { path: filePath } = await params;
    const fileName = filePath.join('/');
    
    // Проверяем, что файл находится в папке uploads
    const fullPath = path.join(process.cwd(), 'public', 'uploads', fileName);
    
    // Проверяем, существует ли файл
    try {
      await stat(fullPath);
    } catch {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 404 });
    }
    
    // Читаем файл
    const fileBuffer = await readFile(fullPath);
    
    // Определяем MIME-тип по расширению
    const extension = path.extname(fileName).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    
    const mimeType = mimeTypes[extension] || 'application/octet-stream';
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Ошибка получения файла:', error);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}