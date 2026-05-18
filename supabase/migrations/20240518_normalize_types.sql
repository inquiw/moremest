-- Нормализация типов объектов: приводим все к русским лейблам анкет
-- Валидные: 'Квартира / Дом', 'Мини-гостиница', 'Гостиница', 'Крупный отель'

-- Английские ключи → русские лейблы
UPDATE properties SET type = 'Квартира / Дом' WHERE type IN ('apartment', 'Квартира');
UPDATE properties SET type = 'Мини-гостиница' WHERE type IN ('guesthouse', 'mini_hotel', 'Гостевой дом', 'Мини гостиница', 'Мини-гостиница', 'room');
UPDATE properties SET type = 'Гостиница' WHERE type IN ('hotel', 'Гостиница');
UPDATE properties SET type = 'Крупный отель' WHERE type IN ('large_hotel', 'Отель', 'Крупный отель');

-- Удалить возможные дубликаты лейблов
UPDATE properties SET type = 'Квартира / Дом' WHERE type = 'Квартира / Дом' OR type = 'Дом / Вилла' OR type = 'Дом';
