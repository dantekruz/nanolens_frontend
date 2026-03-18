import React, { useState } from 'react'

<<<<<<< HEAD
export default function Sidebar({ papers, activePaper, onSelectPaper }) {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>{open ? '◀' : '▶'}</button>
      {open && (
        <>
          <div className="sidebar-section">
            <div className="sidebar-heading">Indexed Papers</div>
            {papers.length === 0
              ? <p className="sidebar-empty">No papers yet. Upload one to get started.</p>
              : papers.map(p => (
                  <button
                    key={p}
                    className={`paper-item ${activePaper === p ? 'active' : ''}`}
                    onClick={() => onSelectPaper(p)}
                  >
                    📄 {p}
                  </button>
                ))
            }
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">Key Benchmarks</div>
            <table className="bench-table">
              <tbody>
                <tr><td>Droplet Size</td><td>20–200 nm</td></tr>
                <tr><td>PDI</td><td>&lt; 0.3</td></tr>
                <tr><td>Zeta Potential</td><td>&gt; ±30 mV</td></tr>
                <tr><td>EE%</td><td>&gt; 80%</td></tr>
              </tbody>
            </table>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-heading">NE Types</div>
            <ul className="ne-list">
              <li><b>O/W</b> — Oil-in-Water</li>
              <li><b>W/O</b> — Water-in-Oil</li>
              <li><b>SNEDDS</b> — Self-Nano-Emulsifying</li>
              <li><b>Nanoemulgel</b> — NE in gel base</li>
            </ul>
          </div>
        </>
      )}
    </aside>
  )
}
=======
export default function Sidebar({ papers, activePaper, onSelectPaper, onDeletePaper, mobile }) {
  const [open, setOpen] = useState(true)

  if (mobile) {
    return <SidebarContent papers={papers} activePaper={activePaper} onSelectPaper={onSelectPaper} onDeletePaper={onDeletePaper} />
  }

  return (
    <aside className={`sidebar ${open ? 'open' : 'closed'}`}>
      <button className="sidebar-toggle" onClick={() => setOpen(!open)}>
        {open ? '◀' : '▶'}
      </button>
      {open && <SidebarContent papers={papers} activePaper={activePaper} onSelectPaper={onSelectPaper} onDeletePaper={onDeletePaper} />}
    </aside>
  )
}

function SidebarContent({ papers, activePaper, onSelectPaper, onDeletePaper }) {
  const [confirmPaper, setConfirmPaper] = useState(null)
  const [deleting,     setDeleting]     = useState(false)

  const handleDeleteClick = (e, paper) => {
    e.stopPropagation() // don't trigger onSelectPaper
    setConfirmPaper(paper)
  }

  const handleConfirm = async () => {
    setDeleting(true)
    await onDeletePaper(confirmPaper)
    setDeleting(false)
    setConfirmPaper(null)
  }

  return (
    <>
      <div className="sidebar-section">
        <div className="sidebar-heading">Indexed Papers</div>
        {papers.length === 0
          ? <p className="sidebar-empty">No papers yet. Upload one to get started.</p>
          : papers.map(p => (
              <div key={p} className={`paper-item-row ${activePaper === p ? 'active' : ''}`}>
                <button
                  className="paper-item-btn"
                  onClick={() => onSelectPaper(p)}
                  title={p}
                >
                  📄 {p}
                </button>
                <button
                  className="paper-delete-btn"
                  onClick={e => handleDeleteClick(e, p)}
                  title="Delete this paper"
                >
                  🗑
                </button>
              </div>
            ))
        }
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">Key Benchmarks</div>
        <table className="bench-table">
          <tbody>
            <tr><td>Droplet Size</td><td>20–200 nm</td></tr>
            <tr><td>PDI</td><td>&lt; 0.3</td></tr>
            <tr><td>Zeta Potential</td><td>&gt; ±30 mV</td></tr>
            <tr><td>EE%</td><td>&gt; 80%</td></tr>
          </tbody>
        </table>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-heading">NE Types</div>
        <ul className="ne-list">
          <li><b>O/W</b> — Oil-in-Water</li>
          <li><b>W/O</b> — Water-in-Oil</li>
          <li><b>SNEDDS</b> — Self-Nano-Emulsifying</li>
          <li><b>Nanoemulgel</b> — NE in gel base</li>
        </ul>
      </div>

      {/* Delete confirmation modal */}
      {confirmPaper && (
        <div className="modal-overlay" onClick={() => !deleting && setConfirmPaper(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🗑️</div>
            <h2 className="modal-title">Delete Paper</h2>
            <p className="modal-body">
              This will permanently delete <strong>"{confirmPaper}"</strong> from Pinecone and remove it from your list.<br /><br />
              This action <em>cannot be undone</em>. You will need to re-upload the paper to use it again.
            </p>
            <div className="modal-actions">
              <button className="modal-btn-cancel" onClick={() => setConfirmPaper(null)} disabled={deleting}>
                Cancel
              </button>
              <button className="modal-btn-delete" onClick={handleConfirm} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
>>>>>>> master
