'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Course, Lesson } from '@/types';
import Link from 'next/link';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import ThemeToggle from '@/components/ThemeToggle';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function CourseLessonsPage({ params }: PageProps) {
  const { user, loading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [courseId, setCourseId] = useState<number | null>(null);

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      const id = parseInt(resolvedParams.id);
      setCourseId(id);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (courseId !== null) {
      fetchCourse();
      fetchLessons();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course);
      }
    } catch (error) {
      console.error('Ошибка загрузки курса:', error);
    }
  };

  const fetchLessons = async () => {
    try {
      const response = await fetch(`/api/lessons?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
    } finally {
      setLessonsLoading(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот урок?')) {
      return;
    }

    try {
      const response = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLessons(lessons.filter(lesson => lesson.id !== lessonId));
      }
    } catch (error) {
      console.error('Ошибка удаления урока:', error);
    }
  };

  if (loading || lessonsLoading || courseId === null) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-white">Загрузка...</div>
      </div>
    );
  }

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-red-600 dark:text-red-400">Доступ запрещен</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Уроки курса: {course?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Управление уроками</p>
            </div>
            <div className="flex space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setShowLessonForm(true)}
                className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-800"
              >
                Добавить урок
              </button>
              <Link 
                href="/admin" 
                className="bg-gray-500 dark:bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700"
              >
                Назад
              </Link>
            </div>
          </div>
        </div>

        {/* Уроки */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6">
          {lessons.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">Нет уроков</p>
          ) : (
            <div className="space-y-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="border dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {lesson.title}
                      </h3>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        ID: {lesson.id} | Порядок: {lesson.order_index} | Создан: {new Date(lesson.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        Символов: {lesson.content.length}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setPreviewLesson(lesson)}
                        className="bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Просмотр
                      </button>
                      <button
                        onClick={() => setEditingLesson(lesson)}
                        className="bg-yellow-500 dark:bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 dark:hover:bg-yellow-700"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-600 dark:hover:bg-red-700"
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

      {/* Модальное окно для добавления/редактирования урока */}
      {(showLessonForm || editingLesson) && (
        <LessonFormModal
          lesson={editingLesson}
          courseId={courseId}
          onClose={() => {
            setShowLessonForm(false);
            setEditingLesson(null);
          }}
          onSave={() => {
            setShowLessonForm(false);
            setEditingLesson(null);
            fetchLessons();
          }}
        />
      )}

      {/* Модальное окно для просмотра урока */}
      {previewLesson && (
        <LessonPreviewModal
          lesson={previewLesson}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </div>
  );
}

interface LessonFormModalProps {
  lesson?: Lesson | null;
  courseId: number;
  onClose: () => void;
  onSave: () => void;
}

function LessonFormModal({ lesson, courseId, onClose, onSave }: LessonFormModalProps) {
  const [title, setTitle] = useState(lesson?.title || '');
  const [content, setContent] = useState(lesson?.content || '');
  const [orderIndex, setOrderIndex] = useState(lesson?.order_index || 0);
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  // const [selectedText, setSelectedText] = useState({ start: 0, end: 0 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = lesson ? `/api/lessons/${lesson.id}` : '/api/lessons';
      const method = lesson ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: courseId,
          title,
          content,
          order_index: orderIndex,
        }),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Ошибка сохранения урока:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const imageUrl = data.url;
        const imageMarkdown = `![${file.name}](${imageUrl})`;
        
        // Вставляем изображение в текущую позицию курсора
        const textarea = document.getElementById('lesson-content') as HTMLTextAreaElement;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newContent = content.slice(0, start) + imageMarkdown + content.slice(end);
          setContent(newContent);
          
          // Устанавливаем курсор после вставленного изображения
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length);
          }, 0);
        }
      } else {
        alert('Ошибка загрузки изображения');
      }
    } catch (error) {
      console.error('Ошибка загрузки изображения:', error);
      alert('Ошибка загрузки изображения');
    } finally {
      setUploadingImage(false);
    }
  };

  const insertMarkdown = (markdown: string) => {
    const textarea = document.getElementById('lesson-content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent = content.slice(0, start) + markdown + content.slice(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + markdown.length, start + markdown.length);
      }, 0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              {lesson ? 'Редактировать урок' : 'Добавить урок'}
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="bg-gray-500 dark:bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 dark:hover:bg-gray-700"
              >
                {previewMode ? 'Редактор' : 'Превью'}
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
          {previewMode ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">{title}</h2>
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Порядок
                </label>
                <input
                  type="number"
                  value={orderIndex}
                  onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Содержание (Markdown)
                </label>
                
                {/* Панель инструментов для редактора */}
                <div className="border border-gray-600 rounded-t-md bg-gray-700 p-2 flex flex-wrap gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => insertMarkdown('**жирный текст**')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Жирный текст"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('*курсив*')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Курсив"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('# ')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Заголовок 1"
                  >
                    H1
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('## ')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Заголовок 2"
                  >
                    H2
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('### ')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Заголовок 3"
                  >
                    H3
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Список"
                  >
                    • List
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('> ')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Цитата"
                  >
                    Quote
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('```\n\n```')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Блок кода"
                  >
                    Code
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown('[текст ссылки](url)')}
                    className="px-2 py-1 bg-gray-600 rounded text-sm hover:bg-gray-500 text-white"
                    title="Ссылка"
                  >
                    Link
                  </button>
                  
                  <div className="border-l border-gray-600 pl-2 ml-2">
                    <label className="px-2 py-1 bg-blue-600 rounded text-sm hover:bg-blue-500 cursor-pointer text-white">
                      {uploadingImage ? 'Загрузка...' : '📷 Изображение'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>
                
                <textarea
                  id="lesson-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={15}
                  className="w-full px-3 py-2 border border-gray-600 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm resize-none bg-gray-700 text-white"
                  placeholder="# Заголовок урока

## Подзаголовок

Здесь идет основное содержание урока...

### Важные моменты:
- Пункт 1
- Пункт 2

```javascript
// Пример кода
console.log('Hello, World!');
```

> Это важная информация в блоке цитаты

![Описание изображения](https://example.com/image.jpg)
"
                />
              </div>
            </form>
          )}
        </div>

        {!previewMode && (
          <div className="p-6 border-t">
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface LessonPreviewModalProps {
  lesson: Lesson;
  onClose: () => void;
}

function LessonPreviewModal({ lesson, onClose }: LessonPreviewModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">Просмотр урока</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <h2 className="text-2xl font-bold text-white mb-4">{lesson.title}</h2>
          <MarkdownRenderer content={lesson.content} />
        </div>
      </div>
    </div>
  );
}