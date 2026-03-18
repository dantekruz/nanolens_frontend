import React, { useState, useCallback, useEffect } from 'react'
import './index.css'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import UploadView from './components/UploadView'
import ChatView from './components/ChatView'
import Toast from './components/Toast'
<<<<<<< HEAD
import { fetchNamespaces } from './api'
=======
import { fetchNamespaces, deletePaper } from './api'
>>>>>>> master

export default function App() {
  const [activeTab,   setActiveTab]   = useState('upload')
  const [papers,      setPapers]      = useState([])
  const [activePaper, setActivePaper] = useState('')
  const [toasts,      setToasts]      = useState([])
  const [backendOk,   setBackendOk]   = useState(null)
<<<<<<< HEAD
=======
  const [drawerOpen,  setDrawerOpen]  = useState(false)
>>>>>>> master

  useEffect(() => {
    fetchNamespaces()
      .then(ns => {
        setPapers(ns)
        setBackendOk(true)
        const saved = localStorage.getItem('activePaper')
        if (saved && ns.includes(saved)) setActivePaper(saved)
      })
<<<<<<< HEAD
      .catch(() => {
        setBackendOk(false)
        // Don't show error toast — header indicator is enough
      })
=======
      .catch(() => setBackendOk(false))
>>>>>>> master
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
<<<<<<< HEAD
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
=======
    setDrawerOpen(false)
    setActiveTab('chat')
  }, [])

  const handleDeletePaper = useCallback(async (ns) => {
    try {
      await deletePaper(ns)
      setPapers(prev => prev.filter(p => p !== ns))
      if (activePaper === ns) {
        setActivePaper('')
        localStorage.removeItem('activePaper')
      }
      showToast(`"${ns}" deleted successfully`, 'success')
    } catch (err) {
      showToast('Delete failed: ' + err.message, 'error')
    }
  }, [activePaper, showToast])

  const sidebarProps = {
    papers,
    activePaper,
    onSelectPaper: handleSelectPaper,
    onDeletePaper: handleDeletePaper,
  }

  return (
    <div className="app-shell">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendOk={backendOk}
        onMenuClick={() => setDrawerOpen(o => !o)}
      />

      <div className="app-body">
        <Sidebar {...sidebarProps} />

        <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`}>
          <Sidebar {...sidebarProps} mobile />
        </div>

        <div
          className={`sidebar-overlay ${drawerOpen ? 'visible' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />

>>>>>>> master
        <main className="main-panel">
          {activeTab === 'upload'
            ? <UploadView onPaperIndexed={handlePaperIndexed} onToast={showToast} />
            : <ChatView papers={papers} activePaper={activePaper} onSelectPaper={handleSelectPaper} onToast={showToast} />
          }
        </main>
      </div>
<<<<<<< HEAD
=======

      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <button className={`bottom-nav-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upload'); setDrawerOpen(false) }}>
            <span className="nav-icon">📤</span><span>Upload</span>
          </button>
          <button className={`bottom-nav-btn ${drawerOpen ? 'active' : ''}`}
            onClick={() => setDrawerOpen(o => !o)}>
            <span className="nav-icon">📄</span><span>Papers</span>
          </button>
          <button className={`bottom-nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => { setActiveTab('chat'); setDrawerOpen(false) }}>
            <span className="nav-icon">💬</span><span>Chat</span>
          </button>
        </div>
      </nav>

>>>>>>> master
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  )
}
