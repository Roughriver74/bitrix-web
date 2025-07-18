'use client';

import { useState, useEffect } from 'react';

interface SystemStatus {
  status: 'healthy' | 'error';
  message: string;
  postgres: boolean;
  environment: string;
  timestamp: string;
  missingVars: string[];
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      setStatus({
        status: 'error',
        message: 'Не удалось получить статус системы',
        postgres: false,
        environment: 'unknown',
        timestamp: new Date().toISOString(),
        missingVars: []
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-100 border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Проверка статуса системы...</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  const statusColor = status.status === 'healthy' ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300';
  const iconColor = status.status === 'healthy' ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`border rounded-lg p-4 mb-6 ${statusColor}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${iconColor}`}>
          {status.status === 'healthy' ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">
            Статус системы: {status.status === 'healthy' ? 'Готов к работе' : 'Требует настройки'}
          </h3>
          
          <p className="text-gray-700 mb-2">{status.message}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <strong>PostgreSQL:</strong> {status.postgres ? '✅ Подключен' : '❌ Не настроен'}
            </div>
            <div>
              <strong>Окружение:</strong> {status.environment}
            </div>
          </div>

          {status.missingVars && status.missingVars.length > 0 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-medium text-yellow-800 mb-2">Отсутствуют переменные окружения:</h4>
              <ul className="list-disc list-inside text-sm text-yellow-700">
                {status.missingVars.map((varName) => (
                  <li key={varName}><code>{varName}</code></li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-yellow-700">
                Добавьте эти переменные в настройки Vercel (Settings → Environment Variables)
              </p>
            </div>
          )}

          <div className="mt-3 text-xs text-gray-500">
            Последняя проверка: {new Date(status.timestamp).toLocaleString('ru-RU')}
          </div>
        </div>
      </div>
    </div>
  );
}