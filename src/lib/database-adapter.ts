import { sql } from '@vercel/postgres'
import Database from 'better-sqlite3'

const isProduction = process.env.NODE_ENV === 'production'

// Типы для результатов запросов
interface QueryResult {
	rows: Record<string, unknown>[]
	insertId?: number
	rowCount?: number
}

interface RunResult {
	lastInsertRowid: number
	changes: number
}

// Интерфейс для универсального адаптера базы данных
export interface DatabaseAdapter {
	query(sql: string, params?: unknown[]): Promise<QueryResult>
	prepare(sql: string): PreparedStatement
	run(sql: string, params?: unknown[]): Promise<RunResult>
	get(
		sql: string,
		params?: unknown[]
	): Promise<Record<string, unknown> | undefined>
	all(sql: string, params?: unknown[]): Promise<Record<string, unknown>[]>
}

interface PreparedStatement {
	run(...params: unknown[]): Promise<RunResult>
	get(...params: unknown[]): Promise<Record<string, unknown> | undefined>
	all(...params: unknown[]): Promise<Record<string, unknown>[]>
}

class PostgreSQLAdapter implements DatabaseAdapter {
	async query(sqlQuery: string, params: unknown[] = []): Promise<QueryResult> {
		// Преобразуем SQLite синтаксис в PostgreSQL
		let index = 0;
		const pgQuery = sqlQuery.replace(/\?/g, () => {
			index++;
			return `$${index}`;
		});

		const result = await sql.query(pgQuery, params);
		return result as QueryResult;
	}

	prepare(sqlQuery: string): PreparedStatement {
		return {
			run: async (...params: unknown[]): Promise<RunResult> => {
				const result = await this.query(sqlQuery, params)
				return {
					lastInsertRowid: result.insertId || 0,
					changes: result.rowCount || 0,
				}
			},
			get: async (
				...params: unknown[]
			): Promise<Record<string, unknown> | undefined> => {
				const result = await this.query(sqlQuery, params)
				return result.rows[0]
			},
			all: async (...params: unknown[]): Promise<Record<string, unknown>[]> => {
				const result = await this.query(sqlQuery, params)
				return result.rows
			},
		}
	}

	async run(sqlQuery: string, params: unknown[] = []): Promise<RunResult> {
		const result = await this.query(sqlQuery, params)
		return {
			lastInsertRowid: result.insertId || 0,
			changes: result.rowCount || 0,
		}
	}

	async get(
		sqlQuery: string,
		params: unknown[] = []
	): Promise<Record<string, unknown> | undefined> {
		const result = await this.query(sqlQuery, params)
		return result.rows[0]
	}

	async all(
		sqlQuery: string,
		params: unknown[] = []
	): Promise<Record<string, unknown>[]> {
		const result = await this.query(sqlQuery, params)
		return result.rows
	}
}

class SQLiteAdapter implements DatabaseAdapter {
	private db: Database.Database

	constructor() {
		this.db = new Database('bitrix24_course.db')
	}

	async query(sqlQuery: string, params: unknown[] = []): Promise<QueryResult> {
		const result = this.db.prepare(sqlQuery).all(params) as Record<
			string,
			unknown
		>[]
		return { rows: result }
	}

	prepare(sqlQuery: string): PreparedStatement {
		const stmt = this.db.prepare(sqlQuery)
		return {
			run: async (...params: unknown[]): Promise<RunResult> => {
				const result = stmt.run(params)
				return {
					lastInsertRowid: Number(result.lastInsertRowid),
					changes: result.changes,
				}
			},
			get: async (
				...params: unknown[]
			): Promise<Record<string, unknown> | undefined> => {
				return stmt.get(params) as Record<string, unknown> | undefined
			},
			all: async (...params: unknown[]): Promise<Record<string, unknown>[]> => {
				return stmt.all(params) as Record<string, unknown>[]
			},
		}
	}

	async run(sqlQuery: string, params: unknown[] = []): Promise<RunResult> {
		const result = this.db.prepare(sqlQuery).run(params)
		return {
			lastInsertRowid: Number(result.lastInsertRowid),
			changes: result.changes,
		}
	}

	async get(
		sqlQuery: string,
		params: unknown[] = []
	): Promise<Record<string, unknown> | undefined> {
		return this.db.prepare(sqlQuery).get(params) as
			| Record<string, unknown>
			| undefined
	}

	async all(
		sqlQuery: string,
		params: unknown[] = []
	): Promise<Record<string, unknown>[]> {
		return this.db.prepare(sqlQuery).all(params) as Record<string, unknown>[]
	}
}

// Создаем адаптер в зависимости от окружения
export const db: DatabaseAdapter = isProduction
	? new PostgreSQLAdapter()
	: new SQLiteAdapter()

export default db
