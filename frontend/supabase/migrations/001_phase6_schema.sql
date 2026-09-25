-- 1. Profiles (Application-owned user data)
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name            text NOT NULL,
  role            text NOT NULL DEFAULT 'Under Secretary',
  department      text NOT NULL,
  cadre           text NOT NULL DEFAULT 'Central Secretariat Service (CSS)',
  avatar_initials text NOT NULL DEFAULT 'U',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- 2. Competencies (Live scores for the learner)
CREATE TABLE competencies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comp_key   text NOT NULL,
  name       text NOT NULL,
  score      integer NOT NULL DEFAULT 0,
  target     integer NOT NULL DEFAULT 80,
  category   text NOT NULL DEFAULT 'Behavioural',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, comp_key)
);

-- 3. Enrollments (Course progress and enrollment state)
CREATE TABLE enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id   text NOT NULL,
  is_enrolled boolean NOT NULL DEFAULT true,
  progress    integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

-- 4. Assessment Results
CREATE TABLE assessment_results (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score_percentage      integer NOT NULL,
  correct_answers       integer NOT NULL,
  total_questions       integer NOT NULL,
  competencies_assessed jsonb NOT NULL DEFAULT '[]',
  incorrect_questions   jsonb NOT NULL DEFAULT '[]',
  recommended_action    text,
  recommended_course_id text,
  diagnostic_insights   jsonb,
  taken_at              timestamptz NOT NULL DEFAULT now()
);

-- 5. Reassessment Snapshots
CREATE TABLE reassessment_snapshots (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  snapshot   jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS Policies Setup

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own competencies" ON competencies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own enrollments" ON enrollments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assessment results" ON assessment_results FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE reassessment_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reassessments" ON reassessment_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
