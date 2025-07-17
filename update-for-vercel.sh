#!/bin/bash

# Скрипт для обновления кода для работы с Vercel Postgres

echo "Обновляем проект для работы с Vercel..."

# Заменяем импорты в API файлах
find src/app/api -name "*.ts" -type f | while read file; do
  if grep -q "import db from '@/lib/database'" "$file"; then
    echo "Обновляем $file"
    sed -i '' 's/import db from.*database.*/import { sql } from "@vercel\/postgres";/' "$file"
  fi
done

echo "Обновление завершено!"