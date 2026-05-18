-- Добавляем колонку имени собственника
ALTER TABLE properties ADD COLUMN IF NOT EXISTS owner_name TEXT DEFAULT 'Собственник';
