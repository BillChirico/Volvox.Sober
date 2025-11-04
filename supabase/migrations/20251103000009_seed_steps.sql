-- Migration: Seed 12 AA Steps reference data
-- Description: Pre-populate steps table with Alcoholics Anonymous 12 steps
-- Created: 2025-11-03

INSERT INTO steps (step_number, step_title, step_description, default_questions) VALUES
(1,
 'We admitted we were powerless over alcohol—that our lives had become unmanageable',
 'Step 1 is about recognizing the problem and accepting that you cannot control your addiction on your own. This step involves honest self-assessment about the impact of substance use on your life.',
 '["What specific ways has your substance use made your life unmanageable?", "What does powerlessness mean to you?", "How have you tried to control your use in the past, and what were the results?"]'::jsonb),

(2,
 'Came to believe that a Power greater than ourselves could restore us to sanity',
 'Step 2 is about finding hope through a higher power (which can be spiritual, the recovery community, or any force you believe can help you). It''s about opening yourself to the possibility of change.',
 '["What does a ''Power greater than yourself'' mean to you?", "How has your higher power (or the concept of one) helped you so far?", "What does sanity look like for you?"]'::jsonb),

(3,
 'Made a decision to turn our will and our lives over to the care of God as we understood Him',
 'Step 3 is about making a commitment to recovery and letting go of the need to control everything yourself. It involves trusting in a process or power beyond yourself.',
 '["What does it mean to turn your will over to your higher power?", "What fears do you have about letting go of control?", "What does surrender look like in your recovery journey?"]'::jsonb),

(4,
 'Made a searching and fearless moral inventory of ourselves',
 'Step 4 is about taking an honest look at your character, identifying patterns of behavior, and examining how your actions have affected yourself and others.',
 '["What character defects have you identified in yourself?", "How have your actions harmed others or yourself?", "What patterns of behavior do you want to change?"]'::jsonb),

(5,
 'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs',
 'Step 5 is about sharing your moral inventory (from Step 4) with another person and your higher power. This step involves honesty, vulnerability, and accountability.',
 '["What was the most difficult part of your inventory to share?", "How did it feel to admit your wrongs to another person?", "What insights did you gain from this process?"]'::jsonb),

(6,
 'Were entirely ready to have God remove all these defects of character',
 'Step 6 is about preparing yourself mentally and spiritually to let go of the negative behaviors and thought patterns you''ve identified. It requires willingness to change.',
 '["Which character defects are you most ready to let go of?", "What defects are you still attached to, and why?", "What does being ''entirely ready'' mean to you?"]'::jsonb),

(7,
 'Humbly asked Him to remove our shortcomings',
 'Step 7 is about actively asking your higher power to help you remove your character defects. It involves humility and a recognition that you cannot fix everything alone.',
 '["What does humility mean to you?", "How have you asked your higher power for help with your shortcomings?", "What changes have you noticed since asking for help?"]'::jsonb),

(8,
 'Made a list of all persons we had harmed, and became willing to make amends to them all',
 'Step 8 is about creating a list of people you''ve hurt and developing a willingness to make amends. This step prepares you for taking responsibility for past actions.',
 '["Who have you harmed through your substance use or behaviors?", "What makes you hesitant to make amends to certain people?", "How do you define ''willingness'' in the context of this step?"]'::jsonb),

(9,
 'Made direct amends to such people wherever possible, except when to do so would injure them or others',
 'Step 9 is about taking action to repair relationships and make things right with the people you''ve harmed. It requires courage, discernment, and sometimes professional guidance.',
 '["What amends have you made so far, and how did they go?", "Are there situations where making amends would cause more harm? How do you handle those?", "What have you learned about yourself through making amends?"]'::jsonb),

(10,
 'Continued to take personal inventory and when we were wrong promptly admitted it',
 'Step 10 is about ongoing self-reflection and accountability. It involves regularly examining your thoughts and actions and quickly correcting course when needed.',
 '["How do you maintain a daily or regular personal inventory?", "What patterns have you noticed in your behavior recently?", "How quickly do you admit when you''re wrong, and what helps you do that?"]'::jsonb),

(11,
 'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out',
 'Step 11 is about deepening your spiritual practice and connection with your higher power through prayer, meditation, or other reflective practices. It''s about seeking guidance and strength.',
 '["What spiritual practices help you feel connected to your higher power?", "How do you seek guidance in your daily life?", "What does ''knowledge of His will'' mean to you?"]'::jsonb),

(12,
 'Having had a spiritual awakening as the result of these steps, we tried to carry this message to alcoholics, and to practice these principles in all our affairs',
 'Step 12 is about giving back by helping others in recovery and integrating recovery principles into all aspects of your life. It emphasizes service and continued growth.',
 '["What spiritual awakening have you experienced through working these steps?", "How do you carry the message of recovery to others?", "In what ways do you practice these principles in your daily life?"]'::jsonb);

-- Add comment for documentation
COMMENT ON TABLE steps IS 'Pre-seeded with 12 AA steps - read-only reference data for all users';
