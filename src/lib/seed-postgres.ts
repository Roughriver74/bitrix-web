import { sql } from '@vercel/postgres';
import { bitrixCourseStructure, advancedTests, advancedLessons } from './bitrix-content';

export async function seedPostgresDatabase() {
  try {
    console.log('Начинаем загрузку контента в PostgreSQL...');

    // Проверяем, есть ли уже контент в базе
    const existingCourses = await sql`SELECT COUNT(*) as count FROM courses`;
    const courseCount = existingCourses.rows[0].count;

    if (courseCount > 0) {
      console.log('База данных уже содержит курсы. Добавляем только новый контент...');
    }

    // Добавляем новые курсы
    for (const course of bitrixCourseStructure.courses) {
      // Проверяем, существует ли курс
      const existingCourse = await sql`
        SELECT id FROM courses WHERE title = ${course.title}
      `;

      let courseId;
      if (existingCourse.rows.length === 0) {
        // Создаем новый курс
        const courseResult = await sql`
          INSERT INTO courses (title, description, order_index)
          VALUES (${course.title}, ${course.description}, ${courseCount + bitrixCourseStructure.courses.indexOf(course)})
          RETURNING id
        `;
        courseId = courseResult.rows[0].id;
        console.log(`Создан курс: ${course.title}`);
      } else {
        courseId = existingCourse.rows[0].id;
        console.log(`Курс уже существует: ${course.title}`);
      }

      // Добавляем уроки к курсу
      for (let i = 0; i < course.lessons.length; i++) {
        const lesson = course.lessons[i];
        
        // Проверяем, существует ли урок
        const existingLesson = await sql`
          SELECT id FROM lessons WHERE title = ${lesson.title} AND course_id = ${courseId}
        `;

        if (existingLesson.rows.length === 0) {
          // Получаем полный контент урока
          let fullContent = lesson.content;
          
          // Для продвинутых курсов используем полный контент
          if (course.title.includes('автоматизация')) {
            fullContent = advancedLessons.automation;
          } else if (course.title.includes('Интеграции')) {
            fullContent = advancedLessons.integration;
          } else if (course.title.includes('Аналитика')) {
            fullContent = advancedLessons.analytics;
          }

          await sql`
            INSERT INTO lessons (course_id, title, content, order_index)
            VALUES (${courseId}, ${lesson.title}, ${fullContent}, ${i})
          `;
          console.log(`  Добавлен урок: ${lesson.title}`);
        } else {
          console.log(`  Урок уже существует: ${lesson.title}`);
        }
      }

      // Добавляем тесты для курса
      const testTopics = Object.keys(advancedTests);
      let testTopic = '';

      if (course.title.includes('автоматизация')) {
        testTopic = 'automation';
      } else if (course.title.includes('Интеграции')) {
        testTopic = 'integration';
      } else if (course.title.includes('Аналитика')) {
        testTopic = 'analytics';
      }

      if (testTopic && advancedTests[testTopic]) {
        // Создаем тест для курса
        const testTitle = `Тест: ${course.title}`;
        const existingTest = await sql`
          SELECT id FROM tests WHERE title = ${testTitle} AND course_id = ${courseId}
        `;

        let testId;
        if (existingTest.rows.length === 0) {
          const testResult = await sql`
            INSERT INTO tests (course_id, title, description)
            VALUES (${courseId}, ${testTitle}, ${'Проверочный тест по курсу'})
            RETURNING id
          `;
          testId = testResult.rows[0].id;
          console.log(`  Создан тест: ${testTitle}`);
        } else {
          testId = existingTest.rows[0].id;
          console.log(`  Тест уже существует: ${testTitle}`);
        }

        // Добавляем вопросы к тесту
        const questions = advancedTests[testTopic];
        for (let j = 0; j < questions.length; j++) {
          const question = questions[j];
          
          const existingQuestion = await sql`
            SELECT id FROM test_questions 
            WHERE test_id = ${testId} AND question = ${question.question}
          `;

          if (existingQuestion.rows.length === 0) {
            await sql`
              INSERT INTO test_questions (test_id, question, options, correct_answer, order_index)
              VALUES (${testId}, ${question.question}, ${JSON.stringify(question.options)}, ${question.correct}, ${j})
            `;
            console.log(`    Добавлен вопрос ${j + 1}`);
          } else {
            console.log(`    Вопрос уже существует: ${j + 1}`);
          }
        }
      }
    }

    // Добавляем базовые курсы, если их нет
    if (courseCount === 0) {
      await addBasicCourses();
    }

    console.log('Загрузка контента завершена успешно!');
  } catch (error) {
    console.error('Ошибка при загрузке контента:', error);
    throw error;
  }
}

async function addBasicCourses() {
  console.log('Добавляем базовые курсы...');

  const basicCourses = [
    {
      title: "Основы работы с Битрикс24",
      description: "Изучение базовых возможностей платформы: CRM, задачи, проекты",
      lessons: [
        {
          title: "Введение в Битрикс24",
          content: `# Введение в Битрикс24

Битрикс24 — это комплексное решение для автоматизации бизнес-процессов компании.

## Основные модули:
- **CRM** — система управления клиентами
- **Задачи и проекты** — планирование работы
- **Документы** — совместная работа с файлами
- **Общение** — чаты, видеозвонки
- **Сайты** — создание корпоративных сайтов

## Первые шаги:
1. Регистрация аккаунта
2. Настройка профиля
3. Изучение интерфейса
4. Добавление сотрудников

Битрикс24 поможет организовать работу вашей команды и повысить эффективность бизнеса.`
        },
        {
          title: "Настройка CRM",
          content: `# Настройка CRM в Битрикс24

CRM (Customer Relationship Management) — система управления взаимоотношениями с клиентами.

## Основные сущности CRM:
- **Лиды** — потенциальные клиенты
- **Сделки** — процесс продаж
- **Контакты** — физические лица
- **Компании** — юридические лица

## Настройка воронки продаж:
1. Создание стадий сделок
2. Настройка полей
3. Автоматизация процессов
4. Назначение ответственных

## Работа с лидами:
- Создание лида вручную
- Импорт из файла
- Веб-формы на сайте
- Интеграция с рекламными системами

Правильная настройка CRM — основа эффективных продаж.`
        }
      ]
    }
  ];

  for (const course of basicCourses) {
    const courseResult = await sql`
      INSERT INTO courses (title, description, order_index)
      VALUES (${course.title}, ${course.description}, 0)
      RETURNING id
    `;
    const courseId = courseResult.rows[0].id;

    for (let i = 0; i < course.lessons.length; i++) {
      const lesson = course.lessons[i];
      await sql`
        INSERT INTO lessons (course_id, title, content, order_index)
        VALUES (${courseId}, ${lesson.title}, ${lesson.content}, ${i})
      `;
    }

    console.log(`Добавлен базовый курс: ${course.title}`);
  }
}