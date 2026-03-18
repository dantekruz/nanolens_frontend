// api.js — NanoLens backend service
const BASE_URL = "https://nanolens.onrender.com"
const TIMEOUT_MS = 180000 // 3 minutes — handles Render cold starts

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, { ...options, signal: controller.signal })
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }))
      throw new Error(err.detail || `Request failed: ${res.status}`)
    }
    return res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — backend may be waking up, please try again in 30 seconds')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchNamespaces() {
  const data = await apiFetch("/api/namespaces")
  return data.namespaces
}

export async function uploadFile({ file, namespace, onProgress }) {
  onProgress(10, "Sending file to backend…")
  const formData = new FormData()
  formData.append("file", file)
  formData.append("namespace", namespace)
  onProgress(30, "Extracting text and tables…")
  let result
  try {
    result = await apiFetch("/api/upload", { method: "POST", body: formData })
  } catch (err) {
    onProgress(100, "❌ " + err.message)
    throw err
  }
  onProgress(70, "Generating embeddings…")
  await new Promise(r => setTimeout(r, 300))
  onProgress(90, "Storing in Pinecone…")
  await new Promise(r => setTimeout(r, 200))
  onProgress(100, `✅ Indexed ${result.chunks} chunks into "${result.namespace}"`)
  return result
}

export async function sendChatMessage({ question, namespace, history }) {
  return apiFetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, namespace, history }),
  })
}

export async function deleteChat(namespace) {
  return apiFetch(`/api/delete-chat/${encodeURIComponent(namespace)}`, { method: "DELETE" })
}

// ════════════════════════════════════════════════════════
// DELETE PAPER — removes vectors from Pinecone + SQLite
// ════════════════════════════════════════════════════════
export async function deletePaper(namespace) {
  return apiFetch(`/api/delete-paper/${encodeURIComponent(namespace)}`, {
    method: 'DELETE',
  })
}
