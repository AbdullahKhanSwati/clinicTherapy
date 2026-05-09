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
    profileColor: '#EC4D9C',
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
    profileColor: '#2A8FA3',
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
    profileColor: '#1B6B7F',
    avatar: '👨',
  },
  partner2: {
    id: 'partner2',
    name: 'Sarah',
    email: 'sarah@example.com',
    role: 'couples',
    age: 33,
    relationshipStatus: 'married',
    profileColor: '#F59E0B',
    avatar: '👩',
  },
  // Family/Parent user
  parent1: {
    id: 'parent1',
    name: 'Mom',
    email: 'mom@example.com',
    role: 'family',
    age: 42,
    children: ['child1'],
    profileColor: '#10B981',
    avatar: '👩‍👧',
  },
  // Therapist
  therapist1: {
    id: 'therapist1',
    name: 'Dr. Smith',
    email: 'dr.smith@therapy.com',
    role: 'therapist',
    specializations: ['Anxiety', 'Child Therapy', 'Couples Therapy'],
    clients: ['child1', 'teen1', 'partner1', 'partner2'],
  },
};

export const MOOD_ENTRIES = [
  { userId: 'child1', date: new Date().toISOString(), mood: 'happy', intensity: 8, notes: 'Had fun at school today!' },
  { userId: 'child1', date: new Date(Date.now() - 86400000).toISOString(), mood: 'okay', intensity: 5, notes: 'Homework was hard' },
  { userId: 'teen1', date: new Date().toISOString(), mood: 'anxious', intensity: 6, notes: 'Worried about test tomorrow' },
  { userId: 'teen1', date: new Date(Date.now() - 86400000).toISOString(), mood: 'happy', intensity: 7, notes: '' },
  { userId: 'partner1', date: new Date().toISOString(), mood: 'happy', intensity: 7, notes: '' },
  { userId: 'partner2', date: new Date().toISOString(), mood: 'okay', intensity: 5, notes: 'Stressed from work' },
];

export const JOURNAL_ENTRIES = [
  {
    id: 'journal1',
    userId: 'child1',
    date: new Date().toISOString(),
    title: 'Today was fun!',
    content: 'I played with my friends at recess and we had so much fun on the swings!',
    mood: 'happy',
  },
  {
    id: 'journal2',
    userId: 'teen1',
    date: new Date(Date.now() - 86400000).toISOString(),
    title: 'Feeling better about the project',
    content: 'After talking to my friend, I feel more confident about presenting the project to the class.',
    mood: 'happy',
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
