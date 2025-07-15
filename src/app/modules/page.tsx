'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';

interface Course {
  id: number;
  title: string;
  description: string;
  order_index: number;
  created_at: string;
}

interface Progress {
  course_id: number;
  completed: boolean;
  score: number;
}

export default function ModulesPage() {
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<number, Progress>>({});
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
      setCourses([]);
    } finally {
      setLoadingCourses(false);
    }
  };

  if (loading || loadingCourses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Необходима авторизация</h2>
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            Вернуться на главную
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800">
            ← Назад к главной
          </Link>
          <div className="text-lg font-semibold text-gray-900">
            Добро пожаловать, {user?.name}!
          </div>
        </nav>

        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Модули курса по Битрикс24
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Пройдите все модули для получения полного представления о системе Битрикс24
          </p>
        </header>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {courses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-4">
                      {course.order_index}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {course.title}
                    </h2>
                  </div>
                  <p className="text-gray-600 mb-4 ml-14">
                    {course.description}
                  </p>
                  <div className="ml-14 flex items-center space-x-4">
                    <Link
                      href={`/courses/${course.id}`}
                      className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Изучить модуль
                    </Link>
                    <Link
                      href={`/courses/${course.id}/test`}
                      className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Пройти тест
                    </Link>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  {progress[course.id] && (
                    <div className="text-sm text-gray-500">
                      {progress[course.id].completed ? (
                        <span className="text-green-600 font-semibold">
                          ✓ Завершено
                        </span>
                      ) : (
                        <span className="text-yellow-600 font-semibold">
                          В процессе
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Курсы не найдены
            </h2>
            <p className="text-gray-600 mb-6">
              Курсы еще не загружены в систему
            </p>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800"
            >
              Вернуться на главную
            </Link>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Структура обучения
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl mb-2">📚</div>
                <h3 className="font-semibold text-gray-900 mb-2">Теория</h3>
                <p className="text-gray-600 text-sm">
                  Изучение основных понятий и принципов
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Практика</h3>
                <p className="text-gray-600 text-sm">
                  Выполнение практических заданий
                </p>
              </div>
              <div>
                <div className="text-3xl mb-2">📋</div>
                <h3 className="font-semibold text-gray-900 mb-2">Тестирование</h3>
                <p className="text-gray-600 text-sm">
                  Проверка полученных знаний
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}