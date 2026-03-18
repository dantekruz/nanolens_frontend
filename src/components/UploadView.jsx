import React, { useState, useRef } from 'react'
import { uploadFile } from '../api'

export default function UploadView({ onPaperIndexed, onToast }) {
  const [file,      setFile]      = useState(null)
  const [namespace, setNamespace] = useState('')
  const [progress,  setProgress]  = useState(0)
  const [log,       setLog]       = useState([])
  const [uploading, setUploading] = useState(false)
  const [dragging,  setDragging]  = useState(false)
  const inputRef = useRef(null)

  const addLog = (msg) => setLog(prev => [...prev, msg])

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) setFile(f)
  }

  const handleSubmit = async () => {
    if (!file || !namespace.trim()) {
      onToast('Please select a file and enter a namespace', 'error'); return
    }
    setUploading(true); setLog([]); setProgress(0)
    addLog(`📄 File: ${file.name} (${(file.size/1024).toFixed(1)} KB)`)
    addLog(`🏷️  Namespace: ${namespace}`)
    addLog('⏳ Uploading… (Render may take 30s to wake up on first request)')
    try {
      await uploadFile({
        file, namespace: namespace.trim(),
        onProgress: (pct, msg) => { setProgress(pct); addLog(msg) }
      })
      onPaperIndexed(namespace.trim())
      onToast(`✅ "${namespace}" indexed successfully`, 'success')
    } catch (err) {
      addLog('❌ ' + err.message)
      onToast('Upload failed: ' + err.message, 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="upload-view">
      <div className="page-hero">
        <h1 className="page-title">Upload <em>Research Paper</em></h1>
        <p className="page-sub">Upload a PDF, CSV, or DOCX. It will be chunked, embedded, and stored in Pinecone for intelligent Q&amp;A.</p>
      </div>

      <div
        className={`dropzone-wrapper ${dragging ? 'active-drag' : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <span className="drop-icon-emoji">{file ? '📄' : '📂'}</span>
        <div className="drop-title">{file ? file.name : 'Drop your file here or click to browse'}</div>
        <div className="drop-sub">{file ? `${(file.size/1024).toFixed(1)} KB — ready to upload` : 'PDF, CSV, DOCX supported'}</div>
        <input ref={inputRef} type="file" accept=".pdf,.csv,.docx" style={{display:'none'}}
          onChange={e => setFile(e.target.files[0])} />
      </div>

      <div className="upload-form">
        <label className="form-label">Paper Namespace</label>
        <input
          className="form-input"
          placeholder="e.g. sharma_2023_curcumin_nanoemulsion"
          value={namespace}
          onChange={e => setNamespace(e.target.value)}
          disabled={uploading}
        />
        <p className="form-hint">A unique name to identify this paper in the chatbot.</p>
      </div>

      <button className="btn-upload" onClick={handleSubmit} disabled={uploading || !file || !namespace.trim()}>
        {uploading ? 'Indexing…' : '⚡ Index Paper'}
      </button>

      {log.length > 0 && (
        <div className="upload-log">
          {progress > 0 && progress < 100 && (
            <div className="progress-bar-wrap">
              <div className="progress-bar-fill" style={{width: `${progress}%`}} />
            </div>
          )}
          {log.map((l, i) => <div key={i} className="log-line">{l}</div>)}
        </div>
      )}
    </div>
  )
}
