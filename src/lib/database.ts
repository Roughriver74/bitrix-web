import Database from 'better-sqlite3';
import { hash } from 'bcryptjs';

const db = new Database('bitrix24_course.db');

// Создание таблиц
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id)
  );

  CREATE TABLE IF NOT EXISTS tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses (id),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id)
  );

  CREATE TABLE IF NOT EXISTS test_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    options TEXT NOT NULL, -- JSON массив вариантов
    correct_answer INTEGER NOT NULL,
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY (test_id) REFERENCES tests (id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    lesson_id INTEGER,
    completed BOOLEAN DEFAULT FALSE,
    score INTEGER,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (course_id) REFERENCES courses (id),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id)
  );

  CREATE TABLE IF NOT EXISTS test_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    test_id INTEGER NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    answers TEXT NOT NULL, -- JSON массив ответов
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (test_id) REFERENCES tests (id)
  );
`);

// Создание админского пользователя по умолчанию
const createAdminUser = async () => {
  const existingAdmin = db.prepare('SELECT id FROM users WHERE is_admin = 1').get();
  
  if (!existingAdmin) {
    const passwordHash = await hash('admin123', 12);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, is_admin)
      VALUES (?, ?, ?, ?)
    `).run('admin@bitrix24course.ru', passwordHash, 'Администратор', 1);
    
    console.log('Создан админский пользователь: admin@bitrix24course.ru / admin123');
  }
};

// Создание дополнительного администратора
const createAdditionalAdmin = async () => {
  const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get('roughriver74@gmail.com');
  
  if (!existingUser) {
    const passwordHash = await hash('bitrix2024', 12);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, is_admin)
      VALUES (?, ?, ?, ?)
    `).run('roughriver74@gmail.com', passwordHash, 'Главный администратор', 1);
    
    console.log('Создан дополнительный админ: roughriver74@gmail.com / bitrix2024');
  } else {
    // Если пользователь существует, убедимся что он админ
    db.prepare('UPDATE users SET is_admin = 1 WHERE email = ?').run('roughriver74@gmail.com');
    console.log('Пользователь roughriver74@gmail.com получил права администратора');
  }
};

// Инициализация базы данных
createAdminUser();
createAdditionalAdmin();

// Наполнение базы данных (если пусто)
const checkAndSeedDatabase = async () => {
  const existingCourses = db.prepare('SELECT COUNT(*) as count FROM courses').get() as { count: number };
  
  if (existingCourses.count === 0) {
    console.log('База данных пуста. Загружаем контент...');
    try {
      const { seedDatabase } = await import('./seed');
      await seedDatabase();
    } catch (error) {
      console.error('Ошибка при загрузке контента:', error);
    }
  }
};

checkAndSeedDatabase();

export default db;