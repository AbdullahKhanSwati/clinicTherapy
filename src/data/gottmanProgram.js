// 12-Week Gottman Method Couples Program
// Each week is a structured worksheet template with steps following the
// Why This Matters / Intro / Steps / Reflection / Closing Insight pattern.
//
// Phase 1 (Weeks 1-3): Friendship & Emotional Safety
// Phase 2 (Weeks 4-6): Communication & Conflict
// Phase 3 (Weeks 7-9): Deeper Emotional Connection
// Phase 4 (Weeks 10-12): Trust, Meaning & Future Vision

const baseMeta = {
  category: 'Gottman Program',
  targetAudience: 'couples',
  difficulty: 'intermediate',
  estimatedTime: '15 mins',
  programId: 'gottman_12week',
};

const therapistInsight = (s) => `THERAPIST: ${s}`;

export const GOTTMAN_PROGRAM_META = {
  id: 'gottman_12week',
  title: '12-Week Couples Program (Gottman Method)',
  subtitle: 'Rebuilding Connection, Trust & Emotional Safety',
  description:
    'A structured 12-week journey based on the Gottman Method — friendship, communication, deeper connection, and shared meaning.',
  phases: [
    { id: 1, label: 'Friendship & Emotional Safety', weeks: [1, 2, 3] },
    { id: 2, label: 'Communication & Conflict', weeks: [4, 5, 6] },
    { id: 3, label: 'Deeper Emotional Connection', weeks: [7, 8, 9] },
    { id: 4, label: 'Trust, Meaning & Future Vision', weeks: [10, 11, 12] },
  ],
};

export const GOTTMAN_WEEKS = {
  // ============================
  // PHASE 1 — Friendship & Emotional Safety
  // ============================
  ws_gottman_w1: {
    ...baseMeta,
    id: 'ws_gottman_w1',
    week: 1,
    phase: 1,
    title: 'Week 1 · Building Our Love Maps',
    description: 'Reconnect through curiosity about each other\'s inner world.',
    introduction:
      'This week is about reconnecting through curiosity — not fixing problems. Strong relationships are built on deeply knowing each other.',
    therapistInsight: therapistInsight(
      'Partners often stop asking meaningful questions over time. Help them rebuild emotional familiarity.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Daily Life Awareness',
        prompt:
          'What is currently stressing your partner? What are they excited about? What might they be emotionally carrying?',
        placeholder: 'Share what you notice...',
        required: true,
        saveKey: 'daily_life',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Inner World Exploration',
        prompt:
          'What are your partner\'s current goals? One fear they have? What helps them feel loved?',
        placeholder: 'Reflect on their inner world...',
        required: true,
        saveKey: 'inner_world',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Appreciation',
        prompt:
          'Name 3 things you genuinely appreciate about your partner.',
        placeholder: '1. ...\n2. ...\n3. ...',
        required: true,
        saveKey: 'appreciation',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Weekly Reflection',
        prompt: 'What did you learn about your partner this week?',
        placeholder: 'I noticed...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Emotional intimacy grows when partners remain curious about each other.',
        saveKey: null,
      },
    ],
    completionMessage: 'Beautiful work. Curiosity is the foundation of love.',
  },

  ws_gottman_w2: {
    ...baseMeta,
    id: 'ws_gottman_w2',
    week: 2,
    phase: 1,
    title: 'Week 2 · Turning Toward Instead of Away',
    description: 'Small moments of connection build trust over time.',
    introduction:
      'This week focuses on recognizing and responding to bids for connection.',
    therapistInsight: therapistInsight(
      'A bid is any small attempt for attention, affection, humor, support, or connection. Help them notice and respond.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Recognizing Bids',
        prompt:
          'What are ways your partner reaches for connection? (humor, touch, sharing news, sighs, questions)',
        placeholder: 'They bid by...',
        required: true,
        saveKey: 'bids',
      },
      {
        id: 'step2',
        type: 'multiple-choice',
        title: 'Your Response Style',
        prompt: 'When your partner bids, do you usually:',
        options: [
          { id: 'toward', label: 'Turn toward (engage warmly)' },
          { id: 'away', label: 'Turn away (miss or ignore it)' },
          { id: 'against', label: 'Turn against (snap or dismiss)' },
        ],
        required: true,
        saveKey: 'response_style',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Example Moment',
        prompt: 'Describe a recent example. What did your partner do, what did you do?',
        placeholder: 'They said... I responded by...',
        required: true,
        saveKey: 'example',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Practicing Turning Toward',
        prompt: 'What is one small way you can respond more intentionally this week?',
        placeholder: 'I will...',
        required: true,
        saveKey: 'commitment',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Trust is built in small moments long before major conflicts happen.',
        saveKey: null,
      },
    ],
    completionMessage: 'Notice the bids today. Notice yourself respond.',
  },

  ws_gottman_w3: {
    ...baseMeta,
    id: 'ws_gottman_w3',
    week: 3,
    phase: 1,
    title: 'Week 3 · Creating Emotional Safety',
    description: 'Relationships thrive when both partners feel emotionally safe.',
    introduction:
      'Emotional safety is the foundation of every other skill in this program.',
    therapistInsight: therapistInsight(
      'Emotional safety increases when partners understand impact — not just intention.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'What Makes Me Feel Safe',
        prompt: 'What behaviors help you feel emotionally safe with your partner?',
        placeholder: 'I feel safe when...',
        required: true,
        saveKey: 'safe_behaviors',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'What Makes Me Shut Down',
        prompt: 'What behaviors make you emotionally guarded or distant?',
        placeholder: 'I close off when...',
        required: true,
        saveKey: 'shutdown_triggers',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Safety Repair',
        prompt:
          'What can your partner do during conflict that would help you stay emotionally open?',
        placeholder: 'It would help if...',
        required: true,
        saveKey: 'repair_request',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Reflection',
        prompt: 'What helps you feel emotionally protected in this relationship?',
        placeholder: 'I feel protected when...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Safety is not the absence of conflict — it\'s the presence of repair.',
        saveKey: null,
      },
    ],
    completionMessage: 'Share what you wrote with your partner when both feel calm.',
  },

  // ============================
  // PHASE 2 — Communication & Conflict
  // ============================
  ws_gottman_w4: {
    ...baseMeta,
    id: 'ws_gottman_w4',
    week: 4,
    phase: 2,
    title: 'Week 4 · Soft Start-Ups',
    description: 'The way a conversation begins predicts how it will end.',
    introduction:
      'Replacing harsh start-ups with gentle expression dramatically changes conflict outcomes.',
    therapistInsight: therapistInsight(
      'Replace criticism with gentle expression. Use the I feel / about / I need formula.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Identify Harsh Start-Ups',
        prompt: 'How do conflicts usually begin between you?',
        placeholder: 'They typically start with...',
        required: true,
        saveKey: 'harsh_startups',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Rewriting the Start-Up',
        prompt:
          'Complete the formula: "I feel ___ about ___ and I need ___."',
        placeholder: 'I feel ___ about ___ and I need ___.',
        required: true,
        saveKey: 'soft_startup',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Practice Tone Awareness',
        prompt:
          'Take a recent conflict opener and rewrite it calmly and respectfully.',
        placeholder: 'Original: ... Rewritten: ...',
        required: true,
        saveKey: 'tone_practice',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Reflection',
        prompt: 'What changes when conflict starts more gently?',
        placeholder: 'I notice...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'The first three minutes of a conversation predict its ending 96% of the time. Start soft.',
        saveKey: null,
      },
    ],
    completionMessage: 'Practice one soft start-up this week.',
  },

  ws_gottman_w5: {
    ...baseMeta,
    id: 'ws_gottman_w5',
    week: 5,
    phase: 2,
    difficulty: 'advanced',
    title: 'Week 5 · Understanding Gridlocked Conflict',
    description:
      'Some conflicts aren\'t solvable because they\'re tied to deeper values, needs, or dreams.',
    introduction:
      '69% of relationship conflicts are perpetual — about underlying values, not solvable issues. This week we look beneath.',
    therapistInsight: therapistInsight(
      'Guide them to find the personal meaning, dream, or value embedded in the gridlocked conflict.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Identify a Repeating Conflict',
        prompt: 'What is one conflict that keeps coming back?',
        placeholder: 'We keep arguing about...',
        required: true,
        saveKey: 'repeating_conflict',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'The Deeper Meaning',
        prompt: 'What deeper need or value is connected to this conflict for you?',
        placeholder: 'For me this is really about...',
        required: true,
        saveKey: 'deeper_meaning',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Listening Without Persuading',
        prompt: 'What do you think this conflict means to your partner?',
        placeholder: 'For them it might be about...',
        required: true,
        saveKey: 'partner_meaning',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Reflection',
        prompt: 'How does understanding the deeper meaning change the conversation?',
        placeholder: 'It shifts...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Gridlocked conflicts are managed, not solved. Understanding the dream beneath is what creates peace.',
        saveKey: null,
      },
    ],
    completionMessage: 'Curiosity, not persuasion, dissolves gridlock.',
  },

  ws_gottman_w6: {
    ...baseMeta,
    id: 'ws_gottman_w6',
    week: 6,
    phase: 2,
    title: 'Week 6 · Repair Attempts',
    description: 'Healthy couples repair quickly after disconnection.',
    introduction:
      'Repair attempts are any action that keeps conflict from escalating or fixes it after it does.',
    therapistInsight: therapistInsight(
      'Help them name what their partner\'s repair attempts look like — and what they themselves need to accept repair.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Recognizing Repair Attempts',
        prompt:
          'How does your partner try to repair conflict? (humor, apology, affection, pause, gentle touch)',
        placeholder: 'They repair by...',
        required: true,
        saveKey: 'partner_repair',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'What Helps Me Receive Repair',
        prompt: 'What makes it easier for you to accept repair attempts?',
        placeholder: 'I can accept repair when...',
        required: true,
        saveKey: 'receive_repair',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Building Your Repair Language',
        prompt: 'Complete: "When conflict escalates, it helps when you ___."',
        placeholder: 'When conflict escalates, it helps when you...',
        required: true,
        saveKey: 'repair_language',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Reflection',
        prompt: 'How do repair attempts change the emotional tone of conflict?',
        placeholder: 'They shift the tone by...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'It\'s not the absence of conflict that defines a strong couple — it\'s the speed and warmth of repair.',
        saveKey: null,
      },
    ],
    completionMessage: 'Make one small repair attempt today, even if conflict is small.',
  },

  // ============================
  // PHASE 3 — Deeper Emotional Connection
  // ============================
  ws_gottman_w7: {
    ...baseMeta,
    id: 'ws_gottman_w7',
    week: 7,
    phase: 3,
    title: 'Week 7 · Fondness & Admiration',
    description: 'Positive sentiment protects relationships during stress.',
    introduction:
      'Fondness is the antidote to contempt — the strongest predictor of relationship breakdown.',
    therapistInsight: therapistInsight(
      'Building fondness rebuilds the cognitive lens that sees the partner positively.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Remembering Positive Qualities',
        prompt: 'What initially drew you to your partner?',
        placeholder: 'I was drawn to their...',
        required: true,
        saveKey: 'initial_qualities',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Admiration Statements',
        prompt: 'Complete: "One thing I deeply admire about you is ___."',
        placeholder: 'One thing I deeply admire is...',
        required: true,
        saveKey: 'admiration',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Appreciation Ritual',
        prompt: 'What appreciation can you express daily?',
        placeholder: 'Each day I will tell them...',
        required: true,
        saveKey: 'daily_appreciation',
      },
      {
        id: 'step4',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Fondness is a practice. The lens you choose shapes the relationship you have.',
        saveKey: null,
      },
    ],
    completionMessage: 'Tell your partner one of these aloud today.',
  },

  ws_gottman_w8: {
    ...baseMeta,
    id: 'ws_gottman_w8',
    week: 8,
    phase: 3,
    title: 'Week 8 · Managing Emotional Flooding',
    description: 'When overwhelmed, productive communication becomes impossible.',
    introduction:
      'Flooding is a physiological state — your nervous system is in fight-or-flight. No conversation can be productive until it settles.',
    therapistInsight: therapistInsight(
      'Heart rate above 100 means physiological flooding. Encourage 20+ min self-soothing before re-engaging.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Recognizing Flooding',
        prompt: 'How do you know when you are emotionally overwhelmed?',
        placeholder: 'I notice... (racing heart, shutting down, wanting to leave, etc.)',
        required: true,
        saveKey: 'flooding_signs',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Self-Soothing Plan',
        prompt: 'What helps calm your nervous system?',
        placeholder: 'Walking, breathing, music, silence, water...',
        required: true,
        saveKey: 'self_soothing',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Taking Healthy Breaks',
        prompt:
          'Complete: "When I feel flooded, I need ___ minutes before continuing the conversation."',
        placeholder: 'When I feel flooded, I need...',
        required: true,
        saveKey: 'break_plan',
      },
      {
        id: 'step4',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'A pause is not avoidance — it\'s a return ticket. Pause to come back better.',
        saveKey: null,
      },
    ],
    completionMessage: 'Try the Conflict Pause button next time you feel flooded.',
  },

  ws_gottman_w9: {
    ...baseMeta,
    id: 'ws_gottman_w9',
    week: 9,
    phase: 3,
    title: 'Week 9 · Accepting Influence',
    description: 'Strong couples remain open to each other\'s perspectives.',
    introduction:
      'Accepting influence means letting your partner\'s perspective change you. Resistance breaks connection.',
    therapistInsight: therapistInsight(
      'Particularly important for partners who default to defensiveness or one-up dynamics.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Resistance Awareness',
        prompt: 'When do you become defensive or resistant?',
        placeholder: 'I tend to dig in when...',
        required: true,
        saveKey: 'resistance',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Finding Partial Agreement',
        prompt: 'What part of your partner\'s perspective makes sense?',
        placeholder: 'I can see that...',
        required: true,
        saveKey: 'partial_agreement',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Flexibility Practice',
        prompt: 'What would openness look like in this situation?',
        placeholder: 'Being open would mean...',
        required: true,
        saveKey: 'flexibility',
      },
      {
        id: 'step4',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Yielding to win — finding the 2% you can agree with — disarms most arguments.',
        saveKey: null,
      },
    ],
    completionMessage: 'Practice agreeing with one thing your partner says today.',
  },

  // ============================
  // PHASE 4 — Trust, Meaning & Future Vision
  // ============================
  ws_gottman_w10: {
    ...baseMeta,
    id: 'ws_gottman_w10',
    week: 10,
    phase: 4,
    title: 'Week 10 · Creating Shared Meaning',
    description: 'Couples thrive when they build a shared sense of purpose.',
    introduction:
      'Shared meaning includes the rituals, symbols, roles, and goals you build together.',
    therapistInsight: therapistInsight(
      'Help couples find what gives their relationship larger meaning beyond daily logistics.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Shared Values',
        prompt: 'What values matter most to both of you?',
        placeholder: 'We both value...',
        required: true,
        saveKey: 'shared_values',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Rituals of Connection',
        prompt:
          'What rituals help you feel connected? (meals, check-ins, traditions)',
        placeholder: 'We feel connected during...',
        required: true,
        saveKey: 'rituals',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Shared Vision',
        prompt: 'What kind of relationship do you want to create together?',
        placeholder: 'I envision us...',
        required: true,
        saveKey: 'shared_vision',
      },
      {
        id: 'step4',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Without shared meaning, daily life becomes a negotiation. With it, daily life becomes a journey.',
        saveKey: null,
      },
    ],
    completionMessage: 'Schedule one shared ritual to begin this week.',
  },

  ws_gottman_w11: {
    ...baseMeta,
    id: 'ws_gottman_w11',
    week: 11,
    phase: 4,
    difficulty: 'advanced',
    title: 'Week 11 · Rebuilding Trust',
    description: 'Trust grows through emotional reliability and responsiveness.',
    introduction:
      'Trust is built in thousands of small moments of attunement and responsiveness.',
    therapistInsight: therapistInsight(
      'Use sensitively for couples with infidelity, dishonesty, or major trust ruptures.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Defining Trust',
        prompt: 'What helps you trust your partner emotionally?',
        placeholder: 'Trust grows for me when...',
        required: true,
        saveKey: 'trust_definition',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Trust Injuries',
        prompt: 'What moments weakened trust?',
        placeholder: 'It was hard when...',
        required: true,
        saveKey: 'trust_injuries',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Repairing Trust',
        prompt: 'What actions help rebuild trust?',
        placeholder: 'Trust comes back when...',
        required: true,
        saveKey: 'rebuilding',
      },
      {
        id: 'step4',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Trust is not declared — it\'s demonstrated, over and over, in small daily acts.',
        saveKey: null,
      },
    ],
    completionMessage: 'Consider sharing this with your therapist before your partner.',
  },

  ws_gottman_w12: {
    ...baseMeta,
    id: 'ws_gottman_w12',
    week: 12,
    phase: 4,
    title: 'Week 12 · Our Relationship Moving Forward',
    description: 'Healthy relationships are continuously created through intention.',
    introduction:
      'A graduation reflection — what you\'ve learned, where you\'re going, what practices you\'ll keep.',
    therapistInsight: therapistInsight(
      'Consolidate the program. Identify their top 3 practices to maintain.'
    ),
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'What We\'ve Learned',
        prompt: 'What have you learned about yourselves and each other?',
        placeholder: 'I\'ve learned...',
        required: true,
        saveKey: 'learnings',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Our New Relationship Commitments',
        prompt: 'Complete: "Going forward, we want our relationship to feel more ___."',
        placeholder: 'Going forward, we want...',
        required: true,
        saveKey: 'commitments',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Future Connection Plan',
        prompt: 'What practices will help you maintain connection?',
        placeholder: 'We\'ll keep doing...',
        required: true,
        saveKey: 'maintenance_plan',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Final Reflection',
        prompt: 'What gives you hope about your relationship?',
        placeholder: 'I have hope because...',
        required: false,
        saveKey: 'hope',
      },
      {
        id: 'step5',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'You\'ve finished the program — but the practice continues. Schedule a quarterly check-in to revisit these reflections.',
        saveKey: null,
      },
    ],
    completionMessage: 'Congratulations. This is a beginning, not an ending.',
  },
};
