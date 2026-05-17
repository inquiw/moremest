-- ============================================
-- moremest: таблица properties
-- Вставь этот скрипт в Supabase → SQL Editor → Run
-- ============================================

-- 1. Создаём таблицу
CREATE TABLE IF NOT EXISTS properties (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  type        TEXT,
  city        TEXT,
  address     TEXT,
  rooms       INTEGER DEFAULT 1,
  amenities   JSONB DEFAULT '[]'::jsonb,
  price       INTEGER DEFAULT 0,
  owner_phone TEXT,
  legal_status TEXT,
  is_published BOOLEAN DEFAULT true,
  rating      NUMERIC(2,1) DEFAULT 0,
  reviews     INTEGER DEFAULT 0,
  img         TEXT DEFAULT '/img/placeholder.jpg',
  images      JSONB DEFAULT '[]'::jsonb,
  coords      NUMERIC[] DEFAULT NULL,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- 2. Включаем RLS (Row Level Security)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- 3. Кто может читать: все видят опубликованные объекты
CREATE POLICY "Public read published"
  ON properties FOR SELECT
  USING (is_published = true);

-- 4. Кто может читать свои объекты (для профиля)
CREATE POLICY "Owners read own"
  ON properties FOR SELECT
  USING (user_id = auth.uid());

-- 5. Кто может вставлять: авторизованный пользователь, user_id = свой
CREATE POLICY "Owners insert own"
  ON properties FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 6. Кто может обновлять: только владелец объекта
CREATE POLICY "Owners update own"
  ON properties FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 7. Кто может удалять: только владелец объекта
CREATE POLICY "Owners delete own"
  ON properties FOR DELETE
  USING (user_id = auth.uid());

-- 8. Индекс для быстрого поиска по городу
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);

-- 9. Индекс для быстрого поиска по user_id
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties (user_id);

-- 10. Storage bucket для фото объектов
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true)
  ON CONFLICT (id) DO NOTHING;

-- 11. Разрешаем авторизованным пользователям загружать фото
CREATE POLICY "Users upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- 12. Разрешаем владельцу удалять свои фото
CREATE POLICY "Users delete own images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.role() = 'authenticated');

-- 13. Публичный доступ к фото (чтение)
CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');
