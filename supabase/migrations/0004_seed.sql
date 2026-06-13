-- ============================================================================
-- Clinical Therapy Companion — 0004 Seed Data
-- Run order: 4 of 4  (after 0003_rls.sql)
--
-- Idempotent: re-running is safe; rows skipped if title/text already present.
-- User accounts are NOT seeded — sign up via the app for those.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- AFFIRMATIONS
-- ----------------------------------------------------------------------------
INSERT INTO affirmations (text, audience, accent)
SELECT v.text, v.audience, v.accent
FROM (VALUES
  ('I am brave even when I feel scared.',           'child',   '#FFD93D'),
  ('My feelings matter and so do I.',               'child',   '#9333EA'),
  ('It is okay to ask for help when I need it.',    'child',   '#0891B2'),
  ('My feelings are valid, even the messy ones.',   'teen',    '#0891B2'),
  ('I am still learning and that is enough.',       'teen',    '#15803D'),
  ('I am worthy of love and connection.',           'couples', '#D4536B'),
  ('We are a team, even on the hard days.',         'couples', '#D4536B'),
  ('I am doing my best as a parent.',               'family',  '#15803D'),
  ('Repair matters more than perfection.',          'family',  '#15803D'),
  ('Today, I choose calm.',                         'all',     '#1A2332'),
  ('Small steps still count.',                      'all',     '#1A2332')
) AS v(text, audience, accent)
WHERE NOT EXISTS (
  SELECT 1 FROM affirmations a WHERE a.text = v.text
);

-- ----------------------------------------------------------------------------
-- COPING TOOLS
-- ----------------------------------------------------------------------------
INSERT INTO coping_tools (title, category, description, steps, audience, accent)
SELECT v.title, v.category, v.description, v.steps::jsonb, v.audience, v.accent
FROM (VALUES
  (
    'Box Breathing',
    'breathing',
    'A simple 4-4-4-4 breathing technique to calm the nervous system.',
    '[
      {"step": 1, "text": "Breathe in slowly for 4 seconds."},
      {"step": 2, "text": "Hold the breath for 4 seconds."},
      {"step": 3, "text": "Breathe out slowly for 4 seconds."},
      {"step": 4, "text": "Hold empty for 4 seconds."},
      {"step": 5, "text": "Repeat 4 times."}
    ]',
    'all',
    '#0891B2'
  ),
  (
    '5-4-3-2-1 Grounding',
    'grounding',
    'Use your senses to come back to the present moment.',
    '[
      {"step": 1, "text": "Name 5 things you can see."},
      {"step": 2, "text": "Name 4 things you can touch."},
      {"step": 3, "text": "Name 3 things you can hear."},
      {"step": 4, "text": "Name 2 things you can smell."},
      {"step": 5, "text": "Name 1 thing you can taste."}
    ]',
    'all',
    '#15803D'
  ),
  (
    'Safe Place Visualization',
    'visualization',
    'Picture a place where you feel completely safe and calm.',
    '[
      {"step": 1, "text": "Close your eyes."},
      {"step": 2, "text": "Imagine a place where you feel safe — real or imaginary."},
      {"step": 3, "text": "Notice the colors, sounds, smells, temperature."},
      {"step": 4, "text": "Stay there as long as you need."}
    ]',
    'teen',
    '#9333EA'
  ),
  (
    'Soft Start-Up',
    'communication',
    'Open a hard conversation gently using the I-statement formula.',
    '[
      {"step": 1, "text": "Say what you feel: ''I feel ___''."},
      {"step": 2, "text": "Say what about: ''about ___''."},
      {"step": 3, "text": "Make a positive request: ''I need ___''."},
      {"step": 4, "text": "Avoid blame, criticism, and contempt."}
    ]',
    'couples',
    '#D4536B'
  )
) AS v(title, category, description, steps, audience, accent)
WHERE NOT EXISTS (
  SELECT 1 FROM coping_tools c WHERE c.title = v.title
);

-- ----------------------------------------------------------------------------
-- RESOURCES
-- ----------------------------------------------------------------------------
INSERT INTO resources (title, type, url, description, audience)
SELECT v.title, v.type, v.url, v.description, v.audience
FROM (VALUES
  ('Understanding Big Feelings',  'article', 'https://example.com/big-feelings',  'A gentle primer on emotional regulation for children.',     'child'),
  ('Teen Stress 101',             'article', 'https://example.com/teen-stress',   'Common stressors during adolescence and how to cope.',      'teen'),
  ('The Gottman Method Overview', 'article', 'https://example.com/gottman',       'Introduction to the science of healthy relationships.',     'couples'),
  ('Parenting Through Anxiety',   'article', 'https://example.com/anxiety-parent','Strategies for parents supporting anxious children.',       'family'),
  ('What is Therapy?',            'article', 'https://example.com/what-therapy',  'A simple overview of how therapy works and what to expect.','all')
) AS v(title, type, url, description, audience)
WHERE NOT EXISTS (
  SELECT 1 FROM resources r WHERE r.title = v.title
);

-- ----------------------------------------------------------------------------
-- DATE IDEAS
-- ----------------------------------------------------------------------------
INSERT INTO date_ideas (title, description, category)
SELECT v.title, v.description, v.category
FROM (VALUES
  ('Cook Together',         'Pick a new recipe you have never tried as a team.', 'home'),
  ('Memory Lane Walk',      'Walk to a meaningful spot and share a memory.',     'outdoor'),
  ('Question Game',         'Take turns asking each other deep questions.',      'conversation'),
  ('Plan a Future Trip',    'Dream up a vacation together. No commitment.',      'planning'),
  ('Phone-Free Hour',       'One hour together, no screens.',                    'connection')
) AS v(title, description, category)
WHERE NOT EXISTS (
  SELECT 1 FROM date_ideas d WHERE d.title = v.title
);

-- ----------------------------------------------------------------------------
-- WORKSHEETS — starter templates (one per audience + a Gottman week 1)
-- ----------------------------------------------------------------------------
INSERT INTO worksheets (title, description, audience, program_id, content, is_template)
SELECT v.title, v.description, v.audience, v.program_id, v.content::jsonb, true
FROM (VALUES
  (
    'My Feelings Today',
    'A simple check-in to name and rate today''s feelings.',
    'child',
    NULL,
    '{
      "type": "questionnaire",
      "questions": [
        "Which emoji best describes how you feel right now?",
        "Where in your body do you feel it?",
        "On a scale of 1-10, how big is the feeling?",
        "What is one thing that could help?"
      ]
    }'
  ),
  (
    'Thought Detective',
    'Catch a tough thought, ask what evidence supports or challenges it.',
    'teen',
    NULL,
    '{
      "type": "cbt",
      "questions": [
        "What is the thought that is bothering you?",
        "What is the evidence FOR this thought?",
        "What is the evidence AGAINST it?",
        "What is a more balanced thought?"
      ]
    }'
  ),
  (
    'Love Maps — Week 1',
    'Get to know your partner''s inner world (Gottman Method, Week 1).',
    'couples',
    'gottman_12week',
    '{
      "type": "questionnaire",
      "week": 1,
      "questions": [
        "Name two of your partner''s closest friends.",
        "What is one of your partner''s greatest fears?",
        "What is your partner''s favorite way to relax?",
        "Name a stressor your partner faced today.",
        "What is your partner most proud of right now?"
      ]
    }'
  ),
  (
    'Family Repair Plan',
    'After a rupture, what does repair look like in your home?',
    'family',
    NULL,
    '{
      "type": "reflection",
      "questions": [
        "What happened from your perspective?",
        "What feeling came up for you?",
        "What might your child have felt?",
        "What is one repair action you can take today?"
      ]
    }'
  )
) AS v(title, description, audience, program_id, content)
WHERE NOT EXISTS (
  SELECT 1 FROM worksheets w WHERE w.title = v.title
);
