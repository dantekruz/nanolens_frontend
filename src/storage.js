// storage.js — Chat persistence layer
// Primary:  Supabase (cloud, cross-device)
// Fallback: localStorage (browser-only)
//
// To enable Supabase, set these in your .env or Vercel env vars:
//   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
//   REACT_APP_SUPABASE_ANON_KEY=your-anon-key
//
// If not set, localStorage is used automatically.

const SUPABASE_URL  = process.env.REACT_APP_SUPABASE_URL
const SUPABASE_KEY  = process.env.REACT_APP_SUPABASE_ANON_KEY
const USE_SUPABASE  = !!(SUPABASE_URL && SUPABASE_KEY)
const LS_PREFIX     = 'nanolens_chat_'

// ── Supabase REST helpers ─────────────────────────────────────
// Uses Supabase REST API directly — no SDK needed, zero bundle size

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    ...options,
    headers: {
      apikey:        SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer:        'return=representation',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.message || `Supabase error: ${res.status}`)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : []
}

// ── localStorage helpers ──────────────────────────────────────

function lsKey(namespace) {
  return `${LS_PREFIX}${namespace}`
}

function lsLoad(namespace) {
  try {
    const raw = localStorage.getItem(lsKey(namespace))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function lsSave(namespace, messages) {
  try {
    localStorage.setItem(lsKey(namespace), JSON.stringify(messages))
  } catch {
    console.warn('localStorage quota exceeded')
  }
}

function lsDelete(namespace) {
  localStorage.removeItem(lsKey(namespace))
}

function lsAllNamespaces() {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX))
  return keys.map(k => k.replace(LS_PREFIX, ''))
}

// ════════════════════════════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════════════════════════════

/**
 * Load all messages for a namespace.
 * Returns array of { role, content, mode, timestamp }
 */
export async function loadMessages(namespace) {
  if (!namespace) return []

  if (USE_SUPABASE) {
    try {
      const rows = await sbFetch(
        `/chat_messages?namespace=eq.${encodeURIComponent(namespace)}&order=created_at.asc`
      )
      return rows.map(r => ({
        role:      r.role,
        content:   r.content,
        mode:      r.mode,
        timestamp: r.created_at,
      }))
    } catch (err) {
      console.warn('Supabase load failed, falling back to localStorage:', err.message)
      return lsLoad(namespace)
    }
  }

  return lsLoad(namespace)
}

/**
 * Save a single message.
 * msg = { role, content, mode }
 */
export async function saveMessage(namespace, msg) {
  if (!namespace) return

  if (USE_SUPABASE) {
    try {
      await sbFetch('/chat_messages', {
        method: 'POST',
        body: JSON.stringify({
          namespace,
          role:    msg.role,
          content: msg.content,
          mode:    msg.mode || null,
        }),
      })
      return
    } catch (err) {
      console.warn('Supabase save failed, falling back to localStorage:', err.message)
    }
  }

  // localStorage fallback
  const existing = lsLoad(namespace)
  existing.push({ ...msg, timestamp: new Date().toISOString() })
  lsSave(namespace, existing)
}

/**
 * Delete all messages for a namespace.
 */
export async function deleteMessages(namespace) {
  if (!namespace) return

  if (USE_SUPABASE) {
    try {
      await sbFetch(
        `/chat_messages?namespace=eq.${encodeURIComponent(namespace)}`,
        { method: 'DELETE' }
      )
      return
    } catch (err) {
      console.warn('Supabase delete failed, falling back to localStorage:', err.message)
    }
  }

  lsDelete(namespace)
}

/**
 * Get all namespaces that have stored chats.
 */
export async function getStoredNamespaces() {
  if (USE_SUPABASE) {
    try {
      const rows = await sbFetch(
        '/chat_messages?select=namespace&order=namespace.asc'
      )
      return [...new Set(rows.map(r => r.namespace))]
    } catch (err) {
      console.warn('Supabase namespaces failed, falling back to localStorage:', err.message)
    }
  }

  return lsAllNamespaces()
}

/**
 * Returns which storage engine is active.
 */
export function storageMode() {
  return USE_SUPABASE ? 'supabase' : 'localStorage'
}
