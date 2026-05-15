import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { executeMode } from '../api/client'
import Loader from './Loader'

const styles = `
.summary-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.summary-container {
  max-width: 860px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  animation: fadeInUp 0.8s ease-out;
}

.summary-header {
  text-align: center;
  margin-bottom: 32px;
}

.summary-header-icon {
  font-size: 40px;
  display: inline-block;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(61,255,160,0.5));
}

.summary-header h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
  color: var(--text);
  margin-bottom: 8px;
}

.summary-header p {
  font-size: 14px;
  color: var(--text-muted);
}

/* Meta stats */
.summary-meta {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 32px;
  animation: fadeInUp 0.5s ease-out 0.1s both;
}

.meta-chip {
  padding: 8px 16px;
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: 40px;
  font-size: 12px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-chip span {
  color: var(--accent);
  font-weight: 600;
}

/* Overview card */
.overview-card {
  background: linear-gradient(135deg, rgba(61, 255, 160, 0.04), rgba(139, 118, 245, 0.04));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(61, 255, 160, 0.12);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out 0.15s both;
}

.overview-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 10px;
}

.overview-text {
  font-size: 15px;
  line-height: 1.85;
  color: var(--text);
}

.overview-text strong {
  color: var(--accent);
  font-weight: 600;
}

.overview-text em {
  color: var(--purple);
}

/* Sections */
.summary-section {
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 0;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 24px;
  cursor: pointer;
  user-select: none;
  transition: background 0.2s;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.02);
}

.section-icon {
  font-size: 22px;
  flex-shrink: 0;
}

.section-title-wrap {
  flex: 1;
  min-width: 0;
}

.section-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
}

.section-importance {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.importance-high {
  background: rgba(61, 255, 160, 0.1);
  color: var(--accent);
  border: 1px solid rgba(61, 255, 160, 0.2);
}

.importance-medium {
  background: rgba(255, 200, 50, 0.1);
  color: #ffc832;
  border: 1px solid rgba(255, 200, 50, 0.2);
}

.importance-low {
  background: rgba(139, 118, 245, 0.1);
  color: var(--purple);
  border: 1px solid rgba(139, 118, 245, 0.2);
}

.section-toggle {
  font-size: 14px;
  color: var(--text-muted);
  transition: transform 0.3s ease;
  flex-shrink: 0;
}

.section-toggle.open {
  transform: rotate(180deg);
}

.section-body {
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s ease, padding 0.3s;
}

.section-body.collapsed {
  max-height: 0;
  opacity: 0;
  padding: 0 24px;
}

.section-body.expanded {
  max-height: 5000px;
  opacity: 1;
  padding: 0 24px 22px;
}

/* Section content markdown */
.section-content {
  font-size: 14px;
  line-height: 1.85;
  color: var(--text);
  margin-bottom: 16px;
}

.section-content strong {
  color: var(--accent);
  font-weight: 600;
}

.section-content em {
  color: var(--purple);
}

/* Key points */
.key-points-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.point-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.point-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--accent);
}

.point-bullet {
  color: var(--accent);
  font-size: 14px;
  line-height: 1.6;
  flex-shrink: 0;
  margin-top: 1px;
}

.point-text {
  font-size: 13.5px;
  line-height: 1.7;
  color: var(--text);
}

.point-text strong {
  color: var(--accent);
  font-weight: 600;
}

/* Key Terms Glossary */
.glossary-section {
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out;
}

.glossary-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.terms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 10px;
}

.term-card {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--cyan);
}

.term-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--cyan);
  margin-bottom: 4px;
}

.term-def {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
}

/* Quick Revision */
.revision-section {
  background: linear-gradient(135deg, rgba(139, 118, 245, 0.04), rgba(0, 212, 255, 0.04));
  backdrop-filter: blur(16px);
  border: 1px solid rgba(139, 118, 245, 0.12);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out;
}

.revision-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.revision-item {
  border-left-color: var(--purple);
}

.revision-bullet {
  color: var(--purple);
}

.revision-text strong {
  color: var(--purple);
  font-weight: 600;
}

/* Connections */
.connections-section {
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out;
}

.connections-title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.connection-item {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: var(--radius-sm);
  border-left: 2px solid var(--cyan);
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
}

/* Generate button */
.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--accent), #2dd88a);
  color: #050510;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(61, 255, 160, 0.25);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(61, 255, 160, 0.35);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loader-center {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.error-box {
  padding: 16px 20px;
  background: rgba(255, 107, 107, 0.06);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--radius);
  color: var(--danger);
  font-size: 14px;
  text-align: center;
  margin-top: 20px;
}

/* Copy summary button */
.summary-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.action-btn {
  padding: 8px 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
`

export default function SummaryView({ docInfo }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [collapsed, setCollapsed] = useState({})
  const [copied, setCopied] = useState(false)

  const sessionOrDocId = docInfo?.sessionId || docInfo?.documentId

  const toggle = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await executeMode('summary', sessionOrDocId)
      setData(res.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate summary.')
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate on mount
  useEffect(() => {
    if (!data && !loading) generate()
  }, [])

  const copyFullSummary = () => {
    if (!data) return
    let text = `# ${data.title}\n\n${data.overview}\n\n`
    for (const s of (data.sections || [])) {
      text += `## ${s.heading}\n${s.content}\n\n`
      for (const p of (s.key_points || [])) {
        text += `• ${p}\n`
      }
      text += '\n'
    }
    if (data.quick_revision?.length) {
      text += `## Quick Revision\n`
      for (const r of data.quick_revision) {
        text += `★ ${r}\n`
      }
    }
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const filenames = docInfo?.filenames || [docInfo?.filename]

  return (
    <>
      <style>{styles}</style>
      <div className="summary-layout">
        <div className="summary-container">

          <div className="summary-header">
            <span className="summary-header-icon">📋</span>
            <h2>Document Summary</h2>
            <p>{filenames.join(', ')}</p>
          </div>

          {loading && (
            <div className="loader-center"><Loader /></div>
          )}

          {error && <div className="error-box">{error}</div>}

          {data && (
            <>
              {/* Title */}
              <div style={{ textAlign: 'center', marginBottom: 8 }}>
                <h1 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 24,
                  fontWeight: 600,
                  color: 'var(--accent)',
                  marginBottom: 4,
                }}>{data.title}</h1>
              </div>

              {/* Meta stats */}
              <div className="summary-meta">
                <div className="meta-chip">📖 <span>{data.reading_time_minutes || '~5'}</span> min read</div>
                <div className="meta-chip">📑 <span>{data.total_topics || data.sections?.length || 0}</span> topics</div>
                <div className="meta-chip">📝 <span>{data.key_terms?.length || 0}</span> key terms</div>
              </div>

              {/* Actions */}
              <div className="summary-actions">
                <button className="action-btn" onClick={copyFullSummary}>
                  {copied ? '✓ Copied!' : '📋 Copy Summary'}
                </button>
              </div>

              {/* Overview */}
              {data.overview && (
                <div className="overview-card">
                  <div className="overview-label">Overview</div>
                  <div className="overview-text">
                    <ReactMarkdown>{data.overview}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Sections */}
              {(data.sections || []).map((section, i) => (
                <div key={i} className="summary-section" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div className="section-header" onClick={() => toggle(`section-${i}`)}>
                    <span className="section-icon">{section.icon || '📘'}</span>
                    <div className="section-title-wrap">
                      <span className="section-title">{section.heading}</span>
                    </div>
                    <span className={`section-importance importance-${section.importance || 'medium'}`}>
                      {section.importance || 'medium'}
                    </span>
                    <span className={`section-toggle ${collapsed[`section-${i}`] ? '' : 'open'}`}>▼</span>
                  </div>
                  <div className={`section-body ${collapsed[`section-${i}`] ? 'collapsed' : 'expanded'}`}>
                    {section.content && (
                      <div className="section-content">
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </div>
                    )}

                    {section.key_points?.length > 0 && (
                      <>
                        <div className="key-points-label">Key Points</div>
                        <ul className="point-list">
                          {section.key_points.map((p, j) => (
                            <li key={j} className="point-item">
                              <span className="point-bullet">◆</span>
                              <span className="point-text"><ReactMarkdown>{p}</ReactMarkdown></span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {/* Key Terms Glossary */}
              {data.key_terms?.length > 0 && (
                <div className="glossary-section">
                  <div className="glossary-title">📖 Key Terms Glossary</div>
                  <div className="terms-grid">
                    {data.key_terms.map((t, i) => (
                      <div key={i} className="term-card">
                        <div className="term-name">{t.term}</div>
                        <div className="term-def">{t.definition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Revision */}
              {data.quick_revision?.length > 0 && (
                <div className="revision-section">
                  <div className="revision-title">⚡ Quick Revision Notes</div>
                  <ul className="point-list">
                    {data.quick_revision.map((n, i) => (
                      <li key={i} className="point-item revision-item">
                        <span className="point-bullet revision-bullet">★</span>
                        <span className="point-text revision-text"><ReactMarkdown>{n}</ReactMarkdown></span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Connections */}
              {data.connections?.length > 0 && (
                <div className="connections-section">
                  <div className="connections-title">🔗 Topic Connections</div>
                  {data.connections.map((c, i) => (
                    <div key={i} className="connection-item">{c}</div>
                  ))}
                </div>
              )}

              {/* Regenerate */}
              <button className="generate-btn" onClick={generate} disabled={loading}>
                🔄 Regenerate Summary
              </button>
            </>
          )}

          {!data && !loading && !error && (
            <button className="generate-btn" onClick={generate}>
              📋 Generate Summary
            </button>
          )}

        </div>
      </div>
    </>
  )
}
