import React, { useState } from 'react'

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
