'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Test, TestQuestion, Course } from '@/types';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';

export default function TestsPage() {
  const { user, loading } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [showTestForm, setShowTestForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [managingQuestions, setManagingQuestions] = useState<Test | null>(null);

  useEffect(() => {
    if (user) {
      fetchTests();
      fetchCourses();
    }
  }, [user]);

  const fetchTests = async () => {
    try {
      const response = await fetch('/api/tests');
      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
      }
    } catch (error) {
      console.error('Ошибка загрузки тестов:', error);
    } finally {
      setTestsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data.courses);
      }
    } catch (error) {
      console.error('Ошибка загрузки курсов:', error);
    }
  };

  const handleDeleteTest = async (testId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот тест?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tests/${testId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTests(tests.filter(test => test.id !== testId));
      }
    } catch (error) {
      console.error('Ошибка удаления теста:', error);
    }
  };

  if (loading || testsLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">Загрузка...</div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-400">Доступ запрещен</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Управление тестами
              </h1>
              <p className="text-gray-300 text-sm md:text-base">Создание и редактирование тестов</p>
            </div>
            <div className="flex flex-wrap gap-2 md:space-x-2">
              <ThemeToggle />
              <Link 
                href="/admin" 
                className="bg-gray-600 text-white px-3 py-2 md:px-4 rounded text-sm md:text-base hover:bg-gray-700 flex-1 md:flex-none text-center"
              >
                Назад
              </Link>
            </div>
          </div>
        </div>

        {/* Информация */}
        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3 md:p-4 mb-4 md:mb-6">
          <div className="flex items-start space-x-3">
            <div className="text-blue-400 mt-0.5">ℹ️</div>
            <div>
              <h3 className="text-blue-200 font-medium text-sm md:text-base">Режим просмотра</h3>
              <p className="text-blue-300 text-xs md:text-sm mt-1">
                Тесты загружаются автоматически из blob storage. Создание и редактирование тестов через интерфейс пока не поддерживается.
              </p>
            </div>
          </div>
        </div>

        {/* Тесты */}
        <div className="bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          {tests.length === 0 ? (
            <p className="text-gray-400">Нет тестов</p>
          ) : (
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="border border-gray-600 rounded-lg p-3 md:p-4 hover:bg-gray-700">
                  <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-start md:space-y-0">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base md:text-lg font-semibold text-white mb-2 break-words">
                        {test.title}
                      </h3>
                      <div className="text-xs md:text-sm text-gray-400 mb-2 flex flex-wrap gap-2">
                        <span>ID: {test.id}</span>
                        <span>Курс: {(test as any).course_title || 'Не найден'}</span>
                      </div>
                      <div className="text-xs md:text-sm text-gray-300">
                        {test.description && (
                          <p className="mb-2 break-words">{test.description}</p>
                        )}
                        <span className="hidden md:inline">
                          Создан: {new Date(test.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end md:ml-4">
                      <span className="text-xs md:text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
                        Только просмотр
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для создания/редактирования теста */}
      {(showTestForm || editingTest) && (
        <TestFormModal
          test={editingTest}
          courses={courses}
          onClose={() => {
            setShowTestForm(false);
            setEditingTest(null);
          }}
          onSave={() => {
            setShowTestForm(false);
            setEditingTest(null);
            fetchTests();
          }}
        />
      )}

      {/* Модальное окно для управления вопросами */}
      {managingQuestions && (
        <QuestionsModal
          test={managingQuestions}
          onClose={() => setManagingQuestions(null)}
        />
      )}
    </div>
  );
}

interface TestFormModalProps {
  test?: Test | null;
  courses: Course[];
  onClose: () => void;
  onSave: () => void;
}

function TestFormModal({ test, courses, onClose, onSave }: TestFormModalProps) {
  const [title, setTitle] = useState(test?.title || '');
  const [description, setDescription] = useState(test?.description || '');
  const [courseId, setCourseId] = useState(test?.course_id || (courses[0]?.id || 0));
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = test ? `/api/tests/${test.id}` : '/api/tests';
      const method = test ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          title,
          description,
        }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка сохранения теста:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {test ? 'Редактировать тест' : 'Создать тест'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Курс
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Название теста
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-blue-300 dark:disabled:bg-blue-600"
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface QuestionsModalProps {
  test: Test;
  onClose: () => void;
}

function QuestionsModal({ test, onClose }: QuestionsModalProps) {
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      const response = await fetch(`/api/test-questions?testId=${test.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions.map((q: { id: number; test_id: number; question: string; options: string; correct_answer: number; order_index: number }) => ({
          ...q,
          options: JSON.parse(q.options)
        })));
      }
    } catch (error) {
      console.error('Ошибка загрузки вопросов:', error);
    } finally {
      setLoading(false);
    }
  }, [test.id]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот вопрос?')) {
      return;
    }

    try {
      const response = await fetch(`/api/test-questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(questions.filter(q => q.id !== questionId));
      }
    } catch (error) {
      console.error('Ошибка удаления вопроса:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Вопросы теста: {test.title}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuestionForm(true)}
                className="bg-green-600 dark:bg-green-700 text-white px-3 py-1 rounded text-sm hover:bg-green-700 dark:hover:bg-green-800"
              >
                Добавить вопрос
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center">Загрузка вопросов...</div>
          ) : questions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Нет вопросов</p>
          ) : (
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question.id} className="border dark:border-gray-600 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {index + 1}. {question.question}
                      </h4>
                      <div className="space-y-1">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`text-sm p-2 rounded ${
                              optionIndex === question.correct_answer
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optionIndex)}) {option}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setEditingQuestion(question)}
                        className="bg-yellow-500 dark:bg-yellow-600 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600 dark:hover:bg-yellow-700"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question.id)}
                        className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded text-sm hover:bg-red-600 dark:hover:bg-red-700"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно для создания/редактирования вопроса */}
      {(showQuestionForm || editingQuestion) && (
        <QuestionFormModal
          question={editingQuestion}
          testId={test.id}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSave={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}

interface QuestionFormModalProps {
  question?: TestQuestion | null;
  testId: number;
  onClose: () => void;
  onSave: () => void;
}

function QuestionFormModal({ question, testId, onClose, onSave }: QuestionFormModalProps) {
  const [questionText, setQuestionText] = useState(question?.question || '');
  const [options, setOptions] = useState<string[]>(question?.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question?.correct_answer || 0);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = question ? `/api/test-questions/${question.id}` : '/api/test-questions';
      const method = question ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test_id: testId,
          question: questionText,
          options: options.filter(opt => opt.trim() !== ''),
          correct_answer: correctAnswer,
          order_index: question?.order_index || 0,
        }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка сохранения вопроса:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      if (correctAnswer >= newOptions.length) {
        setCorrectAnswer(newOptions.length - 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {question ? 'Редактировать вопрос' : 'Добавить вопрос'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Вопрос
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Варианты ответов
              </label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={correctAnswer === index}
                      onChange={() => setCorrectAnswer(index)}
                      className="text-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-6">
                      {String.fromCharCode(65 + index)})
                    </span>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Вариант ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Добавить вариант
                </button>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:bg-blue-300 dark:disabled:bg-blue-600"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-md hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}