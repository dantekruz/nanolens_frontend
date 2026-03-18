import React from 'react'

<<<<<<< HEAD
export default function Header({ activeTab, onTabChange, backendOk }) {
=======
export default function Header({ activeTab, onTabChange, backendOk, onMenuClick }) {
>>>>>>> master
  const statusColor = backendOk === null ? '#f59e0b' : backendOk ? '#10b981' : '#f87171'
  const statusLabel = backendOk === null ? 'Connecting…' : backendOk ? 'Backend Online' : 'Backend Offline'

  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-mark">🔬</span>
        <span className="logo-wordmark">Nano<span>Lens</span></span>
      </div>
<<<<<<< HEAD
      <nav className="header-nav">
        {['upload', 'chat'].map(tab => (
          <button key={tab} className={`nav-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => onTabChange(tab)}>
=======

      {/* Desktop nav */}
      <nav className="header-nav">
        {['upload', 'chat'].map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
>>>>>>> master
            {tab === 'upload' ? 'Upload Paper' : 'Research Chat'}
          </button>
        ))}
      </nav>
<<<<<<< HEAD
      <div className="header-status">
        <div className="status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        {statusLabel}
=======

      <div className="header-status">
        <div className="status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <span className="status-label">{statusLabel}</span>
>>>>>>> master
      </div>
    </header>
  )
}
