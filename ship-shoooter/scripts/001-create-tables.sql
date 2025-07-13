-- Create users table for authentication and profile data
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_progress table for game progress
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  lives INTEGER DEFAULT 3,
  currency INTEGER DEFAULT 100,
  current_ship VARCHAR(50) DEFAULT 'basic_fighter',
  unlocked_ships TEXT[] DEFAULT ARRAY['basic_fighter'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create friendships table for friend system
CREATE TABLE IF NOT EXISTS friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Create game_sessions table for active games
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  server_name VARCHAR(100) NOT NULL,
  max_players INTEGER DEFAULT 20,
  current_players INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active', -- active, full, ended
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- User progress policies
CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Friendship policies
CREATE POLICY "Users can view own friendships" ON friendships FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_id);
CREATE POLICY "Users can create friendships" ON friendships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own friendships" ON friendships FOR UPDATE USING (auth.uid() = user_id);
