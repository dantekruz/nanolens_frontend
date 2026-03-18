import React from 'react'

export default function Header({ activeTab, onTabChange, backendOk, onMenuClick }) {
  const statusColor = backendOk === null ? '#f59e0b' : backendOk ? '#10b981' : '#f87171'
  const statusLabel = backendOk === null ? 'Connecting…' : backendOk ? 'Backend Online' : 'Backend Offline'

  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-mark">🔬</span>
        <span className="logo-wordmark">Nano<span>Lens</span></span>
      </div>

      {/* Desktop nav */}
      <nav className="header-nav">
        {['upload', 'chat'].map(tab => (
          <button
            key={tab}
            className={`nav-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab === 'upload' ? 'Upload Paper' : 'Research Chat'}
          </button>
        ))}
      </nav>

      <div className="header-status">
        <div className="status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <span className="status-label">{statusLabel}</span>
      </div>
    </header>
  )
}
