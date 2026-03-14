import React, { useState, useCallback, useEffect } from 'react'
import './index.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import UploadView from './components/UploadView'
import ChatView from './components/ChatView'
import Toast from './components/Toast'
import { fetchNamespaces } from './api'

export default function App() {
  const [activeTab,   setActiveTab]   = useState('upload')
  const [papers,      setPapers]      = useState([])
  const [activePaper, setActivePaper] = useState('')
  const [toasts,      setToasts]      = useState([])
  const [backendOk,   setBackendOk]   = useState(null)

  useEffect(() => {
    fetchNamespaces()
      .then(ns => {
        setPapers(ns)
        setBackendOk(true)
        const saved = localStorage.getItem('activePaper')
        if (saved && ns.includes(saved)) setActivePaper(saved)
      })
      .catch(() => {
        setBackendOk(false)
        // Don't show error toast — header indicator is enough
      })
  }, [])

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const handlePaperIndexed = useCallback((ns) => {
    setPapers(prev => prev.includes(ns) ? prev : [...prev, ns])
    setBackendOk(true)
  }, [])

  const handleSelectPaper = useCallback((ns) => {
    setActivePaper(ns)
    localStorage.setItem('activePaper', ns)
  }, [])

  return (
    <div className="app-shell">
      <Header activeTab={activeTab} onTabChange={setActiveTab} backendOk={backendOk} />
      <div className="app-body">
        <Sidebar
          papers={papers}
          activePaper={activePaper}
          onSelectPaper={p => { handleSelectPaper(p); setActiveTab('chat') }}
        />
        <main className="main-panel">
          {activeTab === 'upload'
            ? <UploadView onPaperIndexed={handlePaperIndexed} onToast={showToast} />
            : <ChatView papers={papers} activePaper={activePaper} onSelectPaper={handleSelectPaper} onToast={showToast} />
          }
        </main>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
