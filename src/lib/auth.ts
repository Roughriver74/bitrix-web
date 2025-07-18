import { compare, hash } from 'bcryptjs';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { getUserById, getUserByEmail, User, createUser } from './blob-storage';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await compare(password, hash);
}

export function generateToken(user: User): string {
  return sign(
    { userId: user.id, email: user.email, isAdmin: user.is_admin },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<User | null> {
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload & { userId: number };
    return await getUserById(decoded.userId);
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Ошибка аутентификации пользователя:', error);
    return null;
  }
}

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Проверяем cookie
  const token = request.cookies.get('auth-token');
  return token?.value || null;
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    
    const user = await createUser({
      email,
      password: passwordHash,
      name,
      is_admin: false
    });
    
    return user;
  } catch (error) {
    console.error('Ошибка регистрации пользователя:', error);
    return null;
  }
}