import { compare, hash } from 'bcryptjs';
import { sign, verify, JwtPayload } from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import db from './database';
import { User } from '@/types';

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

export function getUserFromToken(token: string): User | null {
  try {
    const decoded = verify(token, JWT_SECRET) as JwtPayload & { userId: number };
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId) as User;
    return user;
  } catch {
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

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as User & { password_hash: string };
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    return null;
  }
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function registerUser(email: string, password: string, name: string): Promise<User | null> {
  try {
    const passwordHash = await hashPassword(password);
    
    const result = db.prepare(`
      INSERT INTO users (email, password_hash, name)
      VALUES (?, ?, ?)
    `).run(email, passwordHash, name);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as User;
    return user;
  } catch {
    return null;
  }
}