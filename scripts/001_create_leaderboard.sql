-- Create leaderboard table for storing player scores
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  player_id TEXT NOT NULL,
  level_id INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_level ON public.leaderboard(level_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_player ON public.leaderboard(player_id);

-- Enable RLS
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read leaderboard (public leaderboard)
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard
  FOR SELECT USING (true);

-- Allow anyone to insert their scores (anonymous players)
CREATE POLICY "Anyone can submit scores" ON public.leaderboard
  FOR INSERT WITH CHECK (true);

-- Players can only update their own scores
CREATE POLICY "Players can update own scores" ON public.leaderboard
  FOR UPDATE USING (player_id = player_id);
