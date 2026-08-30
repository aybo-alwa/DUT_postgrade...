-- PROFILES
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Scholar',
  programme TEXT NOT NULL DEFAULT 'Postgraduate researcher',
  warnings INT NOT NULL DEFAULT 0,
  offenses INT NOT NULL DEFAULT 0,
  suspended_until TIMESTAMPTZ,
  accent TEXT NOT NULL DEFAULT 'coral',
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  high_contrast BOOLEAN NOT NULL DEFAULT false,
  text_scale INT NOT NULL DEFAULT 100,
  captions BOOLEAN NOT NULL DEFAULT true,
  keyboard_nav BOOLEAN NOT NULL DEFAULT true,
  screen_reader BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MILESTONES (reference)
CREATE TABLE public.milestones (
  key TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  position INT NOT NULL,
  requires_challenge BOOLEAN NOT NULL DEFAULT false,
  challenge_prompt TEXT,
  unlock_rule TEXT
);
GRANT SELECT ON public.milestones TO authenticated;
GRANT ALL ON public.milestones TO service_role;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_read" ON public.milestones FOR SELECT TO authenticated USING (true);

INSERT INTO public.milestones (key, title, subtitle, position, requires_challenge, challenge_prompt, unlock_rule) VALUES
('orientation', 'Orientation', 'Know your starting point', 1, false, NULL, NULL),
('literature', 'Literature review', 'Find the conversation', 2, false, NULL, NULL),
('challenge', 'Practical challenge', 'Try before you unlock', 3, true, 'Write one clear research question in a single sentence. No perfect wording needed.', 'Save a rough version, then compare it with the guide that unlocks next.'),
('methodology', 'Methodology', 'Unlock after your try', 4, false, NULL, 'Unlocks when you submit one draft research question.');

-- USER MILESTONES
CREATE TABLE public.user_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  milestone_key TEXT NOT NULL REFERENCES public.milestones(key) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_key)
);
GRANT SELECT, INSERT, DELETE ON public.user_milestones TO authenticated;
GRANT ALL ON public.user_milestones TO service_role;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_milestones_own" ON public.user_milestones FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CHALLENGE SUBMISSIONS
CREATE TABLE public.challenge_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  milestone_key TEXT NOT NULL DEFAULT 'challenge',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.challenge_submissions TO authenticated;
GRANT ALL ON public.challenge_submissions TO service_role;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "challenge_own" ON public.challenge_submissions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MODULES (reference)
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  stage TEXT NOT NULL,
  summary TEXT NOT NULL,
  duration TEXT NOT NULL,
  locked BOOLEAN NOT NULL DEFAULT false,
  unlock_rule TEXT,
  position INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_read" ON public.modules FOR SELECT TO authenticated USING (true);

INSERT INTO public.modules (slug, title, stage, summary, duration, locked, unlock_rule, position) VALUES
('find-direction', 'Find your research direction', 'Orientation', 'Turn a broad interest into a workable, bounded topic.', '20 min', false, NULL, 1),
('useful-lit-review', 'Build a useful literature review', 'Literature review', 'Map the conversation and find the gap you can speak into.', '35 min', false, NULL, 2),
('try-your-question', 'Try your research question', 'Practical challenge', 'Draft one question, get feedback, then refine it.', '15 min', false, NULL, 3),
('methodology-module', 'Methodology module', 'Methodology', 'Choose a method that fits your question, context and capacity.', '40 min', true, 'Unlocks when you submit one draft research question.', 4),
('ethics-clearance', 'Ethics and clearance, simplified', 'Methodology', 'Prepare a clean ethics application the first time.', '25 min', true, 'Unlocks after the methodology module.', 5);

-- RESOURCES (reference)
CREATE TABLE public.resources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  meta TEXT NOT NULL,
  reason TEXT,
  category TEXT NOT NULL DEFAULT 'recommended',
  position INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resources_read" ON public.resources FOR SELECT TO authenticated USING (true);

INSERT INTO public.resources (title, kind, meta, reason, category, position) VALUES
('Mixed methods in education research', 'Article', '12 min read', 'Recommended because you selected education', 'recommended', 1),
('Sampling techniques, explained', 'Video', '8 min', 'Captioned and transcript available', 'recommended', 2),
('Data analysis with confidence', 'Guide', '15 min read', 'Includes worked example', 'recommended', 3),
('Turn a topic into a research outline', 'Interactive tool', '10 min', 'Save as you go', 'recommended', 4),
('Designing a strong methodology', 'Video', '7 min', 'Step-by-step guidance to choose a method that fits your question, context and capacity.', 'video', 1),
('Reading a paper critically in 20 minutes', 'Video', '9 min', 'A repeatable routine for dense articles.', 'video', 2),
('Writing an abstract that lands', 'Video', '6 min', 'Structure, verbs, and what to cut.', 'video', 3);

-- COMMUNITY
CREATE TABLE public.community_spaces (
  key TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.community_spaces TO authenticated;
GRANT ALL ON public.community_spaces TO service_role;
ALTER TABLE public.community_spaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "spaces_read" ON public.community_spaces FOR SELECT TO authenticated USING (true);

INSERT INTO public.community_spaces (key, title, description, position) VALUES
('methodology-clinic', 'Methodology clinic', 'Talk through methods, questions, and trade-offs', 1),
('accessible-practice', 'Accessible research practice', 'Share tools, adaptations, and wins', 2),
('peer-mentors', 'Peer mentor matching', 'Find guidance from someone a step ahead', 3),
('study-groups', 'Study groups', 'Find your people', 4);

CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  space_key TEXT NOT NULL REFERENCES public.community_spaces(key) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Scholar',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read_all" ON public.community_posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON public.community_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_delete_own" ON public.community_posts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- AI FEEDBACK HISTORY
CREATE TABLE public.ai_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  focus TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.ai_feedback TO authenticated;
GRANT ALL ON public.ai_feedback TO service_role;
ALTER TABLE public.ai_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_feedback_own" ON public.ai_feedback FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- MODERATION EVENTS
CREATE TABLE public.moderation_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  surface TEXT NOT NULL,
  snippet TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.moderation_events TO authenticated;
GRANT ALL ON public.moderation_events TO service_role;
ALTER TABLE public.moderation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moderation_read_own" ON public.moderation_events FOR SELECT TO authenticated USING (user_id = auth.uid());