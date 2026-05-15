const styles = `
.mode-sidebar {
  width: 230px;
  background: rgba(5, 5, 16, 0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
  padding: 20px 12px;
  gap: 8px;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.mode-sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: -1px;
  bottom: 0;
  width: 1px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(61, 255, 160, 0.2),
    rgba(139, 118, 245, 0.2),
    transparent
  );
}

.sidebar-brand {
  padding: 8px 12px 20px;
  border-bottom: 1px solid var(--glass-border);
  margin-bottom: 12px;
}

.sidebar-brand-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  color: var(--text);
}

.sidebar-brand-name span {
  color: var(--accent);
  text-shadow: 0 0 20px rgba(61, 255, 160, 0.3);
}

.sidebar-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--text-dim);
  padding: 8px 12px 4px;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.23, 1, 0.32, 1);
  text-align: left;
  width: 100%;
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.03);
  color: var(--text);
  border-color: var(--glass-border);
}

.mode-btn.active {
  background: rgba(61, 255, 160, 0.06);
  border-color: rgba(61, 255, 160, 0.2);
  color: var(--accent);
  box-shadow: 0 0 20px rgba(61, 255, 160, 0.05);
}

.mode-icon {
  font-size: 18px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-docs {
  margin-top: auto;
  padding: 14px 12px;
  border-top: 1px solid var(--glass-border);
}

.sidebar-docs-label {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.sidebar-doc-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.sidebar-doc-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 6px var(--accent);
  flex-shrink: 0;
}

.sidebar-doc-name {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}

.sidebar-reset-btn {
  width: 100%;
  padding: 8px;
  margin-top: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.sidebar-reset-btn:hover {
  border-color: rgba(255, 255, 255, 0.15);
  color: var(--text);
}
`

const MODES = [
  { key: 'qa',      icon: '💬', label: 'Q&A Chat' },
  { key: 'summary', icon: '📋', label: 'Summary' },
  { key: 'quiz',    icon: '🧠', label: 'Quiz (MCQs)' },
  { key: 'mindmap', icon: '🗺️', label: 'Mind Map' },
]

export default function ModeSidebar({ activeMode, onModeChange, docInfo, onReset }) {
  // Support both old single-file and new multi-file formats
  const filenames = docInfo?.filenames || (docInfo?.filename ? [docInfo.filename] : [])

  return (
    <>
      <style>{styles}</style>
      <nav className="mode-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-brand-name">Neura<span>Read</span></div>
        </div>

        <div className="sidebar-label">Study Mode</div>

        {MODES.map((m) => (
          <button
            key={m.key}
            className={`mode-btn${activeMode === m.key ? ' active' : ''}`}
            onClick={() => onModeChange(m.key)}
          >
            <span className="mode-icon">{m.icon}</span>
            {m.label}
          </button>
        ))}

        {docInfo && (
          <div className="sidebar-docs">
            <div className="sidebar-docs-label">Documents ({filenames.length})</div>
            {filenames.map((name, i) => (
              <div key={i} className="sidebar-doc-item">
                <span className="sidebar-doc-dot" />
                <span className="sidebar-doc-name" title={name}>{name}</span>
              </div>
            ))}
            <button className="sidebar-reset-btn" onClick={onReset}>
              ↑ Upload new documents
            </button>
          </div>
        )}
      </nav>
    </>
  )
}
