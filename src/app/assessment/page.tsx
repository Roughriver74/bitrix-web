import Link from "next/link";

const assessments = [
  {
    id: 1,
    title: "Тест: Основы интерфейса",
    description: "Проверка знаний основных элементов интерфейса Битрикс24",
    module: "Введение в Битрикс24",
    questions: 10,
    duration: "15 минут",
    difficulty: "Базовый",
    minScore: 70,
    completed: false,
    score: null
  },
  {
    id: 2,
    title: "Тест: CRM функционал",
    description: "Оценка знаний работы с CRM системой",
    module: "CRM и управление клиентами",
    questions: 15,
    duration: "20 минут",
    difficulty: "Средний",
    minScore: 75,
    completed: false,
    score: null
  },
  {
    id: 3,
    title: "Тест: Управление задачами",
    description: "Проверка навыков постановки и контроля задач",
    module: "Задачи и проекты",
    questions: 12,
    duration: "18 минут",
    difficulty: "Средний",
    minScore: 75,
    completed: false,
    score: null
  },
  {
    id: 4,
    title: "Тест: Коммуникации",
    description: "Оценка знаний инструментов коммуникации",
    module: "Коммуникации",
    questions: 8,
    duration: "12 минут",
    difficulty: "Базовый",
    minScore: 70,
    completed: false,
    score: null
  },
  {
    id: 5,
    title: "Тест: Документооборот",
    description: "Проверка знаний работы с документами",
    module: "Документооборот",
    questions: 14,
    duration: "22 минут",
    difficulty: "Продвинутый",
    minScore: 80,
    completed: false,
    score: null
  },
  {
    id: 6,
    title: "Тест: Отчеты и аналитика",
    description: "Оценка навыков создания отчетов",
    module: "Отчеты и аналитика",
    questions: 16,
    duration: "25 минут",
    difficulty: "Продвинутый",
    minScore: 80,
    completed: false,
    score: null
  },
  {
    id: 7,
    title: "Итоговый тест",
    description: "Комплексная проверка всех знаний по курсу",
    module: "Итоговое тестирование",
    questions: 25,
    duration: "40 минут",
    difficulty: "Продвинутый",
    minScore: 85,
    completed: false,
    score: null
  }
];

export default function AssessmentPage() {
  const completedTests = assessments.filter(test => test.completed);
  const averageScore = completedTests.length > 0 
    ? Math.round(completedTests.reduce((sum, test) => sum + (test.score || 0), 0) / completedTests.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-4"
          >
            ← Назад к главной
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Оценка знаний
          </h1>
          <p className="text-xl text-gray-300">
            Проверьте свои знания с помощью тестов
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Пройдено тестов
                </h3>
                <p className="text-2xl font-bold text-blue-500">
                  {completedTests.length} из {assessments.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Средний балл
                </h3>
                <p className="text-2xl font-bold text-green-500">
                  {averageScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Прогресс
                </h3>
                <p className="text-2xl font-bold text-purple-500">
                  {Math.round((completedTests.length / assessments.length) * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {assessments.map((test) => (
            <div key={test.id} className="bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-2xl font-bold text-white">
                      {test.id}
                    </span>
                    <div className="flex space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        test.difficulty === 'Базовый' ? 'bg-green-100 text-green-800' :
                        test.difficulty === 'Средний' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {test.difficulty}
                      </span>
                      {test.completed && (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          (test.score || 0) >= test.minScore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {test.score}% {(test.score || 0) >= test.minScore ? 'Зачёт' : 'Не зачёт'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-semibold text-white mb-2">
                    {test.title}
                  </h2>
                  
                  <p className="text-gray-300 mb-4">
                    {test.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400 mb-4">
                    <div>
                      <span className="block font-medium">Модуль:</span>
                      <span>{test.module}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Вопросов:</span>
                      <span>{test.questions}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Время:</span>
                      <span>{test.duration}</span>
                    </div>
                    <div>
                      <span className="block font-medium">Минимум:</span>
                      <span>{test.minScore}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col items-end space-y-2">
                  {test.completed ? (
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-12 h-12 border-2 border-gray-300 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex flex-col space-y-2">
                    <Link 
                      href={`/assessment/${test.id}`}
                      className="bg-blue-500 text-white px-4 py-2 rounded text-center hover:bg-blue-600 transition-colors"
                    >
                      {test.completed ? 'Пересдать' : 'Пройти тест'}
                    </Link>
                    
                    {test.completed && (
                      <Link 
                        href={`/assessment/${test.id}/results`}
                        className="border border-blue-400 text-blue-400 px-4 py-2 rounded text-center hover:bg-gray-700 transition-colors"
                      >
                        Результаты
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Правила тестирования
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                📋 Общие правила
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Каждый тест можно пересдавать неограниченное количество раз</li>
                <li>• Время на прохождение теста ограничено</li>
                <li>• Результаты сохраняются автоматически</li>
                <li>• Для получения зачёта нужно набрать минимальный балл</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                🎯 Рекомендации
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Изучите соответствующий модуль перед тестированием</li>
                <li>• Выполните практические задания</li>
                <li>• Внимательно читайте вопросы</li>
                <li>• Не торопитесь, но следите за временем</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}