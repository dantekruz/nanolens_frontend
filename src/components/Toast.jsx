import React, { useEffect } from 'react'

function ToastItem({ id, message, type, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(id), 4000)
    return () => clearTimeout(t)
  }, [id, onRemove])
  return (
    <div className={`toast ${type}`} onClick={() => onRemove(id)}>{message}</div>
  )
}

export default function Toast({ toasts, onRemove }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <ToastItem key={t.id} {...t} onRemove={onRemove} />)}
    </div>
  )
}
