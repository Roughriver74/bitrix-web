import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Успешный выход' });
  
  // Удаляем cookie с токеном
  response.cookies.delete('auth-token');
  
  return response;
}