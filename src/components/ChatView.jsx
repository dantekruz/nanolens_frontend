import React, { useState, useRef, useEffect } from 'react'
import { sendChatMessage, deleteChat } from '../api'
import { loadMessages, saveMessage, deleteMessages, storageMode } from '../storage'

const SUGGESTIONS = [
  'Droplet size & PDI results?',
  'Zeta potential & stability findings?',
  'Optimized formulation composition?',
  'Encapsulation efficiency (EE%)?',
  'What preparation method was used?',
  'Describe the in-vitro release profile.',
]

function DeleteModal({ namespace, onConfirm, onCancel, deleting }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-icon">🗑️</div>
        <h2 className="modal-title">Delete Chat History</h2>
        <p className="modal-body">
          Permanently delete all messages for <strong>"{namespace}"</strong>.<br /><br />
          Pinecone vectors are <em>kept</em> — the paper stays indexed.
        </p>
        <div className="modal-actions">
          <button className="modal-btn-cancel" onClick={onCancel} disabled={deleting}>Cancel</button>
          <button className="modal-btn-delete" onClick={onConfirm} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Message({ role, content, mode, timestamp }) {
  return (
    <div className={`message ${role}`}>
      <div className="message-avatar">{role === 'user' ? '👤' : '🤖'}</div>
      <div className="message-body">
        <div className="message-text">{content}</div>
        <div className="message-meta">
          {mode && mode !== 'error' && <span>Mode: {mode}</span>}
          {timestamp && <span style={{marginLeft: 8}}>{new Date(timestamp).toLocaleTimeString()}</span>}
        </div>
      </div>
    </div>
  )
}

function TypingBubble() {
  return (
    <div className="message bot">
      <div className="message-avatar">🤖</div>
      <div className="message-body">
        <div className="typing-bubble"><span/><span/><span/></div>
      </div>
    </div>
  )
}

export default function ChatView({ papers, activePaper, onSelectPaper, onToast }) {
  const [messages,   setMessages]   = useState([])
  const [input,      setInput]      = useState('')
  const [typing,     setTyping]     = useState(false)
  const [history,    setHistory]    = useState([])
  const [showModal,  setShowModal]  = useState(false)
  const [deleting,   setDeleting]   = useState(false)
  const [loading,    setLoading]    = useState(false)
  const messagesEnd = useRef(null)
  const textareaRef = useRef(null)

  // Load stored messages when paper changes
  useEffect(() => {
    if (!activePaper) {
      setMessages([])
      setHistory([])
      return
    }
    setLoading(true)
    loadMessages(activePaper)
      .then(stored => {
        setMessages(stored)
        // Rebuild history for Groq context
        setHistory(stored.map(m => ({
          role:    m.role === 'bot' ? 'assistant' : 'user',
          content: m.content,
        })))
      })
      .catch(() => {
        setMessages([])
        setHistory([])
      })
      .finally(() => setLoading(false))
  }, [activePaper])

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    if (!activePaper) { onToast('Please select a paper first', 'error'); return }

    const userMsg = { role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setTyping(true)

    // Save user message
    await saveMessage(activePaper, userMsg).catch(() => {})

    const newHistory = [...history, { role: 'user', content: text }]

    try {
      const { answer, mode } = await sendChatMessage({
        question:  text,
        namespace: activePaper,
        history:   newHistory,
      })
      const botMsg = { role: 'bot', content: answer, mode, timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, botMsg])
      setHistory([...newHistory, { role: 'assistant', content: answer }])

      // Save bot message
      await saveMessage(activePaper, botMsg).catch(() => {})

    } catch (err) {
      const errMsg = { role: 'bot', content: `⚠️ ${err.message}`, mode: 'error', timestamp: new Date().toISOString() }
      setMessages(prev => [...prev, errMsg])
      onToast(err.message, 'error')
    } finally {
      setTyping(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteMessages(activePaper)        // storage layer
      await deleteChat(activePaper).catch(() => {}) // backend SQLite
      setMessages([])
      setHistory([])
      setShowModal(false)
      onToast('Chat history deleted', 'success')
    } catch (err) {
      onToast('Delete failed: ' + err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="chat-view">
      <div className="chat-topbar">
        <span className="chat-topbar-title">Research Chat</span>
        <div className={`active-badge ${activePaper ? 'set' : 'unset'}`}>
          {activePaper || 'No paper selected'}
        </div>
        <div className="spacer" />
        <div className="storage-badge" title={`Storage: ${storageMode()}`}>
          {storageMode() === 'supabase' ? '☁️' : '💾'}
        </div>
        <select className="paper-select" value={activePaper} onChange={e => onSelectPaper(e.target.value)}>
          <option value="">— select paper —</option>
          {papers.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        {!isEmpty && (
          <button className="btn-delete-chat" onClick={() => setShowModal(true)}>🗑 Delete</button>
        )}
      </div>

      <div className="messages-container">
        {loading ? (
          <div className="empty-state">
            <div className="empty-state-icon">⏳</div>
            <div className="empty-state-title">Loading chat history…</div>
          </div>
        ) : isEmpty && !typing ? (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <div className="empty-state-title">Ready to Analyse</div>
            <p className="empty-state-sub">
              Select a paper and ask anything about formulation parameters,
              stability, characterization, or methodology.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <Message key={i} {...msg} />)}
            {typing && <TypingBubble />}
          </>
        )}
        <div ref={messagesEnd} />
      </div>

      {isEmpty && !typing && !loading && (
        <div className="suggestions-bar">
          <div className="suggestions-label">Quick Questions</div>
          <div className="pills-row">
            {SUGGESTIONS.map((s, i) => (
              <button key={i} className="pill-btn" onClick={() => setInput(s)}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div className="chat-inputbar">
        <textarea
          ref={textareaRef}
          className="chat-textarea"
          rows={1}
          value={input}
          onChange={e => {
            setInput(e.target.value)
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }}}
          placeholder="Ask about formulations, characterization, stability…"
        />
        <button className="btn-send" disabled={!input.trim() || typing} onClick={send}>➤</button>
      </div>

      {showModal && (
        <DeleteModal
          namespace={activePaper}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setShowModal(false)}
          deleting={deleting}
        />
      )}
    </div>
  )
}
