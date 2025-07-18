// Проверка доступности Vercel Blob

export function checkBlobConnection(): boolean {
  const requiredVars = [
    'BLOB_READ_WRITE_TOKEN'
  ];
  
  // Проверяем, есть ли переменная для подключения к Blob
  const hasConnection = requiredVars.some(varName => {
    const value = process.env[varName];
    return value && value.length > 0;
  });
  
  return hasConnection;
}

export function getConnectionStatus(): {
  hasBlob: boolean;
  message: string;
  requiredVars: string[];
} {
  const hasBlob = checkBlobConnection();
  
  const requiredVars = [
    'BLOB_READ_WRITE_TOKEN',
    'JWT_SECRET'
  ];
  
  const missingVars = requiredVars.filter(varName => {
    const value = process.env[varName];
    return !value || value.length === 0;
  });
  
  let message = '';
  if (!hasBlob) {
    message = `Отсутствуют переменные окружения для Vercel Blob: ${missingVars.join(', ')}`;
  } else if (missingVars.length > 0) {
    message = `Отсутствуют переменные окружения: ${missingVars.join(', ')}`;
  } else {
    message = 'Все переменные окружения настроены корректно';
  }
  
  return {
    hasBlob,
    message,
    requiredVars
  };
}