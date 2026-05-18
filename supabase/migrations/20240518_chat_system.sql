-- ═══════════════════════════════════════════════════════════════
-- Moremest: Система личных сообщений (чаты + сообщения)
-- ═══════════════════════════════════════════════════════════════

-- ─── Таблица чатов ───
CREATE TABLE IF NOT EXISTS chats (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  host_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(property_id, host_id, guest_id)   -- один чат на пару «хозяин—гость» в рамках объекта
);

-- ─── Таблица сообщений ───
CREATE TABLE IF NOT EXISTS messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id     UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Индексы ───
CREATE INDEX IF NOT EXISTS idx_chats_host   ON chats(host_id);
CREATE INDEX IF NOT EXISTS idx_chats_guest  ON chats(guest_id);
CREATE INDEX IF NOT EXISTS idx_chats_prop   ON chats(property_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(chat_id, is_read) WHERE is_read = FALSE;

-- ─── Realtime: включаем публикацию для таблицы messages ───
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;

-- ─── RLS: чаты ───
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

-- Пользователь видит только свои чаты (он host или guest)
CREATE POLICY "chats_select_own"
  ON chats FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- Хозяин или гость могут создать чат
CREATE POLICY "chats_insert_own"
  ON chats FOR INSERT
  WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

-- Только участники чата могут обновлять (например, архивировать)
CREATE POLICY "chats_update_own"
  ON chats FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

-- ─── RLS: сообщения ───
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Пользователь видит сообщения только из своих чатов
CREATE POLICY "messages_select_own"
  ON messages FOR SELECT
  USING (
    chat_id IN (
      SELECT id FROM chats
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Отправлять может только участник чата
CREATE POLICY "messages_insert_own"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND chat_id IN (
      SELECT id FROM chats
      WHERE host_id = auth.uid() OR guest_id = auth.uid()
    )
  );

-- Обновлять может только отправитель (пометить прочитанным и т.п.)
CREATE POLICY "messages_update_own"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- ─── Хелпер: получить последнее сообщение в чате ───
-- (опционально, ускоряет список чатов на фронте)
CREATE OR REPLACE VIEW chat_last_message AS
SELECT
  c.id AS chat_id,
  c.property_id,
  c.host_id,
  c.guest_id,
  c.created_at AS chat_created,
  m.content AS last_content,
  m.sender_id AS last_sender,
  m.created_at AS last_at,
  (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND is_read = FALSE AND sender_id != auth.uid()) AS unread_count
FROM chats c
LEFT JOIN LATERAL (
  SELECT content, sender_id, created_at
  FROM messages
  WHERE chat_id = c.id
  ORDER BY created_at DESC
  LIMIT 1
) m ON true
WHERE c.host_id = auth.uid() OR c.guest_id = auth.uid();
