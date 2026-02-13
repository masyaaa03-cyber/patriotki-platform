-- =============================================
-- Схема БД для платформы "Патриотки всея Руси"
-- Запустить в Supabase SQL Editor
-- =============================================

-- Профили пользователей
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  telegram TEXT,
  vk TEXT,
  region TEXT NOT NULL,
  city TEXT NOT NULL,
  latitude FLOAT,
  longitude FLOAT,
  consent BOOLEAN DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_ip TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Мероприятия
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  city TEXT,
  region TEXT,
  location TEXT,
  max_participants INT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Регистрации на мероприятия
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT now(),
  attended BOOLEAN DEFAULT false,
  UNIQUE(user_id, event_id)
);

-- Шаблоны достижений
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🏆',
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Достижения пользователей
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  awarded_by UUID REFERENCES profiles(id),
  UNIQUE(user_id, achievement_id)
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Profiles: пользователь видит и редактирует только себя
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Profiles: админ видит всех
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Публичная карта: координаты доступны всем авторизованным
CREATE POLICY "Authenticated users can view map data"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Events: видны всем авторизованным
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

-- Events: создавать/править могут только админы
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Event registrations: пользователь видит свои
CREATE POLICY "Users can view own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage registrations"
  ON event_registrations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Achievements: видны всем
CREATE POLICY "Anyone can view achievements"
  ON achievements FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage achievements"
  ON achievements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- User achievements: пользователь видит свои
CREATE POLICY "Users can view own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user achievements"
  ON user_achievements FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- Функция для публичной карты (без авторизации)
-- =============================================
CREATE OR REPLACE FUNCTION get_map_points()
RETURNS TABLE (city TEXT, region TEXT, lat FLOAT, lng FLOAT, cnt BIGINT)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT city, region, latitude AS lat, longitude AS lng, COUNT(*) AS cnt
  FROM profiles
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND consent = true
  GROUP BY city, region, latitude, longitude;
$$;
