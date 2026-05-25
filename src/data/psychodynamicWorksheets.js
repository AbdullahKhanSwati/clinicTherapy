// 10 Psychodynamic Couples Worksheets
// Deep emotional work — triggers, defenses, projection, transference, repair.
// All marked `requiresTherapistGate: true` for the deepest ones, which means
// the app shows a safety-gate prompt before allowing partner-sharing.

const base = {
  category: 'Psychodynamic',
  targetAudience: 'couples',
  difficulty: 'advanced',
  estimatedTime: '20 mins',
  programId: 'psychodynamic_suite',
};

export const PSYCHODYNAMIC_SUITE_META = {
  id: 'psychodynamic_suite',
  title: 'Psychodynamic Couples Suite',
  subtitle: 'Deep insight-oriented work for partners',
  description:
    'Ten clinically-grounded worksheets exploring triggers, defenses, projection, transference, and repair.',
};

export const PSYCHODYNAMIC_WORKSHEETS = {
  // 1. What This Conflict Is Really About
  ws_psyd_conflict_meaning: {
    ...base,
    id: 'ws_psyd_conflict_meaning',
    title: 'What This Conflict Is Really About',
    description:
      'Gently explore what a current conflict represents beneath the surface.',
    introduction:
      'In psychodynamic work, present conflicts often carry meanings from past emotional experiences. What feels like "this moment" may be connected to something much older.',
    therapistInsight:
      'Help the client slow down reactivity and access deeper, more vulnerable feelings beneath the surface conflict.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'The Surface Conflict',
        prompt: 'What was the conflict about?',
        placeholder: 'On the surface it was about...',
        required: true,
        saveKey: 'surface',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Your Immediate Reaction',
        prompt: 'What did you do or say? What emotions did you notice right away?',
        placeholder: 'I reacted by...',
        required: true,
        saveKey: 'reaction',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Slowing Down the Emotion',
        prompt:
          'Beneath your first reaction, what softer or more vulnerable feelings might have been there? (hurt, fear, rejection, loneliness, shame)',
        placeholder: 'Underneath, I think I felt...',
        required: true,
        saveKey: 'softer_feeling',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'The Deeper Meaning',
        prompt:
          'Have you ever felt this way before in your life? Does this feeling remind you of an earlier relationship?',
        placeholder: 'This reminds me of...',
        required: true,
        saveKey: 'past_link',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'Linking Past to Present',
        prompt:
          'In this moment, what did your partner represent to you? (someone who ignores you, criticizes you, leaves you, controls you)',
        placeholder: 'They felt like...',
        required: true,
        saveKey: 'representation',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Your Underlying Need',
        prompt:
          'What did you need in that moment? (reassurance, closeness, understanding, respect, safety)',
        placeholder: 'I needed...',
        required: true,
        saveKey: 'underlying_need',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Reflection',
        prompt:
          'What stands out as you connect this conflict to deeper feelings or past experiences?',
        placeholder: 'What I notice...',
        required: false,
        saveKey: 'reflection',
      },
      {
        id: 'step8',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'This conflict may not just be about the present — it may be connected to deeper emotional patterns. Understanding this creates space for change.',
        saveKey: null,
      },
    ],
    completionMessage: 'Sit with this for a day before deciding to share.',
    requiresTherapistGate: false,
  },

  // 2. My Emotional Triggers & Their Origins
  ws_psyd_triggers: {
    ...base,
    id: 'ws_psyd_triggers',
    title: 'My Emotional Triggers & Their Origins',
    description: 'Triggers are emotional memories activated in the present.',
    introduction:
      'Everyone has emotional triggers. This exercise helps you understand where yours come from.',
    therapistInsight:
      'Guide the client gently — connecting triggers to formative experiences without re-traumatizing.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Identify a Trigger',
        prompt:
          'Think of a moment with your partner where your reaction felt stronger than expected. What situation triggered you?',
        placeholder: 'The trigger was...',
        required: true,
        saveKey: 'trigger',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Describe the Reaction',
        prompt: 'What did you feel? What did you do?',
        placeholder: 'I felt... and I...',
        required: true,
        saveKey: 'reaction',
      },
      {
        id: 'step3',
        type: 'slider',
        title: 'Amplification',
        prompt: 'On a scale from 1–10, how intense was your reaction?',
        min: 1,
        max: 10,
        labels: ['Mild', 'Overwhelming'],
        required: true,
        saveKey: 'intensity',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Trace the Origin',
        prompt:
          'When is the earliest time you remember feeling this way? Who in your life made you feel something similar?',
        placeholder: 'I first felt this when...',
        required: true,
        saveKey: 'origin',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'Internal Belief',
        prompt:
          'What did you learn about yourself in those moments? (e.g., "I\'m not important", "I\'ll be abandoned", "I\'m not enough")',
        placeholder: 'I came to believe...',
        required: true,
        saveKey: 'belief',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Present-Day Projection',
        prompt: 'How might this belief affect how you see or react to your partner?',
        placeholder: 'It might cause me to...',
        required: true,
        saveKey: 'projection',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'New Awareness',
        prompt: 'What might be a more balanced or compassionate understanding?',
        placeholder: 'A more balanced view...',
        required: true,
        saveKey: 'reframe',
      },
      {
        id: 'step8',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Understanding your triggers transforms reactivity into awareness — and awareness creates choice.',
        saveKey: null,
      },
    ],
    completionMessage: 'Awareness is the first move toward freedom.',
    requiresTherapistGate: true,
  },

  // 3. How I Protect Myself (Defenses)
  ws_psyd_defenses: {
    ...base,
    id: 'ws_psyd_defenses',
    title: 'How I Protect Myself (Defenses in Relationships)',
    description:
      'Understand the protective patterns that may create distance with your partner.',
    introduction:
      'In close relationships, we all develop ways to protect ourselves. These defenses help us feel safe — but they can also create distance.',
    therapistInsight:
      'Frame defenses with compassion — they were once adaptive. The goal is awareness, not shame.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'Recall a Recent Moment',
        prompt:
          'Think of a recent interaction with your partner where things felt tense, distant, or reactive. What happened?',
        placeholder: 'Recently...',
        required: true,
        saveKey: 'moment',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'What Did You Do to Cope?',
        prompt: 'How did you respond? Not just what you said — how you protected yourself.',
        placeholder: 'I protected myself by...',
        required: true,
        saveKey: 'coping',
      },
      {
        id: 'step3',
        type: 'multiple-choice',
        title: 'Identify Your Defense Style',
        prompt: 'Select any that apply:',
        options: [
          { id: 'withdraw', label: 'Withdrew / shut down' },
          { id: 'criticize', label: 'Became critical or blaming' },
          { id: 'avoid', label: 'Avoided the topic' },
          { id: 'control', label: 'Tried to control the situation' },
          { id: 'intellectualize', label: 'Became overly logical / dismissed feelings' },
          { id: 'overwhelm', label: 'Became overly emotional / overwhelmed' },
          { id: 'fix', label: 'Tried to please or fix quickly' },
        ],
        required: true,
        saveKey: 'defense_styles',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'What Were You Protecting?',
        prompt:
          'What feeling were you trying not to feel? (hurt, rejection, shame, fear of losing connection)',
        placeholder: 'I was avoiding feeling...',
        required: true,
        saveKey: 'protected_feeling',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'The Hidden Vulnerability',
        prompt:
          'If you hadn\'t protected yourself in that moment, what might have come up?',
        placeholder: 'I might have felt...',
        required: true,
        saveKey: 'vulnerability',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Where Did You Learn This?',
        prompt:
          'When did you first learn to respond this way? Who or what in your past may have shaped this pattern?',
        placeholder: 'I think I learned this when...',
        required: true,
        saveKey: 'origin',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'How It Impacts Your Partner',
        prompt: 'How might your partner feel when you respond this way?',
        placeholder: 'They probably feel...',
        required: true,
        saveKey: 'impact',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'A Different Response',
        prompt:
          'If you felt safe enough, how would you want to respond instead?',
        placeholder: 'Instead, I would...',
        required: true,
        saveKey: 'alternative',
      },
      {
        id: 'step9',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Your defenses once helped you survive emotionally. In your relationship now, understanding them allows you to choose connection over protection.',
        saveKey: null,
      },
    ],
    completionMessage: 'Compassion for your defenses comes before changing them.',
    requiresTherapistGate: true,
  },

  // 4. What I Fear Will Happen If I Fully Open Up
  ws_psyd_vulnerability_fear: {
    ...base,
    id: 'ws_psyd_vulnerability_fear',
    title: 'What I Fear Will Happen If I Fully Open Up',
    description:
      'Gently explore what feels risky about being emotionally open with your partner.',
    introduction:
      'Often we hold back not because we don\'t want connection — we hold back because we fear what might happen if we truly let ourselves be seen.',
    therapistInsight:
      'Anchor in attachment theory — fear of vulnerability usually traces back to relational injuries.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'A Moment You Held Back',
        prompt:
          'Think of a recent moment when you felt something important but didn\'t fully express it. What were you feeling? What did you choose not to say?',
        placeholder: 'I held back when...',
        required: true,
        saveKey: 'held_back',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'The Fear Beneath the Silence',
        prompt:
          'If you had fully opened up, what were you afraid might happen? (rejected, dismissed, judged, ignored, misunderstood)',
        placeholder: 'I was afraid that...',
        required: true,
        saveKey: 'fear',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Imagining the Worst Outcome',
        prompt: 'What is the worst thing you imagine could happen if you were fully vulnerable?',
        placeholder: 'The worst case would be...',
        required: true,
        saveKey: 'worst_case',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Emotional Meaning of That Fear',
        prompt:
          'If that fear came true, what would it say about you? ("I\'m not important", "I\'m too much", "I\'ll be alone")',
        placeholder: 'It would mean...',
        required: true,
        saveKey: 'meaning',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'Origins of This Fear',
        prompt:
          'When have you felt this way before in your life? Who made you feel this way, even unintentionally?',
        placeholder: 'I\'ve felt this before when...',
        required: true,
        saveKey: 'origin',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'How This Shows Up in Your Relationship',
        prompt:
          'How does this fear affect how you communicate with your partner? What do you do instead of opening up?',
        placeholder: 'I tend to...',
        required: true,
        saveKey: 'pattern',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Reality vs Fear',
        prompt:
          'Is your partner always responding in the way you fear? What evidence challenges this fear?',
        placeholder: 'Evidence against the fear...',
        required: true,
        saveKey: 'reality_check',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'Taking a Small Risk',
        prompt: 'What is one small, safe way you could express vulnerability?',
        placeholder: 'One small step...',
        required: true,
        saveKey: 'small_risk',
      },
      {
        id: 'step9',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'The fear of vulnerability is often shaped by past experiences. In the present, new emotional experiences can slowly reshape that fear.',
        saveKey: null,
      },
    ],
    completionMessage: 'Vulnerability is a practice. Start with the safest version.',
    requiresTherapistGate: true,
  },

  // 5. What I Assume About You (Projection)
  ws_psyd_projection: {
    ...base,
    id: 'ws_psyd_projection',
    title: 'What I Assume About You (Projection & Misinterpretation)',
    description:
      'Notice the gap between what your partner does and what you assume it means.',
    introduction:
      'In relationships, we don\'t just respond to what our partner does — we respond to what we believe it means.',
    therapistInsight:
      'This is core projection work. Help separate factual behavior from internal interpretations.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'The Situation',
        prompt: 'What did your partner do that upset you?',
        placeholder: 'They...',
        required: true,
        saveKey: 'situation',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Your Immediate Interpretation',
        prompt:
          'What did you assume about your partner? ("They don\'t care", "They\'re ignoring me", "They\'re trying to hurt me")',
        placeholder: 'I assumed...',
        required: true,
        saveKey: 'interpretation',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Emotional Reaction',
        prompt: 'How did that interpretation make you feel?',
        placeholder: 'It made me feel...',
        required: true,
        saveKey: 'emotion',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Alternative Explanations',
        prompt: 'What are 2-3 other possible explanations for your partner\'s behavior?',
        placeholder: '1. ...\n2. ...\n3. ...',
        required: true,
        saveKey: 'alternatives',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'Looking Inward',
        prompt:
          'Have you ever felt this way about yourself? Does this belief sound familiar from earlier experiences?',
        placeholder: 'I have felt this about myself when...',
        required: true,
        saveKey: 'inward',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Past Influence',
        prompt: 'When else have you felt this way? Did someone in your past behave similarly?',
        placeholder: 'This reminds me of...',
        required: true,
        saveKey: 'past',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Present vs Past',
        prompt:
          'How is your partner different from the person or situation you were reminded of?',
        placeholder: 'My partner is different because...',
        required: true,
        saveKey: 'differentiation',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'A More Balanced View',
        prompt:
          'What is a more balanced or compassionate way to understand your partner\'s behavior?',
        placeholder: 'A fairer interpretation...',
        required: true,
        saveKey: 'balanced',
      },
      {
        id: 'step9',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Not every reaction belongs fully to the present. When you separate past from present, you create space for clearer understanding.',
        saveKey: null,
      },
    ],
    completionMessage: 'Curiosity about your assumptions changes the whole relationship.',
    requiresTherapistGate: true,
  },

  // 6. What I Need But Struggle to Ask For
  ws_psyd_unmet_needs: {
    ...base,
    id: 'ws_psyd_unmet_needs',
    title: 'What I Need But Struggle to Ask For',
    description:
      'Identify the emotional needs you express indirectly — and learn to name them.',
    introduction:
      'Many relationship conflicts are not about what is said — but about needs that are felt but never expressed.',
    therapistInsight:
      'Move from defensive expression (criticism, withdrawal) toward direct, vulnerable need-expression.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'A Moment of Disconnection',
        prompt: 'Think of a recent moment when you felt disconnected, hurt, or unseen. What happened?',
        placeholder: 'I felt disconnected when...',
        required: true,
        saveKey: 'disconnection',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'What You Felt',
        prompt: 'What did you feel? (lonely, hurt, unimportant, rejected, overwhelmed)',
        placeholder: 'I felt...',
        required: true,
        saveKey: 'feeling',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'What You Did Instead of Asking',
        prompt:
          'What did you do instead of asking directly? (withdrew, became critical, shut down, acted distant, over-explained)',
        placeholder: 'Instead of asking, I...',
        required: true,
        saveKey: 'indirect',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'The Need Beneath the Reaction',
        prompt:
          'If your reaction had a message, what would it be asking for? (reassurance, closeness, validation, attention, safety, respect)',
        placeholder: 'What I really needed was...',
        required: true,
        saveKey: 'need',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'Why It\'s Hard to Ask',
        prompt: 'What feels risky about asking for this need? What are you afraid might happen?',
        placeholder: 'Asking feels risky because...',
        required: true,
        saveKey: 'risk',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Where This Pattern Comes From',
        prompt:
          'When in your life did it feel hard to express this need? How did others respond when you had this need?',
        placeholder: 'In the past...',
        required: true,
        saveKey: 'origin',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Rewriting the Expression',
        prompt:
          'Complete: "When ___ happens, I feel ___, and what I really need is ___."',
        placeholder: 'When ___ happens, I feel ___, and what I really need is ___',
        required: true,
        saveKey: 'rewrite',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'A Small Step Toward Expression',
        prompt: 'What is one small way you could express this need to your partner?',
        placeholder: 'A small step...',
        required: true,
        saveKey: 'small_step',
      },
      {
        id: 'step9',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Unspoken needs often turn into distance. Spoken needs — when expressed safely — create connection.',
        saveKey: null,
      },
    ],
    completionMessage: 'Speak the need today, in the smallest version that feels safe.',
    requiresTherapistGate: false,
  },

  // 7. Transference (How I Experience You vs Who You Actually Are)
  ws_psyd_transference: {
    ...base,
    id: 'ws_psyd_transference',
    title: 'How I Experience You vs Who You Actually Are',
    description: 'Separate your partner\'s actual behavior from past emotional templates.',
    introduction:
      'In close relationships, we sometimes respond not only to our partner — but to who they unconsciously represent from our past.',
    therapistInsight:
      'Classic transference work. The goal is differentiation: who is here in the room now, vs who was here in the past.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'A Triggering Moment',
        prompt: 'Think of a moment when your partner\'s behavior felt particularly strong or upsetting. What did they do?',
        placeholder: 'They...',
        required: true,
        saveKey: 'moment',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'Your Experience of Them',
        prompt: 'In that moment, how did you experience your partner? (critical, distant, controlling, rejecting, dismissive)',
        placeholder: 'They felt...',
        required: true,
        saveKey: 'experience',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Emotional Impact',
        prompt: 'What did that experience bring up in you emotionally?',
        placeholder: 'I felt...',
        required: true,
        saveKey: 'emotion',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Familiar Emotional Pattern',
        prompt: 'When have you felt this way before? Who in your past made you feel something similar?',
        placeholder: 'Familiar from...',
        required: true,
        saveKey: 'past',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'The Internal Template',
        prompt:
          'What kind of person did your partner feel like in that moment? (a critical parent, someone who ignores you, someone who withdraws love)',
        placeholder: 'They felt like...',
        required: true,
        saveKey: 'template',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Reality Check',
        prompt:
          'What did your partner actually do (factually)? Is there a difference between what they did and what it felt like?',
        placeholder: 'Factually: ... Emotionally: ...',
        required: true,
        saveKey: 'reality',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Separating Past from Present',
        prompt: 'How is your partner different from the person this reminded you of?',
        placeholder: 'My partner is different because...',
        required: true,
        saveKey: 'separation',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'A More Grounded Understanding',
        prompt: 'What is a more accurate understanding of your partner in this situation?',
        placeholder: 'A grounded view...',
        required: true,
        saveKey: 'grounded',
      },
      {
        id: 'step9',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'When you separate who your partner is from who they remind you of, you create space for a more authentic and connected relationship.',
        saveKey: null,
      },
    ],
    completionMessage: 'This is deep work. Be gentle with yourself.',
    requiresTherapistGate: true,
  },

  // 8. Repairing After Emotional Injury
  ws_psyd_repair: {
    ...base,
    id: 'ws_psyd_repair',
    title: 'Repairing After Emotional Injury',
    description:
      'A structured repair conversation for after a real emotional hurt.',
    introduction:
      'Disconnection is inevitable — but repair builds trust. True repair is not just "sorry", but understanding the emotional impact and responding to it.',
    therapistInsight:
      'Dual-partner worksheet. Use after a rupture. Move sequentially: understand → accountability → validation → reconnection.',
    isDualPartner: true,
    steps: [
      {
        id: 'step1',
        type: 'information-block',
        title: 'PART 1 — Understanding the Injury (hurt partner)',
        content: 'The hurt partner completes steps 1–4. Move slowly.',
        saveKey: null,
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'What Happened',
        prompt: 'What happened that hurt you?',
        placeholder: 'What hurt was...',
        required: true,
        saveKey: 'what_happened',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Emotional Impact',
        prompt: 'What did you feel in that moment? What did it bring up for you?',
        placeholder: 'It made me feel...',
        required: true,
        saveKey: 'impact',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Deeper Meaning',
        prompt: 'What did this experience mean to you? ("I don\'t matter", "I\'m not safe", "I\'m alone")',
        placeholder: 'It meant...',
        required: true,
        saveKey: 'meaning',
      },
      {
        id: 'step5',
        type: 'information-block',
        title: 'PART 2 — Taking Accountability (other partner)',
        content: 'The other partner completes steps 5–7.',
        saveKey: null,
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Acknowledging Impact',
        prompt: 'How do you think your actions affected your partner?',
        placeholder: 'I can see that I...',
        required: true,
        saveKey: 'acknowledgment',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Owning Your Part',
        prompt: 'What is your responsibility in this situation? (without shifting blame)',
        placeholder: 'My part was...',
        required: true,
        saveKey: 'responsibility',
      },
      {
        id: 'step8',
        type: 'information-block',
        title: 'PART 3 — Emotional Repair',
        content: 'Use these scripts in the conversation.',
        saveKey: null,
      },
      {
        id: 'step9',
        type: 'text-area',
        title: 'Emotional Validation',
        prompt: 'Complete: "It makes sense that you felt ___ because ___."',
        placeholder: 'It makes sense that you felt ___ because ___',
        required: true,
        saveKey: 'validation',
      },
      {
        id: 'step10',
        type: 'text-area',
        title: 'Repair Statement',
        prompt:
          'Complete: "I\'m sorry for ___, and I understand it made you feel ___. That matters to me."',
        placeholder: 'I\'m sorry for ___, and I understand...',
        required: true,
        saveKey: 'repair_statement',
      },
      {
        id: 'step11',
        type: 'text-area',
        title: 'What I Need Now (hurt partner)',
        prompt: 'What do you need to feel better or safer moving forward?',
        placeholder: 'I need...',
        required: true,
        saveKey: 'need_now',
      },
      {
        id: 'step12',
        type: 'text-area',
        title: 'What I\'ll Do Differently (other partner)',
        prompt: 'What will you do differently next time?',
        placeholder: 'Next time, I will...',
        required: true,
        saveKey: 'commitment',
      },
      {
        id: 'step13',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Repair is not about perfection — it is about being willing to understand, take responsibility, and reconnect. Each repair strengthens the relationship.',
        saveKey: null,
      },
    ],
    completionMessage: 'Read this together when both feel ready.',
    requiresTherapistGate: true,
  },

  // 9. What I Feel Toward You That I Don't Say
  ws_psyd_unspoken: {
    ...base,
    id: 'ws_psyd_unspoken',
    title: 'What I Feel Toward You That I Don\'t Say',
    description: 'Bring unspoken emotions into safe awareness.',
    introduction:
      'Some feelings are held back — too vulnerable, too risky, even unacceptable. They still shape the relationship.',
    therapistInsight:
      'Access suppressed affect and emotional ambivalence. Validate that holding two opposite feelings is normal.',
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'The Unspoken Feeling',
        prompt:
          'What do you feel toward your partner that you don\'t usually say out loud? (vulnerable or difficult feelings)',
        placeholder: 'Something I rarely say...',
        required: true,
        saveKey: 'unspoken',
      },
      {
        id: 'step2',
        type: 'multiple-choice',
        title: 'Naming the Emotion',
        prompt: 'Is it:',
        options: [
          { id: 'love', label: 'Love' },
          { id: 'hurt', label: 'Hurt' },
          { id: 'resentment', label: 'Resentment' },
          { id: 'longing', label: 'Longing' },
          { id: 'disappointment', label: 'Disappointment' },
          { id: 'fear', label: 'Fear' },
          { id: 'anger', label: 'Anger' },
          { id: 'admiration', label: 'Admiration' },
        ],
        required: true,
        saveKey: 'emotion_label',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'What Holds You Back',
        prompt:
          'Why don\'t you usually say this? (fear of conflict, fear of rejection, not wanting to hurt them)',
        placeholder: 'I hold back because...',
        required: true,
        saveKey: 'block',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'The Fear Behind Expression',
        prompt: 'What do you imagine might happen if you expressed this feeling?',
        placeholder: 'I imagine...',
        required: true,
        saveKey: 'fear',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'The Meaning of the Feeling',
        prompt: 'What does this feeling say about your experience in the relationship?',
        placeholder: 'It says...',
        required: true,
        saveKey: 'meaning',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Past Connections',
        prompt: 'When else have you felt this way? Does this connect to earlier relationships?',
        placeholder: 'I\'ve felt this before in...',
        required: true,
        saveKey: 'past',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Mixed Feelings',
        prompt: 'Do you feel two opposite things at once? (love and anger, closeness and distance)',
        placeholder: 'I feel both...',
        required: false,
        saveKey: 'mixed',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'A Safe Version of Expression',
        prompt: 'Complete: "Sometimes I feel ___, and it\'s hard for me to say because ___."',
        placeholder: 'Sometimes I feel ___, and it\'s hard to say because ___',
        required: true,
        saveKey: 'safe_expression',
      },
      {
        id: 'step9',
        type: 'text-area',
        title: 'What You Hope For',
        prompt: 'What do you hope your partner would understand or do?',
        placeholder: 'I hope...',
        required: true,
        saveKey: 'hope',
      },
      {
        id: 'step10',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'Unspoken feelings don\'t disappear — they shape the relationship quietly. When brought into awareness, they create the possibility for deeper connection.',
        saveKey: null,
      },
    ],
    completionMessage: 'Consider sharing with your therapist first.',
    requiresTherapistGate: true,
  },

  // 10. Our Relationship Pattern Over Time
  ws_psyd_pattern: {
    ...base,
    id: 'ws_psyd_pattern',
    title: 'Our Relationship Pattern Over Time',
    description: 'A shared formulation of your repeating relationship dynamic.',
    introduction:
      'Relationships are shaped by patterns that repeat over time. Understanding your shared pattern helps you move from reacting to choosing.',
    therapistInsight:
      'High-level case formulation worksheet. Best completed together or after both individually complete it.',
    isDualPartner: true,
    steps: [
      {
        id: 'step1',
        type: 'text-area',
        title: 'A Typical Conflict Cycle',
        prompt: 'Describe a typical conflict between you and your partner.',
        placeholder: 'Our typical conflict looks like...',
        required: true,
        saveKey: 'typical_conflict',
      },
      {
        id: 'step2',
        type: 'text-area',
        title: 'How It Usually Starts',
        prompt: 'What usually triggers the conflict?',
        placeholder: 'It starts when...',
        required: true,
        saveKey: 'trigger',
      },
      {
        id: 'step3',
        type: 'text-area',
        title: 'Your Role in the Pattern',
        prompt: 'How do you typically respond? (pursue, withdraw, criticize, shut down)',
        placeholder: 'I tend to...',
        required: true,
        saveKey: 'your_role',
      },
      {
        id: 'step4',
        type: 'text-area',
        title: 'Your Partner\'s Role',
        prompt: 'How does your partner usually respond?',
        placeholder: 'They tend to...',
        required: true,
        saveKey: 'partner_role',
      },
      {
        id: 'step5',
        type: 'text-area',
        title: 'The Escalation',
        prompt: 'How does the interaction escalate or shut down?',
        placeholder: 'It escalates by...',
        required: true,
        saveKey: 'escalation',
      },
      {
        id: 'step6',
        type: 'text-area',
        title: 'Your Emotional Experience',
        prompt: 'What do you feel during this pattern?',
        placeholder: 'I feel...',
        required: true,
        saveKey: 'your_emotion',
      },
      {
        id: 'step7',
        type: 'text-area',
        title: 'Your Partner\'s Emotional Experience',
        prompt: 'What might your partner be feeling?',
        placeholder: 'They might feel...',
        required: true,
        saveKey: 'partner_emotion',
      },
      {
        id: 'step8',
        type: 'text-area',
        title: 'What This Pattern Represents',
        prompt:
          'What does this pattern seem to be about? (fear of abandonment, need for control, fear of not being valued, fear of closeness)',
        placeholder: 'Beneath it all, this is about...',
        required: true,
        saveKey: 'representation',
      },
      {
        id: 'step9',
        type: 'text-area',
        title: 'Personal History Link',
        prompt: 'How does this pattern connect to your past experiences?',
        placeholder: 'It connects to...',
        required: true,
        saveKey: 'history',
      },
      {
        id: 'step10',
        type: 'text-area',
        title: 'Naming the Pattern Together',
        prompt:
          'If you had to name your relationship pattern, what would you call it? (Pursue-Withdraw, Criticize-Shut Down, Closeness-Distance)',
        placeholder: 'I\'d call ours the ___ pattern',
        required: true,
        saveKey: 'pattern_name',
      },
      {
        id: 'step11',
        type: 'text-area',
        title: 'How You Co-Create It',
        prompt: 'How do both of you contribute to keeping this pattern going?',
        placeholder: 'I contribute by... they contribute by...',
        required: true,
        saveKey: 'co_creation',
      },
      {
        id: 'step12',
        type: 'text-area',
        title: 'Cost of the Pattern',
        prompt: 'What is the emotional cost of staying in this pattern?',
        placeholder: 'The cost is...',
        required: true,
        saveKey: 'cost',
      },
      {
        id: 'step13',
        type: 'text-area',
        title: 'A Different Possibility',
        prompt: 'What would a healthier version of this interaction look like?',
        placeholder: 'A healthier version...',
        required: true,
        saveKey: 'healthier',
      },
      {
        id: 'step14',
        type: 'text-area',
        title: 'One Small Shift',
        prompt: 'What is one small thing you could do differently the next time this pattern begins?',
        placeholder: 'I will...',
        required: true,
        saveKey: 'small_shift',
      },
      {
        id: 'step15',
        type: 'reflection-note',
        title: 'Closing Insight',
        content:
          'When you can see the pattern, you are no longer fully inside it. Awareness allows both partners to step out of automatic reactions and move toward intentional connection.',
        saveKey: null,
      },
    ],
    completionMessage: 'Complete this together, then bring to your therapist.',
    requiresTherapistGate: true,
  },
};
