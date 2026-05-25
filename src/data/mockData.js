// Mock Data - Simulates a complete therapy backend
// This file contains all mock data for worksheets, users, assignments, etc.

export const MOCK_USERS = {
  // Child user
  child1: {
    id: 'child1',
    name: 'Sophie',
    email: 'sophie@example.com',
    role: 'child',
    age: 8,
    emotionalFocus: ['Anxiety', 'Emotional Regulation'],
    profileColor: '#FF6B9D',
    avatar: '👧',
  },
  // Teen user
  teen1: {
    id: 'teen1',
    name: 'Alex',
    email: 'alex@example.com',
    role: 'teen',
    age: 15,
    emotionalFocus: ['Anxiety', 'Social Skills', 'Self-Esteem'],
    profileColor: '#00A8CC',
    avatar: '🧑',
  },
  // Couples users
  partner1: {
    id: 'partner1',
    name: 'John',
    email: 'john@example.com',
    role: 'couples',
    age: 35,
    relationshipStatus: 'married',
    profileColor: '#00A8CC',
    avatar: '👨',
  },
  partner2: {
    id: 'partner2',
    name: 'Sarah',
    email: 'sarah@example.com',
    role: 'couples',
    age: 33,
    relationshipStatus: 'married',
    profileColor: '#FFA500',
    avatar: '👩',
  },
  // Family/Parent users
  parent1: {
    id: 'parent1',
    name: 'Maria Chen',
    email: 'maria.chen@example.com',
    role: 'family',
    age: 42,
    children: ['child1', 'teen1'],
    parentingRelationship: 'mother',
    profileColor: '#15803D',
    avatar: '👩‍👧',
  },
  parent2: {
    id: 'parent2',
    name: 'David Park',
    email: 'david.park@example.com',
    role: 'family',
    age: 45,
    children: ['child2'],
    parentingRelationship: 'father',
    profileColor: '#0891B2',
    avatar: '👨',
  },
  // Extra child for parent2 to demonstrate parent management
  child2: {
    id: 'child2',
    name: 'Lily',
    email: 'lily@example.com',
    role: 'child',
    age: 7,
    emotionalFocus: ['Confidence', 'Sleep'],
    profileColor: '#FFD93D',
    avatar: '👧',
  },
  // Therapist
  therapist1: {
    id: 'therapist1',
    name: 'Dr. Smith',
    email: 'dr.smith@therapy.com',
    role: 'therapist',
    specializations: ['Anxiety', 'Child Therapy', 'Couples Therapy'],
    clients: ['child1', 'child2', 'teen1', 'partner1', 'partner2', 'parent1', 'parent2'],
  },
};

export const MOOD_ENTRIES = [
  { userId: 'child1', date: new Date().toISOString(), mood: 'happy', intensity: 8, notes: 'Had fun at school today!' },
  { userId: 'child1', date: new Date(Date.now() - 86400000).toISOString(), mood: 'okay', intensity: 5, notes: 'Homework was hard' },
  { userId: 'child1', date: new Date(Date.now() - 172800000).toISOString(), mood: 'happy', intensity: 7, notes: 'Great day!' },
  { userId: 'child1', date: new Date(Date.now() - 259200000).toISOString(), mood: 'anxious', intensity: 6, notes: 'Worried about test' },
  { userId: 'child1', date: new Date(Date.now() - 345600000).toISOString(), mood: 'happy', intensity: 8, notes: 'Played with friends' },
  { userId: 'child1', date: new Date(Date.now() - 432000000).toISOString(), mood: 'excited', intensity: 9, notes: 'Birthday party!' },
  { userId: 'child1', date: new Date(Date.now() - 518400000).toISOString(), mood: 'happy', intensity: 7, notes: 'Nice day' },
  { userId: 'teen1', date: new Date().toISOString(), mood: 'anxious', intensity: 6, notes: 'Worried about test tomorrow' },
  { userId: 'teen1', date: new Date(Date.now() - 86400000).toISOString(), mood: 'happy', intensity: 7, notes: '' },
  // Couples — partner1 (current user when role=couples)
  { userId: 'partner1', date: new Date().toISOString(), mood: 'happy', intensity: 7, notes: 'Good chat with Sarah this morning' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000).toISOString(), mood: 'calm', intensity: 7, notes: 'Quiet evening together' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000 * 2).toISOString(), mood: 'anxious', intensity: 6, notes: 'Work was overwhelming' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000 * 3).toISOString(), mood: 'happy', intensity: 8, notes: 'Date night was great' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000 * 4).toISOString(), mood: 'okay', intensity: 5, notes: '' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000 * 5).toISOString(), mood: 'excited', intensity: 8, notes: 'Planned our trip' },
  { userId: 'partner1', date: new Date(Date.now() - 86400000 * 6).toISOString(), mood: 'calm', intensity: 7, notes: 'Sunday wind-down' },
  // Couples — partner2
  { userId: 'partner2', date: new Date().toISOString(), mood: 'okay', intensity: 5, notes: 'Stressed from work' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000).toISOString(), mood: 'happy', intensity: 7, notes: 'Felt heard tonight' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000 * 2).toISOString(), mood: 'anxious', intensity: 6, notes: 'Deadlines piling up' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000 * 3).toISOString(), mood: 'happy', intensity: 8, notes: 'Loved the date' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000 * 4).toISOString(), mood: 'calm', intensity: 6, notes: '' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000 * 5).toISOString(), mood: 'excited', intensity: 8, notes: 'Trip planning!' },
  { userId: 'partner2', date: new Date(Date.now() - 86400000 * 6).toISOString(), mood: 'sad', intensity: 4, notes: 'Missed family back home' },
];

export const JOURNAL_ENTRIES = [
  {
    id: 'journal1',
    userId: 'child1',
    date: new Date().toISOString(),
    title: 'Today was fun!',
    content: 'I played with my friends at recess and we had so much fun on the swings!',
    mood: 'happy',
    emoji: '🎉',
  },
  {
    id: 'journal2',
    userId: 'child1',
    date: new Date(Date.now() - 86400000).toISOString(),
    title: 'My feelings',
    content: 'Sometimes I feel sad but I know I can talk to my therapist about it.',
    mood: 'okay',
    emoji: '💭',
  },
  {
    id: 'journal3',
    userId: 'child1',
    date: new Date(Date.now() - 172800000).toISOString(),
    title: 'Learning to breathe',
    content: 'I learned a new breathing exercise today and it really helps when I feel nervous!',
    mood: 'excited',
    emoji: '😊',
  },
  {
    id: 'journal4',
    userId: 'child1',
    date: new Date(Date.now() - 259200000).toISOString(),
    title: 'Birthday happiness',
    content: 'My birthday was the best! I got so many presents and my family made me a cake.',
    mood: 'happy',
    emoji: '🎂',
  },
  {
    id: 'journal5',
    userId: 'teen1',
    date: new Date(Date.now() - 86400000).toISOString(),
    title: 'Feeling better about the project',
    content: 'After talking to my friend, I feel more confident about presenting the project to the class.',
    mood: 'happy',
    emoji: '📚',
  },
  // Couples journal entries (partner1)
  {
    id: 'journal_p1_1',
    userId: 'partner1',
    date: new Date().toISOString(),
    title: 'A good morning',
    content: 'Sarah and I had coffee together before work — phone-free. It felt like the old days. Small ritual, big difference.',
    mood: 'happy',
    emoji: '☕',
  },
  {
    id: 'journal_p1_2',
    userId: 'partner1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    title: 'Working through tension',
    content: 'We had a tough conversation about finances. Used the active listening tool. It actually helped — we both felt heard.',
    mood: 'calm',
    emoji: '💬',
  },
  {
    id: 'journal_p1_3',
    userId: 'partner1',
    date: new Date(Date.now() - 86400000 * 4).toISOString(),
    title: 'Date night reflections',
    content: 'Tried the new restaurant downtown. We laughed more than we have in weeks. Note to self: prioritize these nights.',
    mood: 'excited',
    emoji: '💕',
  },
  // Couples journal entries (partner2)
  {
    id: 'journal_p2_1',
    userId: 'partner2',
    date: new Date(Date.now() - 86400000).toISOString(),
    title: 'Felt heard',
    content: 'John really listened tonight without trying to fix anything. That\'s what I needed. Grateful.',
    mood: 'happy',
    emoji: '🙏',
  },
];

export const WORKSHEETS_COMPLETED = [
  {
    id: 'completed1',
    userId: 'child1',
    worksheetId: 'ws_emotion_identification',
    assignmentId: 'assign1',
    completedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    responses: {
      step1_emotion: 'angry',
      step1_intensity: 7,
      step2_trigger: 'Brother took my toy',
      step3_coping: 'took deep breaths',
      step4_reflection: 'It helped me feel better',
    },
    sharedWithTherapist: true,
  },
  {
    id: 'completed2',
    userId: 'child1',
    worksheetId: 'ws_anxiety_thought_record',
    assignmentId: 'assign2',
    completedDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    responses: {
      step1_situation: 'First day at new school',
      step1_anxietyLevel: 8,
      step2_thoughts: 'What if nobody likes me?',
      step3_evidence: 'My friends from before liked me',
      step4_alternate: 'I can make new friends',
      step5_anxietyAfter: 5,
    },
    sharedWithTherapist: true,
  },
  {
    id: 'completed3',
    userId: 'child1',
    worksheetId: 'ws_breathing_exercise',
    assignmentId: 'assign_extra1',
    completedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    responses: {
      exercise_type: 'box_breathing',
      duration: '5 minutes',
      difficulty: 'easy',
    },
    sharedWithTherapist: true,
  },
];

export const WORKSHEET_ASSIGNMENTS = [
  {
    id: 'assign1',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_emotion_identification',
    assignedDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'completed',
    priority: 'high',
    notes: 'Please complete this to help identify your emotions',
    sharedWith: 'therapist',
  },
  {
    id: 'assign2',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_anxiety_thought_record',
    assignedDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'completed',
    priority: 'high',
    notes: '',
    sharedWith: 'therapist',
  },
  {
    id: 'assign3',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_breathing_exercise',
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'pending',
    priority: 'medium',
    notes: 'New worksheet - start when ready!',
    sharedWith: 'therapist',
  },
  {
    id: 'assign4',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_grounding_techniques',
    assignedDate: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    status: 'in-progress',
    priority: 'medium',
    notes: 'Work at your own pace',
    sharedWith: 'therapist',
  },
  {
    id: 'assign5',
    clientId: 'teen1',
    therapistId: 'therapist1',
    worksheetId: 'ws_self_esteem',
    assignedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'in-progress',
    priority: 'medium',
    notes: 'Work at your own pace',
    sharedWith: 'therapist',
  },
  {
    id: 'assign6',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_emotion_identification',
    assignedDate: new Date().toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'pending',
    priority: 'high',
    notes: 'Try this when you have a strong feeling today',
    sharedWith: 'therapist',
  },
  {
    id: 'assign7',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_anxiety_thought_record',
    assignedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: 'in-progress',
    priority: 'medium',
    notes: 'Use this next time you feel worried',
    sharedWith: 'therapist',
  },
  {
    id: 'assign8',
    clientId: 'child1',
    therapistId: 'therapist1',
    worksheetId: 'ws_self_esteem',
    assignedDate: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 10).toISOString(),
    status: 'pending',
    priority: 'low',
    notes: 'A short reflection on what you like about yourself',
    sharedWith: 'therapist',
  },
  // ==================
  // COUPLES — partner1
  // ==================
  {
    id: 'assign_couple_1',
    clientId: 'partner1',
    therapistId: 'therapist1',
    worksheetId: 'ws_active_listening',
    assignedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'in-progress',
    priority: 'high',
    notes: 'Practice this with Sarah this week — focus on reflecting back.',
    sharedWith: 'partner',
  },
  {
    id: 'assign_couple_2',
    clientId: 'partner1',
    therapistId: 'therapist1',
    worksheetId: 'ws_gratitude_share',
    assignedDate: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'pending',
    priority: 'medium',
    notes: 'Try to do this together at the end of each day.',
    sharedWith: 'partner',
  },
  {
    id: 'assign_couple_3',
    clientId: 'partner1',
    therapistId: 'therapist1',
    worksheetId: 'ws_conflict_repair',
    assignedDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'pending',
    priority: 'high',
    notes: 'Use after the next disagreement — no rush, complete when needed.',
    sharedWith: 'partner',
  },
  {
    id: 'assign_couple_4',
    clientId: 'partner1',
    therapistId: 'therapist1',
    worksheetId: 'ws_shared_vision',
    assignedDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 14).toISOString(),
    status: 'completed',
    priority: 'medium',
    notes: 'Great work — revisit quarterly.',
    sharedWith: 'partner',
  },
  // Same set mirrored to partner2 (in real apps both partners would see the same shared worksheets)
  {
    id: 'assign_couple_5',
    clientId: 'partner2',
    therapistId: 'therapist1',
    worksheetId: 'ws_active_listening',
    assignedDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'in-progress',
    priority: 'high',
    notes: 'Practice with John this week.',
    sharedWith: 'partner',
  },
  {
    id: 'assign_couple_6',
    clientId: 'partner2',
    therapistId: 'therapist1',
    worksheetId: 'ws_gratitude_share',
    assignedDate: new Date(Date.now() - 86400000).toISOString(),
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: 'pending',
    priority: 'medium',
    notes: '',
    sharedWith: 'partner',
  },
];

export const THERAPY_PROGRAMS = [
  {
    id: 'program_anxiety_toolkit',
    title: 'Anxiety Management Toolkit',
    description: 'Complete 8-week program for managing anxiety',
    targetAge: '8-12',
    duration: '8 weeks',
    worksheets: [
      'ws_emotion_identification',
      'ws_breathing_exercise',
      'ws_thought_record',
      'ws_grounding_techniques',
    ],
    difficulty: 'beginner',
  },
  {
    id: 'program_teen_confidence',
    title: 'Teen Confidence Builder',
    description: 'Build self-esteem and confidence for teens',
    targetAge: '13-18',
    duration: '6 weeks',
    worksheets: [
      'ws_self_esteem',
      'ws_assertiveness',
      'ws_social_skills',
      'ws_goal_setting',
    ],
    difficulty: 'intermediate',
  },
];

export const THERAPIST_NOTES = [
  {
    id: 'note1',
    clientId: 'child1',
    therapistId: 'therapist1',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    content: 'Sophie showed improvement in identifying her emotions. Continue work on coping strategies.',
    category: 'progress',
  },
  {
    id: 'note2',
    clientId: 'child1',
    therapistId: 'therapist1',
    date: new Date().toISOString(),
    content: 'Noticed good engagement with breathing exercises. Consider assigning grounding techniques next.',
    category: 'observation',
  },
];

// ============================
// AFFIRMATIONS — managed by admin
// ============================
export const AFFIRMATIONS = [
  {
    id: 'af_1',
    text: 'You are doing better than you think.',
    category: 'Self-compassion',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'af_2',
    text: 'Progress, not perfection.',
    category: 'Growth',
    audience: 'teen',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'af_3',
    text: 'Your feelings are valid.',
    category: 'Self-compassion',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 'af_4',
    text: 'I am safe in this moment.',
    category: 'Anxiety',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'af_5',
    text: 'Small acts of kindness compound.',
    category: 'Connection',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'af_6',
    text: 'I am stronger than this moment.',
    category: 'Resilience',
    audience: 'teen',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

// ============================
// COPING TOOLS — managed by admin
// ============================
export const COPING_TOOLS = [
  {
    id: 'ct_box_breathing',
    title: 'Box Breathing',
    type: 'breathing',
    description: '4-4-4-4 pattern to calm your nervous system',
    instructions:
      'Inhale for 4 seconds. Hold for 4. Exhale for 4. Hold for 4. Repeat for 5 cycles.',
    duration: '5 min',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'ct_grounding_5_4_3_2_1',
    title: '5-4-3-2-1 Grounding',
    type: 'grounding',
    description: 'Anchor yourself in the present using your five senses',
    instructions:
      'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
    duration: '3 min',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'ct_safe_place',
    title: 'Safe Place Visualization',
    type: 'visualization',
    description: 'Mental imagery of a place where you feel completely safe',
    instructions:
      'Close your eyes. Picture a place where you feel safe — real or imagined. Notice details: light, sound, smell, temperature. Stay there for 5 minutes.',
    duration: '7 min',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'ct_478_breathing',
    title: '4-7-8 Breathing',
    type: 'breathing',
    description: 'Powerful technique to fall asleep or release stress',
    instructions:
      'Inhale through the nose for 4 seconds. Hold for 7. Exhale through the mouth for 8. Repeat 4 times.',
    duration: '4 min',
    audience: 'teen',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
  },
  {
    id: 'ct_progressive_muscle',
    title: 'Progressive Muscle Relaxation',
    type: 'relaxation',
    description: 'Tense and release muscle groups to discharge physical tension',
    instructions:
      'Starting at your feet, tense each muscle group for 5 seconds, then release. Move up the body: legs, abdomen, chest, arms, hands, neck, face.',
    duration: '10 min',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
];

// ============================
// RESOURCES — managed by admin, assignable to clients
// ============================
export const RESOURCES = [
  {
    id: 'res_1',
    title: 'Understanding Anxiety: A Parent Guide',
    description: 'Helpful overview for parents on what anxiety looks like in children.',
    type: 'article',
    url: 'https://example.com/anxiety-parent-guide',
    category: 'Anxiety',
    audience: 'family',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'res_2',
    title: 'Teen Sleep Hygiene Checklist',
    description: 'A printable checklist to help build better sleep routines.',
    type: 'document',
    url: 'https://example.com/teen-sleep',
    category: 'Sleep',
    audience: 'teen',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'res_3',
    title: 'The 5 Love Languages — Quick Overview',
    description: 'Short read on how partners give and receive love differently.',
    type: 'article',
    url: 'https://example.com/love-languages',
    category: 'Communication',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'res_4',
    title: 'Mindful Breathing for Kids (Video)',
    description: 'A 5-minute guided breathing exercise designed for children.',
    type: 'video',
    url: 'https://example.com/mindful-kids',
    category: 'Mindfulness',
    audience: 'child',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'res_5',
    title: 'Crisis Hotline Numbers',
    description: 'Important numbers to keep handy in case of emergency.',
    type: 'note',
    url: '',
    content:
      'National Suicide Prevention Lifeline: 988\nCrisis Text Line: Text HOME to 741741',
    category: 'Crisis Support',
    audience: 'all',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// Per-client resource assignments (which resources are pinned to which client)
export const CLIENT_RESOURCES = [
  {
    id: 'cr_1',
    clientId: 'teen1',
    resourceId: 'res_2',
    assignedBy: 'therapist1',
    assignedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    note: 'Sleep has been a struggle — try this for the next two weeks.',
  },
  {
    id: 'cr_2',
    clientId: 'partner1',
    resourceId: 'res_3',
    assignedBy: 'therapist1',
    assignedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    note: 'Quick read for our next session.',
  },
  {
    id: 'cr_3',
    clientId: 'child1',
    resourceId: 'res_4',
    assignedBy: 'therapist1',
    assignedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    note: 'Watch with a parent.',
  },
];

// ============================
// DATE IDEAS — Couples-specific content, managed by admin
// ============================
export const DATE_IDEAS = [
  {
    id: 'di_1',
    title: 'Cook a new recipe together',
    description: 'Pick a cuisine neither of you has tried.',
    tag: 'AT HOME',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'di_2',
    title: 'Sunset walk with five questions',
    description: 'Bring five conversation starters with you.',
    tag: 'OUTDOOR',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: 'di_3',
    title: 'Phone-free game night',
    description: 'Devices in another room — full presence.',
    tag: 'AT HOME',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'di_4',
    title: 'Letters to your future selves',
    description: 'Open them on your next anniversary.',
    tag: 'MEANINGFUL',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'di_5',
    title: 'Try a creative class together',
    description: 'Pottery, painting, dance — your pick.',
    tag: 'NEW',
    audience: 'couples',
    createdBy: 'therapist1',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

// ============================
// CUSTOM WORKSHEETS — created by admin (merged with WORKSHEET_TEMPLATES at runtime)
// ============================
export const CUSTOM_WORKSHEETS = [];

// ============================
// COUPLE PAIRINGS — couple-account linking
// ============================
// Each pairing links two user IDs as a couple. Either partner can disconnect.
// The seeded entry mirrors the demo couple (partner1 ↔ partner2).
export const COUPLE_PAIRINGS = [
  {
    id: 'cp_demo',
    partnerAId: 'partner1',
    partnerBId: 'partner2',
    inviteCode: 'DEMO-2025',
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 365).toISOString(),
    pairedAt: new Date(Date.now() - 86400000 * 365).toISOString(),
  },
];

// ============================
// PARTNER CHECK-INS — daily/weekly relationship pulse
// Mood / Connection / Stress (1-10) + need + appreciation
// ============================
export const PARTNER_CHECKINS = [
  {
    id: 'pci_1',
    userId: 'partner1',
    date: new Date(Date.now() - 86400000).toISOString(),
    mood: 7,
    connection: 8,
    stress: 5,
    need: 'A quiet morning coffee together',
    appreciation: 'You listened without trying to fix anything last night.',
  },
  {
    id: 'pci_2',
    userId: 'partner2',
    date: new Date(Date.now() - 86400000).toISOString(),
    mood: 6,
    connection: 7,
    stress: 7,
    need: 'A few minutes of quiet decompression after work',
    appreciation: 'The morning coffee you made me yesterday.',
  },
];

// ============================
// REPAIR REQUESTS — quick repair messages between partners
// ============================
export const REPAIR_REQUESTS = [
  {
    id: 'rr_demo',
    fromUserId: 'partner1',
    toUserId: 'partner2',
    message: 'I felt hurt and want to reconnect.',
    sentAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'acknowledged',
    response: 'I hear you. Can we talk after dinner?',
    respondedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
  },
];

// Pre-set repair message templates
export const REPAIR_MESSAGE_TEMPLATES = [
  { id: 'reconnect', label: 'I felt hurt and want to reconnect.' },
  { id: 'talk_later', label: 'Can we talk later today?' },
  { id: 'reassurance', label: 'I need reassurance.' },
  { id: 'apology', label: 'I need an apology.' },
  { id: 'understand', label: 'I want to understand what happened.' },
];

// ============================
// APPRECIATIONS — daily exchange of fondness
// One appreciation, memory, quality admired, or thank-you
// ============================
export const APPRECIATIONS = [
  {
    id: 'ap_1',
    fromUserId: 'partner1',
    toUserId: 'partner2',
    type: 'thank_you',
    text: 'Thank you for handling the grocery run yesterday.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'ap_2',
    fromUserId: 'partner2',
    toUserId: 'partner1',
    type: 'quality',
    text: 'I admire how patient you are with my family.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ap_3',
    fromUserId: 'partner1',
    toUserId: 'partner2',
    type: 'memory',
    text: 'I keep thinking about our walk last Sunday — quiet and easy.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

// ============================
// CONFLICT PAUSES — log of "We Need a Pause" sessions
// ============================
export const CONFLICT_PAUSES = [];

// ============================
// SHARED GOALS — couple-level commitments
// ============================
export const SHARED_GOALS = [
  {
    id: 'sg_1',
    pairingId: 'cp_demo',
    title: 'Improve communication',
    description: 'Use soft start-ups before bringing up difficult topics.',
    progress: 40,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    therapistReviewed: true,
  },
  {
    id: 'sg_2',
    pairingId: 'cp_demo',
    title: 'Schedule weekly connection time',
    description: 'A 30-minute device-free window every Sunday evening.',
    progress: 70,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    therapistReviewed: false,
  },
];

// ============================
// WORKSHEET RESPONSE VISIBILITY — privacy choice per completed worksheet
// Stored alongside the completed worksheet record.
// Values: 'private' | 'partner' | 'therapist_only' | 'pending'
// ============================
export const VISIBILITY_OPTIONS = [
  {
    id: 'private',
    label: 'Private',
    description: 'Only you can see this',
  },
  {
    id: 'partner',
    label: 'Share with Partner',
    description: 'Your partner can view this',
  },
  {
    id: 'therapist_only',
    label: 'Therapist Only',
    description: 'Useful for sensitive content',
  },
  {
    id: 'pending',
    label: 'Decide Later',
    description: 'Save now, choose later',
  },
];
