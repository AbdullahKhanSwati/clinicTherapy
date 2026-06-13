// =============================================================================
// Supabase-backed API for the admin (therapist) side of the app.
//
// Style note: Supabase columns are snake_case, the UI screens are camelCase.
// The mappers below convert between the two so screens can stay as-is.
// =============================================================================

import { supabase } from '../lib/supabase';

// -----------------------------------------------------------------------------
// Mappers
// -----------------------------------------------------------------------------

export const mapProfileRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    age: row.age,
    avatar: row.avatar,
    profileColor: row.profile_color,
    accessory: row.accessory || null,
    emotionalFocus: row.emotional_focus || [],
    parentingRelationship: row.parenting_relationship,
    bio: row.bio,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    // populated by enrichment helpers when relevant
    children: [],
    parents: [],
    partnerId: null,
  };
};

const mapPairingRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    partnerAId: row.partner_a_id,
    partnerBId: row.partner_b_id,
    inviteCode: row.invite_code,
    status: row.status,
    pairedAt: row.paired_at,
    disconnectedAt: row.disconnected_at,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
};

const mapWorksheetRow = (row) => {
  if (!row) return null;
  const content = row.content || {};
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    audience: row.audience,
    targetAudience: row.audience,
    programId: row.program_id,
    content,
    // UI shims: older screens expect these fields
    category: content.category || content.type || (row.program_id ? 'program' : 'general'),
    estimatedTime: content.estimatedTime || '5–10 min',
    difficulty: content.difficulty || 'beginner',
    isTemplate: row.is_template,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapAssignmentRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    worksheetId: row.worksheet_id,
    clientId: row.assignee_id,
    assigneeId: row.assignee_id,
    assignedBy: row.assigned_by,
    status: row.status,
    dueDate: row.due_date,
    progress: row.progress,
    notes: row.notes,
    assignedDate: row.created_at,    // UI alias
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapResponseRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    assignmentId: row.assignment_id,
    userId: row.user_id,
    answers: row.answers || {},
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapMoodRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    mood: row.mood,
    score: row.score,
    intensity: row.score,    // UI alias
    note: row.note,
    notes: row.note,         // UI alias
    date: row.entry_date,
    createdAt: row.created_at,
  };
};

const mapJournalRow = (row) => {
  if (!row) return null;
  // Journal entries are stored as a single `body` column. The screen splits
  // them into title + content using the convention "<title>\n\n<body...>".
  // If no blank-line separator exists, treat the whole text as content and
  // derive a short fallback title from the first line.
  const raw = row.body || '';
  const sep = raw.indexOf('\n\n');
  let title;
  let content;
  if (sep > -1 && sep <= 120) {
    title = raw.slice(0, sep).trim();
    content = raw.slice(sep + 2);
  } else {
    title = (raw.split('\n')[0] || '').slice(0, 60).trim() || 'Untitled entry';
    content = raw;
  }
  return {
    id: row.id,
    userId: row.user_id,
    body: row.body,
    content,
    title,
    mood: row.mood,
    emoji: row.mood,
    date: row.entry_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapCheckinRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    pairingId: row.pairing_id,
    mood: row.mood,
    connection: row.connection,
    stress: row.stress,
    need: row.need,
    date: row.entry_date,
    createdAt: row.created_at,
  };
};

const mapRepairRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    pairingId: row.pairing_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    message: row.message,
    response: row.response,
    status: row.status,
    sentAt: row.sent_at,
    acknowledgedAt: row.acknowledged_at,
  };
};

const mapAppreciationRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    pairingId: row.pairing_id,
    fromUserId: row.from_user_id,
    toUserId: row.to_user_id,
    message: row.message,
    text: row.message,    // UI alias
    type: row.type || 'appreciation',
    createdAt: row.created_at,
  };
};

const mapConflictPauseRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    pairingId: row.pairing_id,
    startedBy: row.started_by,
    durationMinutes: row.duration_minutes,
    reason: row.reason,
    returnNote: row.return_note,
    startedAt: row.started_at,
    endedAt: row.ended_at,
  };
};

const mapGoalRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    pairingId: row.pairing_id,
    title: row.title,
    description: row.description,
    progress: row.progress,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapNoteRow = (row) => {
  if (!row) return null;
  // Legacy notes had the category baked into the body as `[CATEGORY]\n...`.
  // Strip it out so the UI sees a clean body and the badge reads the right
  // category whether the row has a real column or a legacy prefix.
  let body = row.body || '';
  let parsedCategory = null;
  const m = body.match(/^\[([A-Z_]+)\]\s*\n?/);
  if (m) {
    parsedCategory = m[1].toLowerCase();
    body = body.slice(m[0].length);
  }
  const category = row.category || parsedCategory || (row.is_private ? 'private' : 'note');
  return {
    id: row.id,
    therapistId: row.therapist_id,
    clientId: row.client_id,
    body,
    content: body,                       // UI alias
    category,
    isPrivate: row.is_private,
    date: row.created_at,                 // UI alias
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapAffirmationRow = (row) => ({
  id: row.id,
  text: row.text,
  body: row.text,
  audience: row.audience,
  targetAudience: row.audience,
  accent: row.accent,
  category: row.category || null,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

const mapCopingToolRow = (row) => ({
  id: row.id,
  title: row.title,
  label: row.title,
  category: row.category,
  description: row.description,
  body: row.description,
  steps: row.steps || [],
  duration: row.duration || null,
  audience: row.audience,
  targetAudience: row.audience,
  accent: row.accent,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

const mapResourceRow = (row) => ({
  id: row.id,
  title: row.title,
  label: row.title,
  type: row.type,
  url: row.url,
  description: row.description,
  body: row.description,
  content: row.content || null,
  category: row.category || null,
  audience: row.audience,
  targetAudience: row.audience,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

const mapDateIdeaRow = (row) => ({
  id: row.id,
  title: row.title,
  label: row.title,
  description: row.description,
  body: row.description,
  category: row.category,
  createdBy: row.created_by,
  createdAt: row.created_at,
});

// -----------------------------------------------------------------------------
// USERS / PROFILES
// -----------------------------------------------------------------------------

export const getCurrentUserId = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
};

export const getCurrentProfile = async () => {
  const id = await getCurrentUserId();
  if (!id) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
  if (error) {
    console.log('[api] getCurrentProfile', error.message);
    return null;
  }
  return mapProfileRow(data);
};

export const getProfileById = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.log('[api] getProfileById', error.message);
    return null;
  }
  return mapProfileRow(data);
};

export const listAllProfiles = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listAllProfiles', error.message);
    return [];
  }
  const profiles = (data || []).map(mapProfileRow);
  await enrichProfilesWithLinks(profiles);
  return profiles;
};

export const listProfilesByRole = async (role) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listProfilesByRole', error.message);
    return [];
  }
  const profiles = (data || []).map(mapProfileRow);
  await enrichProfilesWithLinks(profiles);
  return profiles;
};

export const listProfilesByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);
  if (error) {
    console.log('[api] listProfilesByIds', error.message);
    return [];
  }
  return (data || []).map(mapProfileRow);
};

export const updateProfile = async (userId, patch) => {
  const dbPatch = {};
  if ('name' in patch) dbPatch.name = patch.name;
  if ('age' in patch) dbPatch.age = patch.age;
  if ('avatar' in patch) dbPatch.avatar = patch.avatar;
  if ('profileColor' in patch) dbPatch.profile_color = patch.profileColor;
  if ('accessory' in patch) dbPatch.accessory = patch.accessory;
  if ('emotionalFocus' in patch) dbPatch.emotional_focus = patch.emotionalFocus;
  if ('parentingRelationship' in patch) dbPatch.parenting_relationship = patch.parentingRelationship;
  if ('bio' in patch) dbPatch.bio = patch.bio;
  if ('role' in patch) dbPatch.role = patch.role;

  const { data, error } = await supabase
    .from('profiles')
    .update(dbPatch)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return mapProfileRow(data);
};

// Populate .children and .parents and .partnerId on each profile, using one
// batched query per relation so it's still cheap.
const enrichProfilesWithLinks = async (profiles) => {
  if (!profiles?.length) return;
  const ids = profiles.map((p) => p.id);

  const [{ data: links }, { data: pairings }] = await Promise.all([
    supabase.from('parent_child_links').select('parent_id, child_id'),
    supabase
      .from('couple_pairings')
      .select('partner_a_id, partner_b_id, status')
      .eq('status', 'active'),
  ]);

  const childrenByParent = new Map();
  const parentsByChild = new Map();
  (links || []).forEach((l) => {
    if (ids.includes(l.parent_id)) {
      const arr = childrenByParent.get(l.parent_id) || [];
      arr.push(l.child_id);
      childrenByParent.set(l.parent_id, arr);
    }
    if (ids.includes(l.child_id)) {
      const arr = parentsByChild.get(l.child_id) || [];
      arr.push(l.parent_id);
      parentsByChild.set(l.child_id, arr);
    }
  });

  const partnerByUser = new Map();
  (pairings || []).forEach((p) => {
    if (ids.includes(p.partner_a_id) && p.partner_b_id) {
      partnerByUser.set(p.partner_a_id, p.partner_b_id);
    }
    if (ids.includes(p.partner_b_id) && p.partner_a_id) {
      partnerByUser.set(p.partner_b_id, p.partner_a_id);
    }
  });

  profiles.forEach((p) => {
    p.children = childrenByParent.get(p.id) || [];
    p.parents = parentsByChild.get(p.id) || [];
    p.partnerId = partnerByUser.get(p.id) || null;
  });
};

// -----------------------------------------------------------------------------
// PARENT–CHILD LINKS
// -----------------------------------------------------------------------------

export const listParentChildLinks = async () => {
  const { data, error } = await supabase
    .from('parent_child_links')
    .select('id, parent_id, child_id, created_at');
  if (error) {
    console.log('[api] listParentChildLinks', error.message);
    return [];
  }
  return (data || []).map((l) => ({
    id: l.id,
    parentId: l.parent_id,
    childId: l.child_id,
    createdAt: l.created_at,
  }));
};

export const setParentsForChild = async (childId, parentIds) => {
  // Replace the child's parent links to exactly the given parentIds.
  const { error: delErr } = await supabase
    .from('parent_child_links')
    .delete()
    .eq('child_id', childId);
  if (delErr) throw delErr;

  if (!parentIds?.length) return [];
  const rows = parentIds.map((pid) => ({ parent_id: pid, child_id: childId }));
  const { data, error } = await supabase
    .from('parent_child_links')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
};

export const setChildrenForParent = async (parentId, childIds) => {
  const { error: delErr } = await supabase
    .from('parent_child_links')
    .delete()
    .eq('parent_id', parentId);
  if (delErr) throw delErr;

  if (!childIds?.length) return [];
  const rows = childIds.map((cid) => ({ parent_id: parentId, child_id: cid }));
  const { data, error } = await supabase
    .from('parent_child_links')
    .insert(rows)
    .select();
  if (error) throw error;
  return data;
};

// -----------------------------------------------------------------------------
// PARENT — convenience reads for the family panel
//
// `listChildIdsForParent` is the canonical "who are my kids" lookup.
// `getChildrenForParent` returns fully-mapped profile rows for those kids.
// -----------------------------------------------------------------------------

export const listChildIdsForParent = async (parentId) => {
  if (!parentId) return [];
  const { data, error } = await supabase
    .from('parent_child_links')
    .select('child_id')
    .eq('parent_id', parentId);
  if (error) {
    console.log('[api] listChildIdsForParent', error.message);
    return [];
  }
  return (data || []).map((r) => r.child_id);
};

export const getChildrenForParent = async (parentId) => {
  const ids = await listChildIdsForParent(parentId);
  if (ids.length === 0) return [];
  return listProfilesByIds(ids);
};

// Notes about ANY of the parent's children that the parent is allowed to
// see (RLS already covers this via is_parent_of — we still fetch only the
// relevant client_ids to keep the query tight).
export const listNotesForParentChildren = async (parentId) => {
  const ids = await listChildIdsForParent(parentId);
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('therapist_notes')
    .select('*')
    .in('client_id', ids)
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listNotesForParentChildren', error.message);
    return [];
  }
  return (data || []).map(mapNoteRow);
};

// -----------------------------------------------------------------------------
// THERAPIST-CLIENT LINKS
// -----------------------------------------------------------------------------

export const listTherapistClients = async (therapistId) => {
  const { data, error } = await supabase
    .from('therapist_clients')
    .select('client_id')
    .eq('therapist_id', therapistId);
  if (error) {
    console.log('[api] listTherapistClients', error.message);
    return [];
  }
  return (data || []).map((r) => r.client_id);
};

export const assignClientToTherapist = async (therapistId, clientId) => {
  const { error } = await supabase
    .from('therapist_clients')
    .insert({ therapist_id: therapistId, client_id: clientId });
  if (error && !/duplicate key/i.test(error.message)) throw error;
};

export const removeClientFromTherapist = async (therapistId, clientId) => {
  const { error } = await supabase
    .from('therapist_clients')
    .delete()
    .eq('therapist_id', therapistId)
    .eq('client_id', clientId);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// COUPLE PAIRINGS
// -----------------------------------------------------------------------------

export const listCouplePairings = async () => {
  const { data, error } = await supabase
    .from('couple_pairings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listCouplePairings', error.message);
    return [];
  }
  return (data || []).map(mapPairingRow);
};

export const createPairing = async ({ partnerAId, partnerBId }) => {
  const { data, error } = await supabase
    .from('couple_pairings')
    .insert({
      partner_a_id: partnerAId,
      partner_b_id: partnerBId,
      status: 'active',
      paired_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return mapPairingRow(data);
};

export const disconnectPairing = async (pairingId) => {
  const { error } = await supabase
    .from('couple_pairings')
    .update({
      status: 'disconnected',
      disconnected_at: new Date().toISOString(),
    })
    .eq('id', pairingId);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// PARTNER CHECK-INS / REPAIRS / APPRECIATIONS / GOALS
// -----------------------------------------------------------------------------

export const listPartnerCheckins = async () => {
  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapCheckinRow);
};

export const listRepairRequests = async () => {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*')
    .order('sent_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapRepairRow);
};

export const listAppreciations = async () => {
  const { data, error } = await supabase
    .from('appreciations')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapAppreciationRow);
};

export const listSharedGoals = async (pairingId) => {
  let q = supabase
    .from('shared_goals')
    .select('*')
    .order('created_at', { ascending: false });
  if (pairingId) q = q.eq('pairing_id', pairingId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapGoalRow);
};

export const upsertSharedGoal = async (goal) => {
  const row = {
    pairing_id: goal.pairingId,
    title: goal.title,
    description: goal.description,
    progress: goal.progress ?? 0,
    completed_at: goal.completedAt || null,
  };
  if (goal.id) {
    const { data, error } = await supabase
      .from('shared_goals')
      .update(row)
      .eq('id', goal.id)
      .select()
      .single();
    if (error) throw error;
    return mapGoalRow(data);
  }
  const { data, error } = await supabase
    .from('shared_goals')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapGoalRow(data);
};

export const deleteSharedGoal = async (goalId) => {
  const { error } = await supabase
    .from('shared_goals')
    .delete()
    .eq('id', goalId);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// COUPLES — convenience helpers for the client side
//
// Pairing itself is clinician-managed (see AdminPairCoupleScreen). The
// helpers below let an authenticated partner read/write everything that
// belongs *inside* their active pairing — check-ins, repair requests,
// appreciations, conflict pauses.
// -----------------------------------------------------------------------------

// Returns the user's active pairing (or null). Pending pairings — invites
// created by an admin where partner_b hasn't been filled in yet — are
// skipped: the UI treats those as "not paired yet".
export const getActivePairingForUser = async (userId) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from('couple_pairings')
    .select('*')
    .or(`partner_a_id.eq.${userId},partner_b_id.eq.${userId}`)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error) {
    console.log('[api] getActivePairingForUser', error.message);
    return null;
  }
  return (data && data[0]) ? mapPairingRow(data[0]) : null;
};

// Returns the partner-id for `userId` from their active pairing, or null.
export const getPartnerIdForUser = async (userId) => {
  const p = await getActivePairingForUser(userId);
  if (!p) return null;
  return p.partnerAId === userId ? p.partnerBId : p.partnerAId;
};

// Returns the partner profile row (full profile, ready to render).
export const getPartnerProfileForUser = async (userId) => {
  const partnerId = await getPartnerIdForUser(userId);
  if (!partnerId) return null;
  return getProfileById(partnerId);
};

// -----------------------------------------------------------------------------
// PARTNER CHECK-INS (couples daily pulse)
// -----------------------------------------------------------------------------

export const listPartnerCheckinsForUser = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('partner_checkins')
    .select('*')
    .eq('user_id', userId)
    .order('entry_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listPartnerCheckinsForUser', error.message);
    return [];
  }
  return (data || []).map(mapCheckinRow);
};

export const getLatestPartnerCheckinForUser = async (userId) => {
  if (!userId) return null;
  const rows = await listPartnerCheckinsForUser(userId);
  return rows[0] || null;
};

// Insert a new daily check-in for the signed-in partner. `pairingId` is
// optional — if omitted we look it up so the row is correctly linked.
export const createPartnerCheckin = async ({
  userId,
  pairingId,
  mood,
  connection,
  stress,
  need,
}) => {
  let pid = pairingId;
  if (!pid) {
    const p = await getActivePairingForUser(userId);
    pid = p?.id || null;
  }
  const { data, error } = await supabase
    .from('partner_checkins')
    .insert({
      user_id: userId,
      pairing_id: pid,
      mood: mood ?? null,
      connection: connection ?? null,
      stress: stress ?? null,
      need: need || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapCheckinRow(data);
};

// -----------------------------------------------------------------------------
// REPAIR REQUESTS — send / list / respond
// -----------------------------------------------------------------------------

// Returns every repair request involving `userId` (both directions).
export const listRepairRequestsForUser = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('sent_at', { ascending: false });
  if (error) {
    console.log('[api] listRepairRequestsForUser', error.message);
    return [];
  }
  return (data || []).map(mapRepairRow);
};

// Send a fresh repair request. Auto-resolves `pairingId` if omitted.
export const sendRepairRequest = async ({
  pairingId,
  fromUserId,
  toUserId,
  message,
}) => {
  let pid = pairingId;
  if (!pid) {
    const p = await getActivePairingForUser(fromUserId);
    pid = p?.id || null;
  }
  if (!pid) throw new Error('No active pairing — link your partner first.');
  const { data, error } = await supabase
    .from('repair_requests')
    .insert({
      pairing_id: pid,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      message,
      status: 'sent',
    })
    .select()
    .single();
  if (error) throw error;
  return mapRepairRow(data);
};

// Respond to / acknowledge a repair request the user received.
export const respondToRepairRequest = async (id, { response, status }) => {
  const row = {};
  if (response !== undefined) row.response = response;
  if (status !== undefined) row.status = status;
  if (status === 'acknowledged' || status === 'resolved') {
    row.acknowledged_at = new Date().toISOString();
  }
  const { data, error } = await supabase
    .from('repair_requests')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapRepairRow(data);
};

// -----------------------------------------------------------------------------
// APPRECIATIONS — send / list
// -----------------------------------------------------------------------------

export const listAppreciationsForUser = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('appreciations')
    .select('*')
    .or(`from_user_id.eq.${userId},to_user_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) {
    console.log('[api] listAppreciationsForUser', error.message);
    return [];
  }
  return (data || []).map(mapAppreciationRow);
};

export const sendAppreciation = async ({
  pairingId,
  fromUserId,
  toUserId,
  message,
  type,
}) => {
  let pid = pairingId;
  if (!pid) {
    const p = await getActivePairingForUser(fromUserId);
    pid = p?.id || null;
  }
  if (!pid) throw new Error('No active pairing — link your partner first.');
  const { data, error } = await supabase
    .from('appreciations')
    .insert({
      pairing_id: pid,
      from_user_id: fromUserId,
      to_user_id: toUserId,
      message,
      type: type || 'appreciation',
    })
    .select()
    .single();
  if (error) throw error;
  return mapAppreciationRow(data);
};

// -----------------------------------------------------------------------------
// CONFLICT PAUSES — start / complete / list
// -----------------------------------------------------------------------------

export const listConflictPausesForUser = async (userId) => {
  if (!userId) return [];
  const p = await getActivePairingForUser(userId);
  if (!p) return [];
  const { data, error } = await supabase
    .from('conflict_pauses')
    .select('*')
    .eq('pairing_id', p.id)
    .order('started_at', { ascending: false });
  if (error) {
    console.log('[api] listConflictPausesForUser', error.message);
    return [];
  }
  return (data || []).map(mapConflictPauseRow);
};

export const startConflictPause = async ({
  startedBy,
  durationMinutes,
  pairingId,
  reason,
}) => {
  let pid = pairingId;
  if (!pid) {
    const p = await getActivePairingForUser(startedBy);
    pid = p?.id || null;
  }
  if (!pid) throw new Error('No active pairing — link your partner first.');
  const { data, error } = await supabase
    .from('conflict_pauses')
    .insert({
      pairing_id: pid,
      started_by: startedBy,
      duration_minutes: durationMinutes || 20,
      reason: reason || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapConflictPauseRow(data);
};

export const completeConflictPause = async (id, returnNote) => {
  const { data, error } = await supabase
    .from('conflict_pauses')
    .update({
      ended_at: new Date().toISOString(),
      return_note: returnNote || null,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapConflictPauseRow(data);
};

// -----------------------------------------------------------------------------
// WORKSHEETS, ASSIGNMENTS, RESPONSES
// -----------------------------------------------------------------------------

export const listWorksheets = async ({ audience, programId } = {}) => {
  let q = supabase.from('worksheets').select('*').order('created_at', { ascending: false });
  if (audience) q = q.eq('audience', audience);
  if (programId) q = q.eq('program_id', programId);
  const { data, error } = await q;
  if (error) {
    console.log('[api] listWorksheets', error.message);
    return [];
  }
  return (data || []).map(mapWorksheetRow);
};

export const getWorksheetById = async (id) => {
  const { data, error } = await supabase
    .from('worksheets')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return mapWorksheetRow(data);
};

export const createWorksheet = async ({
  title,
  description,
  audience,
  programId,
  content,
  createdBy,
}) => {
  const { data, error } = await supabase
    .from('worksheets')
    .insert({
      title,
      description,
      audience: audience || 'all',
      program_id: programId || null,
      content: content || {},
      is_template: true,
      created_by: createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapWorksheetRow(data);
};

export const updateWorksheet = async (id, patch) => {
  const row = {};
  if ('title' in patch) row.title = patch.title;
  if ('description' in patch) row.description = patch.description;
  if ('audience' in patch) row.audience = patch.audience;
  if ('programId' in patch) row.program_id = patch.programId;
  if ('content' in patch) row.content = patch.content;
  const { data, error } = await supabase
    .from('worksheets')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapWorksheetRow(data);
};

export const deleteWorksheet = async (id) => {
  const { error } = await supabase.from('worksheets').delete().eq('id', id);
  if (error) throw error;
};

// Assignments
export const listAssignments = async () => {
  const { data, error } = await supabase
    .from('worksheet_assignments')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapAssignmentRow);
};

export const listAssignmentsFor = async (assigneeId) => {
  const { data, error } = await supabase
    .from('worksheet_assignments')
    .select('*')
    .eq('assignee_id', assigneeId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapAssignmentRow);
};

export const getAssignmentById = async (id) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from('worksheet_assignments')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) {
    console.log('[api] getAssignmentById', error.message);
    return null;
  }
  return mapAssignmentRow(data);
};

export const assignWorksheet = async ({
  worksheetId,
  assigneeId,
  assignedBy,
  dueDate,
  notes,
}) => {
  const { data, error } = await supabase
    .from('worksheet_assignments')
    .insert({
      worksheet_id: worksheetId,
      assignee_id: assigneeId,
      assigned_by: assignedBy || null,
      due_date: dueDate || null,
      notes: notes || null,
      status: 'not_started',
    })
    .select()
    .single();
  if (error) throw error;
  return mapAssignmentRow(data);
};

export const updateAssignment = async (id, patch) => {
  const row = {};
  if ('status' in patch) row.status = patch.status;
  if ('progress' in patch) row.progress = patch.progress;
  if ('dueDate' in patch) row.due_date = patch.dueDate;
  if ('notes' in patch) row.notes = patch.notes;
  const { data, error } = await supabase
    .from('worksheet_assignments')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapAssignmentRow(data);
};

export const deleteAssignment = async (id) => {
  const { error } = await supabase
    .from('worksheet_assignments')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

// Responses
export const listResponsesFor = async (assigneeId) => {
  const { data, error } = await supabase
    .from('worksheet_responses')
    .select('*')
    .eq('user_id', assigneeId);
  if (error) return [];
  return (data || []).map(mapResponseRow);
};

// -----------------------------------------------------------------------------
// MOOD ENTRIES + JOURNAL
// -----------------------------------------------------------------------------

export const listMoodEntries = async (userId) => {
  let q = supabase
    .from('mood_entries')
    .select('*')
    .order('entry_date', { ascending: false });
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapMoodRow);
};

export const listAllMoodEntries = async () => listMoodEntries(null);

export const createMoodEntry = async ({ userId, mood, score, note, date }) => {
  const row = {
    user_id: userId,
    mood,
    score: score ?? null,
    note: note || null,
  };
  if (date) row.entry_date = date;
  const { data, error } = await supabase
    .from('mood_entries')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapMoodRow(data);
};

export const deleteMoodEntry = async (id) => {
  const { error } = await supabase.from('mood_entries').delete().eq('id', id);
  if (error) throw error;
};

export const listJournalEntries = async (userId) => {
  let q = supabase
    .from('journal_entries')
    .select('*')
    .order('entry_date', { ascending: false });
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapJournalRow);
};

export const getJournalEntry = async (id) => {
  if (!id) return null;
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return null;
  return mapJournalRow(data);
};

export const createJournalEntry = async ({ userId, body, mood, date }) => {
  const row = {
    user_id: userId,
    body,
    mood: mood || null,
  };
  if (date) row.entry_date = date;
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return mapJournalRow(data);
};

export const updateJournalEntry = async (id, patch) => {
  const row = {};
  if ('body' in patch) row.body = patch.body;
  if ('mood' in patch) row.mood = patch.mood;
  if ('date' in patch) row.entry_date = patch.date;
  const { data, error } = await supabase
    .from('journal_entries')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapJournalRow(data);
};

export const deleteJournalEntry = async (id) => {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// "Current user" convenience wrappers — used everywhere on the client side
// -----------------------------------------------------------------------------

export const listMyAssignments = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listAssignmentsFor(id);
};

export const listMyMoodEntries = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listMoodEntries(id);
};

export const listMyJournalEntries = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listJournalEntries(id);
};

export const listMyClientResources = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listClientResources(id);
};

// -----------------------------------------------------------------------------
// Worksheet response — write the response row + update the assignment.
//
// `completed=true`  → set completed_at + flip assignment to status='completed',
//                     progress=100. This is the final submit.
// `completed=false` → save as draft, leave completed_at NULL, set assignment
//                     status='in_progress' and persist the in-progress %.
// `progress`        → optional integer 0–100. If omitted, computed from answers
//                     vs. expected step count by the caller (or defaults to 0).
// -----------------------------------------------------------------------------

export const saveWorksheetResponse = async ({
  assignmentId,
  userId,
  answers,
  completed = true,
  progress,
}) => {
  const now = new Date().toISOString();

  // 1. Upsert the response row. Drafts have completed_at = null.
  const { data: existing } = await supabase
    .from('worksheet_responses')
    .select('id, completed_at')
    .eq('assignment_id', assignmentId)
    .eq('user_id', userId)
    .maybeSingle();

  const responseRow = {
    answers,
    completed_at: completed ? now : null,
  };

  let saved;
  if (existing?.id) {
    const { data, error } = await supabase
      .from('worksheet_responses')
      .update(responseRow)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) throw error;
    saved = data;
  } else {
    const { data, error } = await supabase
      .from('worksheet_responses')
      .insert({
        assignment_id: assignmentId,
        user_id: userId,
        ...responseRow,
      })
      .select()
      .single();
    if (error) throw error;
    saved = data;
  }

  // 2. Update the parent assignment.
  const newStatus = completed ? 'completed' : 'in_progress';
  const newProgress = completed
    ? 100
    : Math.max(0, Math.min(100, Math.round(progress ?? 0)));

  await supabase
    .from('worksheet_assignments')
    .update({ status: newStatus, progress: newProgress })
    .eq('id', assignmentId);

  return mapResponseRow(saved);
};

// Fetch any existing response row (draft or completed) for one assignment.
// Used to resume a partially-completed worksheet from the same step the user
// left off on.
export const getResponseForAssignment = async (assignmentId) => {
  if (!assignmentId) return null;
  const { data, error } = await supabase
    .from('worksheet_responses')
    .select('*')
    .eq('assignment_id', assignmentId)
    .maybeSingle();
  if (error) {
    console.log('[api] getResponseForAssignment', error.message);
    return null;
  }
  return mapResponseRow(data);
};

// -----------------------------------------------------------------------------
// NOTIFICATIONS
// -----------------------------------------------------------------------------

const mapNotificationRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  type: row.type,
  title: row.title,
  body: row.body,
  meta: row.meta || {},
  readAt: row.read_at,
  date: row.created_at,
  createdAt: row.created_at,
});

export const listNotifications = async (userId) => {
  let q = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapNotificationRow);
};

export const listMyNotifications = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listNotifications(id);
};

export const markNotificationRead = async (id) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
};

export const markAllNotificationsRead = async (userId) => {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null)
    .eq('user_id', userId);
  if (error) throw error;
};

export const createNotification = async ({ userId, type, title, body, meta }) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type: type || 'system',
      title,
      body: body || null,
      meta: meta || {},
    })
    .select()
    .single();
  if (error) throw error;
  return mapNotificationRow(data);
};

// -----------------------------------------------------------------------------
// BADGES
// -----------------------------------------------------------------------------

const mapBadgeRow = (row) => ({
  id: row.id,
  userId: row.user_id,
  badgeId: row.badge_id,
  earnedAt: row.earned_at,
});

export const listBadges = async (userId) => {
  let q = supabase
    .from('badges')
    .select('*')
    .order('earned_at', { ascending: false });
  if (userId) q = q.eq('user_id', userId);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapBadgeRow);
};

export const listMyBadges = async () => {
  const id = await getCurrentUserId();
  if (!id) return [];
  return listBadges(id);
};

export const awardBadge = async ({ userId, badgeId }) => {
  const { data, error } = await supabase
    .from('badges')
    .insert({ user_id: userId, badge_id: badgeId })
    .select()
    .single();
  if (error && !/duplicate key/i.test(error.message)) throw error;
  return data ? mapBadgeRow(data) : null;
};

// -----------------------------------------------------------------------------
// THERAPIST NOTES
// -----------------------------------------------------------------------------

export const listNotesForClient = async (clientId) => {
  const { data, error } = await supabase
    .from('therapist_notes')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapNoteRow);
};

export const listAllNotes = async () => {
  const { data, error } = await supabase
    .from('therapist_notes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapNoteRow);
};

export const createNote = async ({ therapistId, clientId, body, isPrivate, category }) => {
  const { data, error } = await supabase
    .from('therapist_notes')
    .insert({
      therapist_id: therapistId,
      client_id: clientId,
      body,
      is_private: !!isPrivate,
      category: category || 'note',
    })
    .select()
    .single();
  if (error) throw error;
  return mapNoteRow(data);
};

export const updateNote = async (id, patch) => {
  const row = {};
  if ('body' in patch) row.body = patch.body;
  if ('isPrivate' in patch) row.is_private = patch.isPrivate;
  const { data, error } = await supabase
    .from('therapist_notes')
    .update(row)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapNoteRow(data);
};

export const deleteNote = async (id) => {
  const { error } = await supabase.from('therapist_notes').delete().eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// CONTENT LIBRARY — affirmations / coping_tools / resources / date_ideas
// -----------------------------------------------------------------------------

// Affirmations
export const listAffirmations = async (audience) => {
  let q = supabase.from('affirmations').select('*').order('created_at', { ascending: false });
  if (audience) q = q.eq('audience', audience);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapAffirmationRow);
};

export const createAffirmation = async ({ text, audience, accent, category, createdBy }) => {
  const { data, error } = await supabase
    .from('affirmations')
    .insert({
      text,
      audience: audience || 'all',
      accent,
      category: category || null,
      created_by: createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapAffirmationRow(data);
};

export const updateAffirmation = async (id, patch) => {
  const row = {};
  if ('text' in patch) row.text = patch.text;
  if ('audience' in patch) row.audience = patch.audience;
  if ('accent' in patch) row.accent = patch.accent;
  const { data, error } = await supabase
    .from('affirmations').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapAffirmationRow(data);
};

export const deleteAffirmation = async (id) => {
  const { error } = await supabase.from('affirmations').delete().eq('id', id);
  if (error) throw error;
};

// Coping tools
export const listCopingTools = async (audience) => {
  let q = supabase.from('coping_tools').select('*').order('created_at', { ascending: false });
  if (audience) q = q.eq('audience', audience);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapCopingToolRow);
};

export const createCopingTool = async (input) => {
  const row = {
    title: input.title,
    category: input.category || null,
    description: input.description || null,
    steps: input.steps || [],
    duration: input.duration || null,
    audience: input.audience || 'all',
    accent: input.accent || null,
    created_by: input.createdBy || null,
  };
  const { data, error } = await supabase.from('coping_tools').insert(row).select().single();
  if (error) throw error;
  return mapCopingToolRow(data);
};

export const updateCopingTool = async (id, patch) => {
  const row = {};
  if ('title' in patch) row.title = patch.title;
  if ('category' in patch) row.category = patch.category;
  if ('description' in patch) row.description = patch.description;
  if ('steps' in patch) row.steps = patch.steps;
  if ('audience' in patch) row.audience = patch.audience;
  if ('accent' in patch) row.accent = patch.accent;
  const { data, error } = await supabase
    .from('coping_tools').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapCopingToolRow(data);
};

export const deleteCopingTool = async (id) => {
  const { error } = await supabase.from('coping_tools').delete().eq('id', id);
  if (error) throw error;
};

// Resources
export const listResources = async (audience) => {
  let q = supabase.from('resources').select('*').order('created_at', { ascending: false });
  if (audience) q = q.eq('audience', audience);
  const { data, error } = await q;
  if (error) return [];
  return (data || []).map(mapResourceRow);
};

export const createResource = async (input) => {
  const row = {
    title: input.title,
    type: input.type || null,
    url: input.url || null,
    description: input.description || null,
    content: input.content || null,
    category: input.category || null,
    audience: input.audience || 'all',
    created_by: input.createdBy || null,
  };
  const { data, error } = await supabase.from('resources').insert(row).select().single();
  if (error) throw error;
  return mapResourceRow(data);
};

export const updateResource = async (id, patch) => {
  const row = {};
  if ('title' in patch) row.title = patch.title;
  if ('type' in patch) row.type = patch.type;
  if ('url' in patch) row.url = patch.url;
  if ('description' in patch) row.description = patch.description;
  if ('audience' in patch) row.audience = patch.audience;
  const { data, error } = await supabase
    .from('resources').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapResourceRow(data);
};

export const deleteResource = async (id) => {
  const { error } = await supabase.from('resources').delete().eq('id', id);
  if (error) throw error;
};

// -----------------------------------------------------------------------------
// CLIENT RESOURCES — per-client resource assignments with a personal note
// -----------------------------------------------------------------------------

const mapClientResourceRow = (row) => ({
  id: row.id,
  clientId: row.client_id,
  resourceId: row.resource_id,
  assignedBy: row.assigned_by,
  note: row.note,
  assignedAt: row.assigned_at,
});

export const listClientResources = async (clientId) => {
  let q = supabase.from('client_resources').select('*').order('assigned_at', { ascending: false });
  if (clientId) q = q.eq('client_id', clientId);
  const { data, error } = await q;
  if (error) {
    console.log('[api] listClientResources', error.message);
    return [];
  }
  return (data || []).map(mapClientResourceRow);
};

export const assignClientResource = async ({ clientId, resourceId, assignedBy, note }) => {
  const { data, error } = await supabase
    .from('client_resources')
    .insert({
      client_id: clientId,
      resource_id: resourceId,
      assigned_by: assignedBy || null,
      note: note || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapClientResourceRow(data);
};

export const removeClientResource = async (id) => {
  const { error } = await supabase.from('client_resources').delete().eq('id', id);
  if (error) throw error;
};

// Date ideas
export const listDateIdeas = async () => {
  const { data, error } = await supabase
    .from('date_ideas').select('*').order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapDateIdeaRow);
};

export const createDateIdea = async (input) => {
  const { data, error } = await supabase
    .from('date_ideas')
    .insert({
      title: input.title,
      description: input.description || null,
      category: input.category || null,
      created_by: input.createdBy || null,
    })
    .select()
    .single();
  if (error) throw error;
  return mapDateIdeaRow(data);
};

export const updateDateIdea = async (id, patch) => {
  const row = {};
  if ('title' in patch) row.title = patch.title;
  if ('description' in patch) row.description = patch.description;
  if ('category' in patch) row.category = patch.category;
  const { data, error } = await supabase
    .from('date_ideas').update(row).eq('id', id).select().single();
  if (error) throw error;
  return mapDateIdeaRow(data);
};

export const deleteDateIdea = async (id) => {
  const { error } = await supabase.from('date_ideas').delete().eq('id', id);
  if (error) throw error;
};
