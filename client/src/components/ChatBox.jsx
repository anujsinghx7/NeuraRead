import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { executeMode } from '../api/client'
import Loader from './Loader'

const styles = `
.chat-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  z-index: 1;
}

/* ═══════════════════════════════════════════
   Messages Area
   ═══════════════════════════════════════════ */
.messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 32px 0;
}

.messages-inner {
  max-width: 740px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* ═══════════════════════════════════════════
   Empty State
   ═══════════════════════════════════════════ */
.empty-state {
  text-align: center;
  padding: 80px 20px 40px;
  animation: fadeInUp 0.8s ease-out;
}

.empty-glow {
  font-size: 52px;
  display: inline-block;
  margin-bottom: 24px;
  filter: drop-shadow(0 0 30px rgba(61,255,160,0.6));
  animation: float 4s ease-in-out infinite;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
  color: var(--text);
  margin-bottom: 12px;
}

.empty-sub {
  font-size: 14px;
  color: var(--text-muted);
  max-width: 400px;
  margin: 0 auto 36px;
  line-height: 1.7;
}

/* Suggestion chips */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.chip {
  padding: 10px 20px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 40px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  font-family: var(--font-body);
  backdrop-filter: blur(8px);
}

.chip:hover {
  border-color: rgba(61, 255, 160, 0.4);
  color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3), 0 0 20px rgba(61, 255, 160, 0.08);
}

/* ═══════════════════════════════════════════
   Message Bubbles
   ═══════════════════════════════════════════ */
.msg {
  display: flex;
  flex-direction: column;
  gap: 6px;
  animation: msgSlideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes msgSlideIn {
  from { opacity: 0; transform: translateY(16px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.msg-role {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 0 6px;
}

.msg.user .msg-role { color: var(--purple); }
.msg.ai   .msg-role { color: var(--accent); }

.msg-bubble {
  padding: 20px 24px;
  border-radius: var(--radius);
  font-size: 15px;
  line-height: 1.8;
}

.msg.user .msg-bubble {
  background: rgba(139, 118, 245, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(139, 118, 245, 0.12);
  color: var(--text);
  border-top-left-radius: 4px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.msg.ai .msg-bubble {
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-left: 2px solid var(--accent);
  color: var(--text);
  border-top-left-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

/* ═══════════════════════════════════════════
   Rich Markdown Rendering inside AI bubbles
   ═══════════════════════════════════════════ */
.msg.ai .msg-bubble h1 {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--accent);
  margin: 20px 0 10px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(61, 255, 160, 0.1);
}

.msg.ai .msg-bubble h1:first-child { margin-top: 0; }

.msg.ai .msg-bubble h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  margin: 18px 0 8px;
}

.msg.ai .msg-bubble h2:first-child { margin-top: 0; }

.msg.ai .msg-bubble h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin: 14px 0 6px;
}

.msg.ai .msg-bubble h3:first-child { margin-top: 0; }

.msg.ai .msg-bubble p {
  margin: 0 0 14px;
  line-height: 1.85;
  color: var(--text);
}

.msg.ai .msg-bubble p:last-child { margin-bottom: 0; }

.msg.ai .msg-bubble strong {
  color: var(--accent);
  font-weight: 600;
}

.msg.ai .msg-bubble em {
  color: var(--purple);
  font-style: italic;
}

.msg.ai .msg-bubble ul,
.msg.ai .msg-bubble ol {
  padding-left: 22px;
  margin: 10px 0 14px;
}

.msg.ai .msg-bubble li {
  margin-bottom: 8px;
  line-height: 1.7;
  padding-left: 4px;
}

.msg.ai .msg-bubble li::marker {
  color: var(--accent);
}

.msg.ai .msg-bubble blockquote {
  border-left: 3px solid var(--purple);
  margin: 12px 0;
  padding: 10px 16px;
  background: rgba(139, 118, 245, 0.06);
  border-radius: 0 8px 8px 0;
  font-style: italic;
  color: var(--text-muted);
}

.msg.ai .msg-bubble code {
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--cyan);
}

.msg.ai .msg-bubble pre {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  margin: 12px 0;
  overflow-x: auto;
}

.msg.ai .msg-bubble pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 13px;
  color: var(--text);
}

.msg.ai .msg-bubble hr {
  border: none;
  border-top: 1px solid var(--glass-border);
  margin: 16px 0;
}

/* Copy button for AI messages */
.msg-actions {
  display: flex;
  gap: 8px;
  padding: 0 6px;
  margin-top: 2px;
}

.copy-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 11px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: var(--font-body);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.copy-btn:hover {
  color: var(--accent);
  background: rgba(61, 255, 160, 0.06);
}

/* ═══════════════════════════════════════════
   Source Grounding
   ═══════════════════════════════════════════ */
.sources-grounded {
  margin-top: 12px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
}

.sources-grounded-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--text-dim);
  margin-bottom: 10px;
}

.source-grounded-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.source-grounded-item:last-child { border-bottom: none; }

.source-page-badge {
  padding: 3px 8px;
  background: linear-gradient(135deg, rgba(61,255,160,0.15), rgba(139,118,245,0.15));
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.source-confidence {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.confidence-high {
  background: rgba(61, 255, 160, 0.12);
  color: var(--accent);
}

.confidence-medium {
  background: rgba(255, 200, 50, 0.12);
  color: #ffc832;
}

.confidence-low {
  background: rgba(255, 107, 107, 0.12);
  color: var(--danger);
}

.source-grounded-text {
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.6;
  flex: 1;
  font-style: italic;
}

/* Error */
.msg-error {
  padding: 16px 20px;
  background: rgba(255, 107, 107, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--radius);
  color: var(--danger);
  font-size: 14px;
}

/* ═══════════════════════════════════════════
   Input Area
   ═══════════════════════════════════════════ */
.input-area {
  padding: 20px 24px 28px;
  border-top: 1px solid var(--glass-border);
  background: rgba(5, 5, 16, 0.8);
  backdrop-filter: blur(24px);
  position: relative;
}

.input-area::before {
  content: '';
  position: absolute;
  top: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139, 118, 245, 0.3), rgba(61, 255, 160, 0.3), transparent);
}

.input-inner {
  max-width: 740px;
  margin: 0 auto;
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.input-box {
  flex: 1;
  position: relative;
}

.input-box::before {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: calc(var(--radius) + 2px);
  background: linear-gradient(135deg, var(--accent), var(--purple), var(--cyan, #00d4ff));
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: -1;
  filter: blur(4px);
}

.input-box:focus-within::before {
  opacity: 0.25;
}

.question-input {
  width: 100%;
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 16px 20px;
  color: var(--text);
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;
  transition: all 0.3s ease;
  max-height: 160px;
  min-height: 54px;
}

.question-input::placeholder { color: var(--text-dim); }

.question-input:focus {
  border-color: rgba(61, 255, 160, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 0 30px rgba(61, 255, 160, 0.06);
}

.send-btn {
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, var(--accent), #2dd88a);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  flex-shrink: 0;
  color: #050510;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(61, 255, 160, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2);
}

.send-btn:disabled { opacity: 0.3; cursor: not-allowed; box-shadow: none; }

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(61, 255, 160, 0.4), 0 0 40px rgba(61, 255, 160, 0.15);
}

.send-btn:active:not(:disabled) {
  transform: translateY(1px) scale(0.98);
}

.input-hint {
  text-align: center;
  font-size: 11px;
  color: var(--text-dim);
  margin-top: 10px;
  max-width: 740px;
  margin-left: auto;
  margin-right: auto;
}
`

const SUGGESTIONS = [
  'Summarize this document',
  'What are the key points?',
  'Explain the main concept',
  'List the conclusions',
]

function getConfidenceClass(score) {
  if (score >= 0.7) return 'confidence-high'
  if (score >= 0.4) return 'confidence-medium'
  return 'confidence-low'
}

export default function ChatBox({ docInfo }) {
  const [messages, setMessages] = useState([])
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState(null)
  const bottomRef = useRef()
  const textareaRef = useRef()

  // Use sessionId for multi-doc, fallback to documentId
  const sessionOrDocId = docInfo?.sessionId || docInfo?.documentId

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const autoResize = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx)
      setTimeout(() => setCopiedIdx(null), 2000)
    })
  }

  const sendMessage = async (q) => {
    const text = (q || question).trim()
    if (!text || loading) return

    setMessages(prev => [...prev, { role: 'user', text }])
    setQuestion('')
    if (textareaRef.current) textareaRef.current.style.height = '54px'
    setLoading(true)

    try {
      const res = await executeMode('qa', sessionOrDocId, { question: text })
      const data = res.data
      setMessages(prev => [...prev, {
        role: 'ai',
        text: data.answer || data,
        sources: data.sources || [],
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: null,
        error: err?.response?.data?.message || 'Something went wrong. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="chat-layout">

        {/* Messages */}
        <div className="messages-wrap">
          <div className="messages-inner">
            {messages.length === 0 && (
              <div className="empty-state">
                <span className="empty-glow">✦</span>
                <h2 className="empty-title">Ready to answer</h2>
                <p className="empty-sub">
                  Your documents have been processed. Ask anything — I'll find the relevant parts and explain them clearly.
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map(s => (
                    <button key={s} className="chip" onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                <span className="msg-role">{msg.role === 'user' ? 'You' : 'NeuraRead'}</span>

                {msg.error ? (
                  <div className="msg-error">{msg.error}</div>
                ) : (
                  <div className="msg-bubble">
                    {msg.role === 'ai' ? <ReactMarkdown>{msg.text}</ReactMarkdown> : msg.text}
                  </div>
                )}

                {/* Copy button for AI messages */}
                {msg.role === 'ai' && msg.text && !msg.error && (
                  <div className="msg-actions">
                    <button className="copy-btn" onClick={() => copyToClipboard(msg.text, i)}>
                      {copiedIdx === i ? '✓ Copied' : '📋 Copy'}
                    </button>
                  </div>
                )}

                {/* Source Grounding */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="sources-grounded">
                    <p className="sources-grounded-label">📌 Source Grounding</p>
                    {msg.sources.map((s, j) => (
                      <div key={j} className="source-grounded-item">
                        <span className="source-page-badge">Page {s.page_number}</span>
                        <span className={`source-confidence ${getConfidenceClass(s.confidence_score)}`}>
                          {Math.round(s.confidence_score * 100)}%
                        </span>
                        <p className="source-grounded-text">
                          "{s.extracted_text?.slice(0, 200)}{s.extracted_text?.length > 200 ? '…' : ''}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="msg ai">
                <span className="msg-role">NeuraRead</span>
                <div className="msg-bubble"><Loader /></div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Input */}
        <div className="input-area">
          <div className="input-inner">
            <div className="input-box">
              <textarea
                ref={textareaRef}
                className="question-input"
                placeholder="Ask a question about your documents…"
                value={question}
                onChange={e => { setQuestion(e.target.value); autoResize() }}
                onKeyDown={onKeyDown}
                rows={1}
                disabled={loading}
              />
            </div>
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!question.trim() || loading}
              title="Send (Enter)"
            >↑</button>
          </div>
          <p className="input-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>

      </div>
    </>
  )
}
