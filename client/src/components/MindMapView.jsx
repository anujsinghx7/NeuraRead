import { useState, useEffect, useRef, useCallback } from 'react'
import { executeMode } from '../api/client'
import Loader from './Loader'

const styles = `
.mindmap-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.mindmap-header {
  text-align: center;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--glass-border);
  background: rgba(5, 5, 16, 0.6);
  backdrop-filter: blur(16px);
  position: relative;
  z-index: 5;
  flex-shrink: 0;
}

.mindmap-header-icon {
  font-size: 32px;
  display: inline-block;
  margin-bottom: 8px;
  filter: drop-shadow(0 0 20px rgba(0, 212, 255, 0.5));
}

.mindmap-header h2 {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  color: var(--text);
  margin-bottom: 4px;
}

.mindmap-header p {
  font-size: 13px;
  color: var(--text-muted);
}

.mindmap-controls {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
}

.mm-ctrl-btn {
  padding: 6px 14px;
  background: var(--glass);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.mm-ctrl-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.mm-ctrl-btn.active {
  background: rgba(61, 255, 160, 0.08);
  border-color: rgba(61, 255, 160, 0.3);
  color: var(--accent);
}

/* SVG canvas area */
.mindmap-canvas {
  flex: 1;
  position: relative;
  cursor: grab;
  overflow: hidden;
}

.mindmap-canvas:active {
  cursor: grabbing;
}

.mindmap-canvas svg {
  width: 100%;
  height: 100%;
}

/* Tooltip */
.mm-tooltip {
  position: fixed;
  padding: 10px 16px;
  background: rgba(20, 20, 45, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-size: 12px;
  line-height: 1.6;
  max-width: 280px;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 0.2s ease;
}

.mm-tooltip-title {
  font-weight: 600;
  color: var(--accent);
  margin-bottom: 4px;
  font-size: 13px;
}

.mm-tooltip-desc {
  color: var(--text-muted);
}

/* Bottom toolbar */
.mindmap-footer {
  padding: 12px 24px;
  border-top: 1px solid var(--glass-border);
  background: rgba(5, 5, 16, 0.6);
  backdrop-filter: blur(16px);
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-shrink: 0;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 28px;
  background: linear-gradient(135deg, var(--cyan, #00d4ff), #0098cc);
  color: #050510;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 212, 255, 0.35);
}

.generate-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loader-center {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}

.error-box {
  padding: 16px 20px;
  background: rgba(255, 107, 107, 0.06);
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--radius);
  color: var(--danger);
  font-size: 14px;
  text-align: center;
  margin: 20px 24px;
}
`

// Color palette for depth levels
const DEPTH_COLORS = [
  { fill: '#3dffa0', glow: 'rgba(61, 255, 160, 0.4)', text: '#050510', border: '#2dd88a' },
  { fill: '#8b76f5', glow: 'rgba(139, 118, 245, 0.4)', text: '#ffffff', border: '#7a65e4' },
  { fill: '#00d4ff', glow: 'rgba(0, 212, 255, 0.4)', text: '#050510', border: '#00b8db' },
  { fill: '#ffc832', glow: 'rgba(255, 200, 50, 0.3)', text: '#050510', border: '#e6b32d' },
  { fill: 'rgba(255,255,255,0.15)', glow: 'rgba(255,255,255,0.1)', text: '#eae8e0', border: 'rgba(255,255,255,0.2)' },
]

function getColor(depth) {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)]
}

// Compute a tree layout with positions
function layoutTree(node, depth = 0, angle = 0, spread = Math.PI * 2, radius = 0) {
  const nodeRadius = depth === 0 ? 60 : depth === 1 ? 45 : depth === 2 ? 35 : 28
  const childDistance = depth === 0 ? 220 : depth === 1 ? 180 : depth === 2 ? 140 : 110

  const layoutNode = {
    ...node,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
    r: nodeRadius,
    depth,
    layoutChildren: [],
  }

  if (node.children && node.children.length > 0) {
    const childCount = node.children.length
    const childSpread = depth === 0 ? Math.PI * 2 : Math.min(spread, Math.PI * 0.8 * (childCount / 3))
    const startAngle = depth === 0 ? -Math.PI / 2 : angle - childSpread / 2

    node.children.forEach((child, i) => {
      const childAngle = childCount === 1
        ? angle
        : startAngle + (childSpread / (childCount - 1 || 1)) * i
      const childR = radius + childDistance
      const childLayout = layoutTree(child, depth + 1, childAngle, childSpread / childCount, childR)
      layoutNode.layoutChildren.push(childLayout)
    })
  }

  return layoutNode
}

// Flatten tree to arrays for rendering
function flattenTree(node) {
  const nodes = []
  const links = []

  function walk(n) {
    nodes.push(n)
    for (const child of n.layoutChildren) {
      links.push({ source: n, target: child })
      walk(child)
    }
  }
  walk(node)
  return { nodes, links }
}

// Calculate tree bounds
function treeBounds(nodes) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.r)
    maxX = Math.max(maxX, n.x + n.r)
    minY = Math.min(minY, n.y - n.r)
    maxY = Math.max(maxY, n.y + n.r)
  }
  return { minX, maxX, minY, maxY }
}

// Truncate text to fit
function truncateText(text, maxLen) {
  if (!text) return ''
  return text.length > maxLen ? text.slice(0, maxLen - 1) + '…' : text
}

export default function MindMapView({ docInfo }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tooltip, setTooltip] = useState(null)
  const [expandedNodes, setExpandedNodes] = useState(new Set())
  const [viewBox, setViewBox] = useState(null)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState(null)
  const [showAll, setShowAll] = useState(true)
  const svgRef = useRef()
  const containerRef = useRef()

  const sessionOrDocId = docInfo?.sessionId || docInfo?.documentId

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await executeMode('mindmap', sessionOrDocId)
      setData(res.data)
      // Initially expand all nodes
      setExpandedNodes(new Set())
      setShowAll(true)
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate mind map.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!data && !loading) generate()
  }, [])

  // Build filtered tree (respecting expand/collapse)
  const filterTree = useCallback((node, path = '0') => {
    const filtered = {
      ...node,
      children: (!showAll && !expandedNodes.has(path))
        ? []
        : (node.children || []).map((c, i) => filterTree(c, `${path}-${i}`)),
    }
    return filtered
  }, [expandedNodes, showAll])

  const toggleNode = (path) => {
    if (showAll) {
      // First click collapses all then expands just this one
      setShowAll(false)
      setExpandedNodes(new Set([path]))
    } else {
      setExpandedNodes(prev => {
        const next = new Set(prev)
        if (next.has(path)) {
          next.delete(path)
        } else {
          next.add(path)
        }
        return next
      })
    }
  }

  const expandAll = () => {
    setShowAll(true)
    setExpandedNodes(new Set())
  }

  // Pan & zoom
  const zoom = (factor) => {
    if (!viewBox) return
    const [x, y, w, h] = viewBox
    const nw = w * factor
    const nh = h * factor
    setViewBox([x - (nw - w) / 2, y - (nh - h) / 2, nw, nh])
  }

  const handleWheel = (e) => {
    e.preventDefault()
    zoom(e.deltaY > 0 ? 1.1 : 0.9)
  }

  const handleMouseDown = (e) => {
    if (e.target.closest('.mm-node-group')) return
    setIsPanning(true)
    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e) => {
    // Tooltip tracking is separate
    if (!isPanning || !viewBox) return
    const dx = e.clientX - panStart.x
    const dy = e.clientY - panStart.y
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const scale = viewBox[2] / rect.width
    setViewBox([viewBox[0] - dx * scale, viewBox[1] - dy * scale, viewBox[2], viewBox[3]])
    setPanStart({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsPanning(false)
  }

  // Render
  if (!data) {
    return (
      <>
        <style>{styles}</style>
        <div className="mindmap-layout">
          <div className="mindmap-header">
            <span className="mindmap-header-icon">🗺️</span>
            <h2>Mind Map</h2>
            <p>{docInfo?.filenames?.join(', ') || docInfo?.filename}</p>
          </div>
          {loading && <div className="loader-center"><Loader /></div>}
          {error && <div className="error-box">{error}</div>}
          {!loading && !error && (
            <div className="mindmap-footer">
              <button className="generate-btn" onClick={generate}>🗺️ Generate Mind Map</button>
            </div>
          )}
        </div>
      </>
    )
  }

  const filteredData = filterTree(data)
  const layout = layoutTree(filteredData)
  const { nodes, links } = flattenTree(layout)
  const bounds = treeBounds(nodes)
  const pad = 120
  const vbX = bounds.minX - pad
  const vbY = bounds.minY - pad
  const vbW = (bounds.maxX - bounds.minX) + pad * 2
  const vbH = (bounds.maxY - bounds.minY) + pad * 2

  // Initialize viewBox on first render
  const currentViewBox = viewBox || [vbX, vbY, vbW, vbH]

  // Reset view
  const resetView = () => {
    setViewBox([vbX, vbY, vbW, vbH])
  }

  return (
    <>
      <style>{styles}</style>
      <div className="mindmap-layout">

        <div className="mindmap-header">
          <span className="mindmap-header-icon">🗺️</span>
          <h2>Mind Map</h2>
          <p>{docInfo?.filenames?.join(', ') || docInfo?.filename}</p>
          <div className="mindmap-controls">
            <button className="mm-ctrl-btn" onClick={() => zoom(0.8)}>🔍+</button>
            <button className="mm-ctrl-btn" onClick={() => zoom(1.2)}>🔍−</button>
            <button className="mm-ctrl-btn" onClick={resetView}>⊡ Fit</button>
            <button className={`mm-ctrl-btn ${showAll ? 'active' : ''}`} onClick={expandAll}>
              ↕ Expand All
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="mindmap-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg
            ref={svgRef}
            viewBox={currentViewBox.join(' ')}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {DEPTH_COLORS.map((c, i) => (
                <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feFlood floodColor={c.glow} result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="shadow" />
                  <feMerge>
                    <feMergeNode in="shadow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              {/* Gradient for links */}
              {links.map((link, i) => {
                const sColor = getColor(link.source.depth)
                const tColor = getColor(link.target.depth)
                return (
                  <linearGradient key={i} id={`link-grad-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={sColor.fill} stopOpacity="0.6" />
                    <stop offset="100%" stopColor={tColor.fill} stopOpacity="0.3" />
                  </linearGradient>
                )
              })}
            </defs>

            {/* Links — curved bezier */}
            {links.map((link, i) => {
              const sx = link.source.x
              const sy = link.source.y
              const tx = link.target.x
              const ty = link.target.y
              const mx = (sx + tx) / 2
              const my = (sy + ty) / 2
              // Quadratic bezier: control point offset perpendicular
              const dx = tx - sx
              const dy = ty - sy
              const len = Math.sqrt(dx * dx + dy * dy) || 1
              const offset = len * 0.15
              const cx = mx + (dy / len) * offset
              const cy = my - (dx / len) * offset

              return (
                <path
                  key={i}
                  d={`M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`}
                  fill="none"
                  stroke={`url(#link-grad-${i})`}
                  strokeWidth={link.source.depth === 0 ? 3 : 2}
                  strokeLinecap="round"
                  opacity={0.7}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map((node, i) => {
              const color = getColor(node.depth)
              const path = getNodePath(layout, node)
              const hasChildren = (node.depth === 0 ? data : findOriginalNode(data, path))
              const origChildren = findOriginalChildren(data, path)
              const isCollapsed = !showAll && origChildren > 0 && (!node.layoutChildren || node.layoutChildren.length === 0)
              const maxChars = node.depth === 0 ? 25 : node.depth === 1 ? 20 : 16

              return (
                <g
                  key={i}
                  className="mm-node-group"
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (origChildren > 0) toggleNode(path)
                  }}
                  onMouseEnter={(e) => {
                    if (node.description || node.topic) {
                      setTooltip({
                        x: e.clientX + 12,
                        y: e.clientY - 10,
                        title: node.topic,
                        desc: node.description,
                      })
                    }
                  }}
                  onMouseMove={(e) => {
                    if (tooltip) {
                      setTooltip(prev => prev ? { ...prev, x: e.clientX + 12, y: e.clientY - 10 } : null)
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                >
                  {/* Glow circle behind */}
                  {node.depth <= 1 && (
                    <circle
                      r={node.r + 8}
                      fill="none"
                      stroke={color.fill}
                      strokeWidth="1"
                      opacity="0.15"
                    />
                  )}

                  {/* Main circle */}
                  <circle
                    r={node.r}
                    fill={node.depth === 0 ? color.fill : 'rgba(15, 15, 35, 0.85)'}
                    stroke={color.fill}
                    strokeWidth={node.depth === 0 ? 3 : 2}
                    filter={node.depth <= 1 ? `url(#glow-${node.depth})` : undefined}
                  />

                  {/* Collapse indicator */}
                  {isCollapsed && (
                    <circle
                      r={node.r + 4}
                      fill="none"
                      stroke={color.fill}
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.5"
                    />
                  )}

                  {/* Child count badge */}
                  {origChildren > 0 && node.depth > 0 && (
                    <g transform={`translate(${node.r - 6}, ${-node.r + 6})`}>
                      <circle r="9" fill={color.fill} opacity="0.9" />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill={color.text}
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="var(--font-body)"
                      >
                        {origChildren}
                      </text>
                    </g>
                  )}

                  {/* Label */}
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={node.depth === 0 ? color.text : color.fill}
                    fontSize={node.depth === 0 ? 13 : node.depth === 1 ? 11 : 10}
                    fontWeight={node.depth <= 1 ? 600 : 500}
                    fontFamily="var(--font-body)"
                    style={{ userSelect: 'none' }}
                  >
                    {wrapText(truncateText(node.topic, maxChars), node.r * 1.6).map((line, li) => (
                      <tspan key={li} x="0" dy={li === 0 ? `-${(wrapText(truncateText(node.topic, maxChars), node.r * 1.6).length - 1) * 0.55}em` : '1.15em'}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              )
            })}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div className="mm-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
              <div className="mm-tooltip-title">{tooltip.title}</div>
              {tooltip.desc && <div className="mm-tooltip-desc">{tooltip.desc}</div>}
            </div>
          )}
        </div>

        <div className="mindmap-footer">
          <button className="generate-btn" onClick={generate} disabled={loading}>
            {data ? '🔄 Regenerate' : '🗺️ Generate Mind Map'}
          </button>
        </div>

      </div>
    </>
  )
}

// Helpers

function wrapText(text, maxWidth) {
  if (!text) return ['']
  const words = text.split(' ')
  const lines = []
  let current = ''
  const charWidth = 6.5
  const maxCharsPerLine = Math.max(8, Math.floor(maxWidth / charWidth))

  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxCharsPerLine) {
      if (current) lines.push(current)
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) lines.push(current)
  return lines.length ? lines.slice(0, 3) : ['']
}

function getNodePath(layout, targetNode) {
  function search(node, path) {
    if (node === targetNode) return path
    for (let i = 0; i < (node.layoutChildren || []).length; i++) {
      const result = search(node.layoutChildren[i], `${path}-${i}`)
      if (result) return result
    }
    return null
  }
  return search(layout, '0') || '0'
}

function findOriginalNode(data, path) {
  const parts = path.split('-').slice(1).map(Number)
  let node = data
  for (const idx of parts) {
    if (!node.children || !node.children[idx]) return null
    node = node.children[idx]
  }
  return node
}

function findOriginalChildren(data, path) {
  const node = findOriginalNode(data, path)
  if (!node) return 0
  return (node.children || []).length
}
