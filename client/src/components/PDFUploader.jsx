import { useState, useRef, useCallback } from 'react'
import { uploadPDFs } from '../api/client'

const styles = `
/* ═══════════════════════════════════════════
   Floating Particles (decorative)
   ═══════════════════════════════════════════ */
.particle {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(1px);
}

.particle-1 {
  width: 6px; height: 6px;
  background: var(--accent);
  top: 15%; left: 10%;
  animation: orbitFloat 8s ease-in-out infinite;
  opacity: 0.3;
}

.particle-2 {
  width: 4px; height: 4px;
  background: var(--purple);
  top: 25%; right: 15%;
  animation: orbitFloat 10s ease-in-out infinite 1s;
  opacity: 0.25;
}

.particle-3 {
  width: 8px; height: 8px;
  background: var(--cyan);
  bottom: 20%; left: 20%;
  animation: orbitFloat 12s ease-in-out infinite 2s;
  opacity: 0.2;
}

.particle-4 {
  width: 3px; height: 3px;
  background: var(--accent);
  bottom: 30%; right: 25%;
  animation: orbitFloat 9s ease-in-out infinite 0.5s;
  opacity: 0.35;
}

.particle-5 {
  width: 5px; height: 5px;
  background: var(--purple);
  top: 60%; left: 70%;
  animation: orbitFloat 11s ease-in-out infinite 3s;
  opacity: 0.2;
}

/* ═══════════════════════════════════════════
   Upload Section
   ═══════════════════════════════════════════ */
.uploader-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 40px 24px;
  position: relative;
  z-index: 1;
  perspective: 1200px;
}

/* ═══════════════════════════════════════════
   Brand
   ═══════════════════════════════════════════ */
.uploader-brand {
  text-align: center;
  margin-bottom: 52px;
  animation: fadeInUp 0.8s ease-out;
}

.brand-icon {
  font-size: 44px;
  margin-bottom: 18px;
  display: inline-block;
  filter: drop-shadow(0 0 24px rgba(61,255,160,0.7));
  animation: float 4s ease-in-out infinite;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  color: var(--text);
  letter-spacing: -0.5px;
  line-height: 1;
  text-shadow: 0 0 40px rgba(61, 255, 160, 0.15);
}

.brand-name span {
  color: var(--accent);
  text-shadow: 0 0 30px rgba(61, 255, 160, 0.3);
}

.brand-tagline {
  margin-top: 14px;
  font-size: 15px;
  color: var(--text-muted);
  font-weight: 300;
  letter-spacing: 0.5px;
}

/* ═══════════════════════════════════════════
   Glassmorphic Drop Zone
   ═══════════════════════════════════════════ */
.drop-zone {
  width: 100%;
  max-width: 580px;
  border: 1.5px solid var(--glass-border);
  border-radius: var(--radius-lg);
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: 60px 44px;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  animation: fadeInUp 1s ease-out 0.2s both;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Gradient border glow overlay */
.drop-zone::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: var(--radius-lg);
  background: linear-gradient(
    135deg,
    rgba(61, 255, 160, 0.15),
    transparent 40%,
    transparent 60%,
    rgba(139, 118, 245, 0.15)
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: -1;
}

/* Inner glow */
.drop-zone::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--radius-lg);
  background: radial-gradient(
    circle at 50% 50%,
    rgba(61, 255, 160, 0.06),
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.drop-zone:hover::before,
.drop-zone.dragging::before {
  opacity: 1;
}

.drop-zone:hover::after,
.drop-zone.dragging::after {
  opacity: 1;
}

.drop-zone:hover,
.drop-zone.dragging {
  border-color: rgba(61, 255, 160, 0.3);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(61, 255, 160, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 20px;
  display: block;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
}

.drop-zone:hover .drop-icon,
.drop-zone.dragging .drop-icon {
  transform: scale(1.15) translateY(-4px);
}

.drop-title {
  font-size: 20px;
  color: var(--text);
  font-weight: 500;
  margin-bottom: 8px;
}

.drop-sub {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 30px;
}

.drop-btn {
  display: inline-block;
  padding: 11px 32px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-hi);
  color: var(--text);
  border-radius: 40px;
  font-size: 13px;
  font-weight: 500;
  font-family: var(--font-body);
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.drop-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 40px;
  background: linear-gradient(90deg, transparent, rgba(61,255,160,0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}

.drop-btn:hover::before {
  transform: translateX(100%);
}

.drop-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  box-shadow: 0 0 20px rgba(61, 255, 160, 0.15);
}

.file-input {
  display: none;
}

/* ═══════════════════════════════════════════
   Selected Files List
   ═══════════════════════════════════════════ */
.selected-files-container {
  width: 100%;
  max-width: 580px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeInUp 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.files-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.files-count {
  font-size: 13px;
  color: var(--text-muted);
}

.files-count span {
  color: var(--accent);
  font-weight: 600;
}

.add-more-btn {
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.add-more-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.add-more-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.selected-file {
  background: var(--glass);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow:
    0 4px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition: all 0.3s ease;
}

.selected-file:hover {
  border-color: rgba(255, 255, 255, 0.12);
}

.file-icon-wrap {
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, rgba(61,255,160,0.1), rgba(139,118,245,0.1));
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.file-meta { flex: 1; min-width: 0; }

.file-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-size {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.file-idx {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.5px;
}

.remove-btn {
  background: rgba(255, 107, 107, 0.08);
  border: 1px solid rgba(255, 107, 107, 0.15);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: var(--danger);
  background: rgba(255, 107, 107, 0.15);
  border-color: rgba(255, 107, 107, 0.3);
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.1);
}

/* ═══════════════════════════════════════════
   Shimmer Upload Button
   ═══════════════════════════════════════════ */
.upload-btn {
  width: 100%;
  max-width: 580px;
  margin-top: 18px;
  padding: 18px;
  background: linear-gradient(135deg, var(--accent), #2dd88a, var(--accent));
  background-size: 200% 200%;
  color: #050510;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.5s ease-out 0.3s both;
  box-shadow:
    0 4px 15px rgba(61, 255, 160, 0.25),
    0 0 30px rgba(61, 255, 160, 0.1);
}

.upload-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 60%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.25),
    transparent
  );
  transition: none;
  animation: shimmer 3s ease-in-out infinite;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-btn:disabled::before {
  animation: shimmer 1.5s ease-in-out infinite;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.01);
  box-shadow:
    0 8px 30px rgba(61, 255, 160, 0.35),
    0 0 50px rgba(61, 255, 160, 0.15);
  background-position: 100% 50%;
}

.upload-btn:active:not(:disabled) {
  transform: translateY(0px) scale(0.99);
  box-shadow:
    0 2px 10px rgba(61, 255, 160, 0.2),
    0 0 20px rgba(61, 255, 160, 0.08);
}

/* ═══════════════════════════════════════════
   Error
   ═══════════════════════════════════════════ */
.upload-error {
  width: 100%;
  max-width: 580px;
  margin-top: 14px;
  padding: 14px 18px;
  background: rgba(255, 107, 107, 0.06);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--radius-sm);
  color: var(--danger);
  font-size: 13px;
  animation: fadeInUp 0.3s ease;
}

/* ═══════════════════════════════════════════
   Progress Bar (Glowing)
   ═══════════════════════════════════════════ */
.progress-wrap {
  width: 100%;
  max-width: 580px;
  margin-top: 18px;
}

.progress-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
}

.progress-bar-wrap {
  width: 100%;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 40px;
  height: 4px;
  overflow: hidden;
  backdrop-filter: blur(4px);
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--cyan), var(--accent));
  background-size: 200% 100%;
  border-radius: 40px;
  transition: width 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 0 12px var(--accent), 0 0 24px rgba(61, 255, 160, 0.3);
  animation: shimmer 2s ease-in-out infinite;
  position: relative;
}
`

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const MAX_FILES = 5
const MAX_SIZE = 25 * 1024 * 1024 // 25 MB per file

export default function PDFUploader({ onUploadSuccess }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('')
  const [error, setError] = useState('')
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const inputRef = useRef()
  const addInputRef = useRef()
  const dropRef = useRef()

  const addFiles = useCallback((newFiles) => {
    setError('')
    const incoming = Array.from(newFiles)
    const validFiles = []

    for (const f of incoming) {
      if (f.type !== 'application/pdf') {
        setError('Only PDF files are supported.')
        continue
      }
      if (f.size > MAX_SIZE) {
        setError(`"${f.name}" exceeds 25 MB limit.`)
        continue
      }
      // Check for duplicates
      if (files.some(existing => existing.name === f.name && existing.size === f.size)) {
        continue
      }
      validFiles.push(f)
    }

    const combined = [...files, ...validFiles].slice(0, MAX_FILES)
    if (files.length + validFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} PDFs allowed. Some files were skipped.`)
    }
    setFiles(combined)
  }, [files])

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
    setError('')
  }

  const onDragOver  = (e) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = ()  => setDragging(false)
  const onDrop      = (e) => {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    if (!dropRef.current) return
    const rect = dropRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 8 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setLoading(true)
    setProgress(5)
    setProgressMsg(`Processing ${files.length} PDF${files.length > 1 ? 's' : ''}…`)
    setError('')

    try {
      const tick = setInterval(() => {
        setProgress(p => p < 85 ? p + 5 : p)
      }, 800)

      const data = await uploadPDFs(files)
      clearInterval(tick)
      setProgress(100)
      setProgressMsg('Done! Opening your documents…')

      setTimeout(() => {
        onUploadSuccess({
          ...data,
          filenames: data.documents?.map(d => d.filename) || [files[0].name],
        })
      }, 500)
    } catch (err) {
      setProgress(0)
      setProgressMsg('')
      setError(err?.response?.data?.message || 'Upload failed. Is the server running?')
    } finally {
      setLoading(false)
    }
  }

  const tiltStyle = {
    transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
    transition: tilt.x === 0 && tilt.y === 0
      ? 'transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
      : 'transform 0.1s ease-out',
  }

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <>
      <style>{styles}</style>

      {/* Floating particles */}
      <div className="particle particle-1" />
      <div className="particle particle-2" />
      <div className="particle particle-3" />
      <div className="particle particle-4" />
      <div className="particle particle-5" />

      <section className="uploader-section">

        <div className="uploader-brand">
          <span className="brand-icon">✦</span>
          <h1 className="brand-name">Neura<span>Read</span></h1>
          <p className="brand-tagline">Your AI-powered multi-document study assistant</p>
        </div>

        {files.length === 0 ? (
          <div
            ref={dropRef}
            className={`drop-zone${dragging ? ' dragging' : ''}`}
            style={tiltStyle}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <span className="drop-icon">📄</span>
            <p className="drop-title">Drop your PDFs here</p>
            <p className="drop-sub">Upload up to {MAX_FILES} PDFs (max 25 MB each)</p>
            <button className="drop-btn" type="button">Browse files</button>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="file-input"
              onChange={e => { addFiles(e.target.files); e.target.value = '' }}
            />
          </div>
        ) : (
          <div className="selected-files-container">
            <div className="files-header">
              <span className="files-count">
                <span>{files.length}</span> / {MAX_FILES} PDFs · {formatSize(totalSize)}
              </span>
              <button
                className="add-more-btn"
                onClick={() => addInputRef.current.click()}
                disabled={files.length >= MAX_FILES || loading}
              >
                + Add more
              </button>
              <input
                ref={addInputRef}
                type="file"
                accept="application/pdf"
                multiple
                className="file-input"
                onChange={e => { addFiles(e.target.files); e.target.value = '' }}
              />
            </div>

            {files.map((file, i) => (
              <div key={`${file.name}-${file.size}`} className="selected-file">
                <div className="file-icon-wrap">📄</div>
                <div className="file-meta">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatSize(file.size)}</p>
                </div>
                <span className="file-idx">PDF {i + 1}</span>
                <button
                  className="remove-btn"
                  onClick={() => removeFile(i)}
                  title="Remove"
                  disabled={loading}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="upload-error">{error}</div>}

        {files.length > 0 && (
          <>
            {progress > 0 && (
              <div className="progress-wrap">
                <div className="progress-label">
                  <span>{progressMsg}</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar-wrap">
                  <div className="progress-bar" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
            <button
              className="upload-btn"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading
                ? `Processing ${files.length} document${files.length > 1 ? 's' : ''}…`
                : `Upload ${files.length} PDF${files.length > 1 ? 's' : ''} & Start Studying →`
              }
            </button>
          </>
        )}

      </section>
    </>
  )
}
