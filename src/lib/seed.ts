import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const db = new Database('bitrix24_course.db');

// Функция для чтения файла с контентом
function readMarkdownFile(filePath: string): string {
  try {
    const fullPath = join(process.cwd(), '..', filePath);
    return readFileSync(fullPath, 'utf-8');
  } catch (error) {
    console.error(`Ошибка чтения файла ${filePath}:`, error);
    return '';
  }
}

// Функция для создания курсов
function createCourses() {
  const courses = [
    {
      title: 'Задачи и проекты в Битрикс24',
      description: 'Освойте создание и управление задачами, работу с проектами и принципы делегирования в Битрикс24',
      order_index: 1
    },
    {
      title: 'Фильтры и поиск в Битрикс24',
      description: 'Научитесь эффективно использовать систему фильтров и расширенный поиск для работы с данными',
      order_index: 2
    },
    {
      title: 'Календарь в Битрикс24',
      description: 'Изучите планирование встреч, мероприятий и интеграцию календаря с другими модулями',
      order_index: 3
    },
    {
      title: 'Чаты и коммуникации в Битрикс24',
      description: 'Освойте внутренние коммуникации, видеозвонки и систему уведомлений',
      order_index: 4
    },
    {
      title: 'Битрикс24.Диск',
      description: 'Научитесь работать с файлами, совместным редактированием и синхронизацией',
      order_index: 5
    },
    {
      title: 'Лента активности',
      description: 'Изучите социальную сеть компании, публикации и взаимодействие с коллегами',
      order_index: 6
    },
    {
      title: 'Дополнительные функции Битрикс24',
      description: 'Познакомьтесь с отчетами, автоматизацией, интеграциями и администрированием',
      order_index: 7
    }
  ];

  courses.forEach(course => {
    const result = db.prepare(`
      INSERT OR REPLACE INTO courses (title, description, order_index)
      VALUES (?, ?, ?)
    `).run(course.title, course.description, course.order_index);
    
    console.log(`Создан курс: ${course.title}`);
  });
}

// Функция для создания уроков
function createLessons() {
  const lessons = [
    {
      course_id: 1,
      title: 'Основы работы с задачами',
      content: readMarkdownFile('курс-битрикс24/модули/01-задачи/теория.md'),
      order_index: 1
    },
    {
      course_id: 2,
      title: 'Система фильтров и поиска',
      content: readMarkdownFile('курс-битрикс24/модули/02-фильтры/теория.md'),
      order_index: 1
    },
    {
      course_id: 3,
      title: 'Работа с календарем',
      content: readMarkdownFile('курс-битрикс24/модули/03-календарь/теория.md'),
      order_index: 1
    },
    {
      course_id: 4,
      title: 'Чаты и коммуникации',
      content: readMarkdownFile('курс-битрикс24/модули/04-чаты/теория.md'),
      order_index: 1
    },
    {
      course_id: 5,
      title: 'Работа с файлами',
      content: readMarkdownFile('курс-битрикс24/модули/05-диск/теория.md'),
      order_index: 1
    },
    {
      course_id: 6,
      title: 'Лента активности',
      content: readMarkdownFile('курс-битрикс24/модули/06-лента/теория.md'),
      order_index: 1
    },
    {
      course_id: 7,
      title: 'Дополнительные возможности',
      content: readMarkdownFile('курс-битрикс24/модули/07-дополнительно/теория.md'),
      order_index: 1
    },
    // Дополнительные уроки
    {
      course_id: 1,
      title: 'Практические задания по задачам',
      content: readMarkdownFile('курс-битрикс24/упражнения/задачи/практические-задания.md'),
      order_index: 2
    }
  ];

  lessons.forEach(lesson => {
    if (lesson.content) {
      const result = db.prepare(`
        INSERT OR REPLACE INTO lessons (course_id, title, content, order_index)
        VALUES (?, ?, ?, ?)
      `).run(lesson.course_id, lesson.title, lesson.content, lesson.order_index);
      
      console.log(`Создан урок: ${lesson.title}`);
    }
  });
}

// Функция для создания тестов
function createTests() {
  const tests = [
    {
      course_id: 1,
      title: 'Тест по модулю "Задачи"',
      description: 'Проверьте свои знания по работе с задачами и проектами в Битрикс24'
    },
    {
      course_id: 0, // Итоговый тест для всех курсов
      title: 'Итоговый тест по Битрикс24',
      description: 'Комплексный тест по всем модулям курса обучения основам Битрикс24'
    }
  ];

  tests.forEach(test => {
    const result = db.prepare(`
      INSERT OR REPLACE INTO tests (course_id, title, description)
      VALUES (?, ?, ?)
    `).run(test.course_id, test.title, test.description);
    
    console.log(`Создан тест: ${test.title}`);
  });
}

// Функция для создания вопросов тестов
function createTestQuestions() {
  // Вопросы для теста по задачам
  const tasksQuestions = [
    {
      test_id: 1,
      question: 'Какие статусы может иметь задача в Битрикс24?',
      options: JSON.stringify([
        'Новая, В работе, Завершена',
        'Новая, Выполняется, Ждет контроля, Завершена',
        'Создана, В процессе, Готова',
        'Открыта, Закрыта'
      ]),
      correct_answer: 1,
      order_index: 1
    },
    {
      test_id: 1,
      question: 'Как создать повторяющуюся задачу?',
      options: JSON.stringify([
        'Скопировать существующую задачу',
        'Отметить "Повторяющаяся" при создании задачи',
        'Создать шаблон задачи',
        'Использовать автоматизацию'
      ]),
      correct_answer: 1,
      order_index: 2
    },
    {
      test_id: 1,
      question: 'Что такое диаграмма Ганта?',
      options: JSON.stringify([
        'График загрузки сотрудников',
        'Календарь проекта',
        'Инструмент для временного планирования проектов',
        'Отчет по задачам'
      ]),
      correct_answer: 2,
      order_index: 3
    },
    {
      test_id: 1,
      question: 'Какие приоритеты задач доступны в Битрикс24?',
      options: JSON.stringify([
        'Только высокий и низкий',
        'Низкий, Обычный, Высокий, Критический',
        'От 1 до 5',
        'Срочно, Не срочно'
      ]),
      correct_answer: 1,
      order_index: 4
    },
    {
      test_id: 1,
      question: 'Как делегировать задачу другому сотруднику?',
      options: JSON.stringify([
        'Создать новую задачу',
        'Изменить исполнителя в существующей задаче',
        'Отправить сообщение в чат',
        'Использовать календарь'
      ]),
      correct_answer: 1,
      order_index: 5
    }
  ];

  // Вопросы для итогового теста
  const finalQuestions = [
    {
      test_id: 2,
      question: 'Что такое Битрикс24?',
      options: JSON.stringify([
        'Только CRM система',
        'Корпоративный портал и система управления',
        'Система учета документов',
        'Интернет-магазин'
      ]),
      correct_answer: 1,
      order_index: 1
    },
    {
      test_id: 2,
      question: 'Какие основные модули включает Битрикс24?',
      options: JSON.stringify([
        'Только задачи и календарь',
        'CRM, задачи, календарь, документы, чаты',
        'Только документооборот',
        'Интернет-магазин и склад'
      ]),
      correct_answer: 1,
      order_index: 2
    },
    {
      test_id: 2,
      question: 'Как создать групповой чат в Битрикс24?',
      options: JSON.stringify([
        'Отправить email всем участникам',
        'Нажать "Создать чат" и добавить участников',
        'Создать задачу для группы',
        'Использовать календарь'
      ]),
      correct_answer: 1,
      order_index: 3
    },
    {
      test_id: 2,
      question: 'Какие форматы файлов поддерживает Битрикс24.Диск?',
      options: JSON.stringify([
        'Только Microsoft Office',
        'Большинство популярных форматов',
        'Только изображения',
        'Только PDF'
      ]),
      correct_answer: 1,
      order_index: 4
    },
    {
      test_id: 2,
      question: 'Как синхронизировать календарь Битрикс24 с внешними календарями?',
      options: JSON.stringify([
        'Экспортировать файл и импортировать',
        'Использовать настройки синхронизации',
        'Копировать события вручную',
        'Это невозможно'
      ]),
      correct_answer: 1,
      order_index: 5
    }
  ];

  const allQuestions = [...tasksQuestions, ...finalQuestions];

  allQuestions.forEach(question => {
    const result = db.prepare(`
      INSERT OR REPLACE INTO test_questions (test_id, question, options, correct_answer, order_index)
      VALUES (?, ?, ?, ?, ?)
    `).run(question.test_id, question.question, question.options, question.correct_answer, question.order_index);
    
    console.log(`Создан вопрос: ${question.question.substring(0, 50)}...`);
  });
}

// Основная функция инициализации
export async function seedDatabase() {
  try {
    console.log('Начинаем наполнение базы данных...');
    
    // Очищаем существующие данные
    db.exec('DELETE FROM test_questions');
    db.exec('DELETE FROM tests');
    db.exec('DELETE FROM lessons');
    db.exec('DELETE FROM courses');
    db.exec('DELETE FROM user_progress');
    db.exec('DELETE FROM test_results');
    
    // Создаем контент
    createCourses();
    createLessons();
    createTests();
    createTestQuestions();
    
    console.log('База данных успешно наполнена!');
    
  } catch (error) {
    console.error('Ошибка при наполнении базы данных:', error);
  }
}

// Запуск, если файл выполняется напрямую
if (require.main === module) {
  seedDatabase();
}