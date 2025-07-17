import { sql } from '@vercel/postgres';
import Database from 'better-sqlite3';

const isProduction = process.env.NODE_ENV === 'production';

// Интерфейс для универсального адаптера базы данных
export interface DatabaseAdapter {
  query(sql: string, params?: any[]): Promise<any>;
  prepare(sql: string): any;
  run(sql: string, params?: any[]): Promise<any>;
  get(sql: string, params?: any[]): Promise<any>;
  all(sql: string, params?: any[]): Promise<any[]>;
}

class PostgreSQLAdapter implements DatabaseAdapter {
  async query(sqlQuery: string, params: any[] = []): Promise<any> {
    // Преобразуем SQLite синтаксис в PostgreSQL
    let pgQuery = sqlQuery
      .replace(/\?/g, () => {
        const index = (pgQuery.match(/\$/g) || []).length + 1;
        return `$${index}`;
      });
    
    const result = await sql.query(pgQuery, params);
    return result;
  }
  
  prepare(sqlQuery: string): any {
    return {
      run: async (...params: any[]) => {
        const result = await this.query(sqlQuery, params);
        return { lastInsertRowid: result.insertId, changes: result.rowCount };
      },
      get: async (...params: any[]) => {
        const result = await this.query(sqlQuery, params);
        return result.rows[0];
      },
      all: async (...params: any[]) => {
        const result = await this.query(sqlQuery, params);
        return result.rows;
      }
    };
  }
  
  async run(sqlQuery: string, params: any[] = []): Promise<any> {
    const result = await this.query(sqlQuery, params);
    return { lastInsertRowid: result.insertId, changes: result.rowCount };
  }
  
  async get(sqlQuery: string, params: any[] = []): Promise<any> {
    const result = await this.query(sqlQuery, params);
    return result.rows[0];
  }
  
  async all(sqlQuery: string, params: any[] = []): Promise<any[]> {
    const result = await this.query(sqlQuery, params);
    return result.rows;
  }
}

class SQLiteAdapter implements DatabaseAdapter {
  private db: Database.Database;
  
  constructor() {
    this.db = new Database('bitrix24_course.db');
  }
  
  async query(sqlQuery: string, params: any[] = []): Promise<any> {
    return this.db.prepare(sqlQuery).all(params);
  }
  
  prepare(sqlQuery: string): any {
    return this.db.prepare(sqlQuery);
  }
  
  async run(sqlQuery: string, params: any[] = []): Promise<any> {
    return this.db.prepare(sqlQuery).run(params);
  }
  
  async get(sqlQuery: string, params: any[] = []): Promise<any> {
    return this.db.prepare(sqlQuery).get(params);
  }
  
  async all(sqlQuery: string, params: any[] = []): Promise<any[]> {
    return this.db.prepare(sqlQuery).all(params);
  }
}

// Создаем адаптер в зависимости от окружения
export const db: DatabaseAdapter = isProduction ? new PostgreSQLAdapter() : new SQLiteAdapter();

export default db;