// Проверка доступности PostgreSQL и fallback для локальной разработки

export function checkPostgresConnection(): boolean {
  const requiredVars = [
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL', 
    'POSTGRES_URL_NON_POOLING'
  ];
  
  // Проверяем, есть ли хотя бы одна переменная для подключения к PostgreSQL
  const hasConnection = requiredVars.some(varName => {
    const value = process.env[varName];
    return value && value.length > 0;
  });
  
  return hasConnection;
}

export function getConnectionStatus(): {
  hasPostgres: boolean;
  message: string;
  requiredVars: string[];
} {
  const hasPostgres = checkPostgresConnection();
  
  const requiredVars = [
    'POSTGRES_URL',
    'POSTGRES_PRISMA_URL', 
    'POSTGRES_URL_NON_POOLING',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.length === 0;
  });
  
  let message = '';
  if (!hasPostgres) {
    message = `Отсутствуют переменные окружения для PostgreSQL: ${missingVars.join(', ')}`;
  } else if (missingVars.length > 0) {
    message = `Отсутствуют переменные окружения: ${missingVars.join(', ')}`;
  } else {
    message = 'Все переменные окружения настроены корректно';
  }
  
  return {
    hasPostgres,
    message,
    requiredVars
  };
}