import { NextResponse } from 'next/server';
import { getConnectionStatus } from '@/lib/postgres-check';

export async function GET() {
  try {
    const status = getConnectionStatus();
    
    return NextResponse.json({
      status: status.hasPostgres ? 'healthy' : 'error',
      message: status.message,
      postgres: status.hasPostgres,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      missingVars: status.hasPostgres ? [] : status.requiredVars.filter(varName => !process.env[varName])
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Ошибка при проверке состояния системы',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}