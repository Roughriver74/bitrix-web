import { NextResponse } from 'next/server';
import { getConnectionStatus } from '@/lib/postgres-check';
import { checkBlobConnection } from '@/lib/blob-storage';

export async function GET() {
  try {
    const status = getConnectionStatus();
    
    // Дополнительная проверка соединения с Blob
    let blobConnected = false;
    try {
      blobConnected = await checkBlobConnection();
    } catch (error) {
      console.error('Ошибка проверки Blob:', error);
    }
    
    return NextResponse.json({
      status: (status.hasBlob && blobConnected) ? 'healthy' : 'error',
      message: status.message,
      blob: status.hasBlob,
      blobConnected,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      missingVars: status.hasBlob ? [] : status.requiredVars.filter(varName => !process.env[varName])
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при проверке состояния системы',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}