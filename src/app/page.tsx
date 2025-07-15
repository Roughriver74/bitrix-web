'use client';

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import AuthForm from "@/components/AuthForm";
import { useState } from "react";

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-xl text-white">Загрузка...</div>
      </div>
    );
  }

  if (!user && !showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Курс по обучению основам Битрикс24
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
              Комплексный курс для персонала по изучению основ системы Битрикс24
            </p>
            <div className="space-x-4">
              <button
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Войти в систему
              </button>
            </div>
          </header>
        </div>
      </div>
    );
  }

  if (!user && showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => setShowAuth(false)}
            className="mb-4 text-blue-400 hover:text-blue-300"
          >
            ← Назад
          </button>
          <AuthForm onSuccess={() => setShowAuth(false)} />
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <div className="text-lg font-semibold text-white">
            Добро пожаловать, {user?.name}!
          </div>
          <div className="flex items-center space-x-4">
            {user?.is_admin && (
              <Link
                href="/admin"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Админ панель
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Выйти
            </button>
          </div>
        </nav>
        
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Курс по обучению основам Битрикс24
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Комплексный курс для персонала по изучению основ системы Битрикс24
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-blue-500 text-4xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Модули курса
            </h2>
            <p className="text-gray-300 mb-4">
              Структурированные уроки по всем аспектам Битрикс24
            </p>
            <Link 
              href="/modules" 
              className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Начать обучение
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-green-500 text-4xl mb-4">🎯</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Практические задания
            </h2>
            <p className="text-gray-300 mb-4">
              Упражнения для закрепления полученных знаний
            </p>
            <Link 
              href="/exercises" 
              className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
            >
              Выполнить задания
            </Link>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-purple-500 text-4xl mb-4">📋</div>
            <h2 className="text-2xl font-semibold text-white mb-3">
              Оценка знаний
            </h2>
            <p className="text-gray-300 mb-4">
              Тестирование и проверка усвоенного материала
            </p>
            <Link 
              href="/assessment" 
              className="inline-block bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition-colors"
            >
              Пройти тест
            </Link>
          </div>
        </div>

        <section className="bg-gray-800 rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Что вы изучите
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-white">Основы CRM</h3>
                  <p className="text-gray-300">Работа с клиентами, лидами и сделками</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-white">Управление задачами</h3>
                  <p className="text-gray-300">Планирование и контроль рабочих процессов</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-white">Коммуникации</h3>
                  <p className="text-gray-300">Чаты, звонки и видеоконференции</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-white">Документооборот</h3>
                  <p className="text-gray-300">Работа с документами и файлами</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">5</div>
                <div>
                  <h3 className="font-semibold text-white">Отчеты и аналитика</h3>
                  <p className="text-gray-300">Анализ данных и построение отчетов</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">6</div>
                <div>
                  <h3 className="font-semibold text-white">Настройка системы</h3>
                  <p className="text-gray-300">Конфигурация и администрирование</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Готовы начать обучение?
          </h2>
          <p className="text-gray-300 mb-6">
            Пройдите курс в удобном для вас темпе
          </p>
          <Link 
            href="/modules" 
            className="inline-block bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors"
          >
            Начать курс
          </Link>
        </div>
      </div>
    </div>
  );
}
