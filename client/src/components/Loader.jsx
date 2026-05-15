import { useEffect, useState } from 'react'

const messages = [
  'Reading your document…',
  'Finding relevant passages…',
  'Thinking carefully…',
  'Almost there…',
]

const styles = `
.loader-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 28px 0 8px;
}

/* 3D Orbiting ring container */
.orbit-container {
  position: relative;
  width: 60px;
  height: 60px;
  perspective: 400px;
}

/* Pulsing ring background */
.orbit-ring {
  position: absolute;
  inset: 5px;
  border-radius: 50%;
  border: 1.5px solid rgba(61, 255, 160, 0.15);
  animation: ring-pulse 2s ease-in-out infinite;
}

@keyframes ring-pulse {
  0%, 100% {
    transform: scale(1);
    border-color: rgba(61, 255, 160, 0.1);
    box-shadow: 0 0 10px rgba(61, 255, 160, 0.05);
  }
  50% {
    transform: scale(1.1);
    border-color: rgba(61, 255, 160, 0.25);
    box-shadow: 0 0 20px rgba(61, 255, 160, 0.1);
  }
}

/* Orbiting orbs */
.orbit-track {
  position: absolute;
  inset: 0;
  animation: orbit-spin 2.4s linear infinite;
}

.orbit-track:nth-child(3) {
  animation-delay: -0.8s;
  animation-duration: 2.8s;
}

.orbit-track:nth-child(4) {
  animation-delay: -1.6s;
  animation-duration: 3.2s;
}

@keyframes orbit-spin {
  from { transform: rotateX(60deg) rotateZ(0deg); }
  to   { transform: rotateX(60deg) rotateZ(360deg); }
}

.orb {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  top: -4px;
  left: 50%;
  margin-left: -4px;
  filter: blur(0.5px);
}

.orb-green {
  background: var(--accent);
  box-shadow: 0 0 12px var(--accent), 0 0 24px rgba(61, 255, 160, 0.4);
}

.orb-purple {
  background: var(--purple);
  box-shadow: 0 0 12px var(--purple), 0 0 24px rgba(139, 118, 245, 0.4);
}

.orb-cyan {
  background: var(--cyan, #00d4ff);
  box-shadow: 0 0 12px var(--cyan, #00d4ff), 0 0 24px rgba(0, 212, 255, 0.4);
}

/* Center glow */
.orbit-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--accent), transparent);
  animation: center-glow 1.4s ease-in-out infinite;
}

@keyframes center-glow {
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.8; transform: translate(-50%, -50%) scale(1.5); }
}

.loader-msg {
  font-size: 13px;
  color: var(--text-muted);
  font-style: italic;
  animation: fadeMsg 0.5s ease;
  text-shadow: 0 0 20px rgba(61, 255, 160, 0.1);
}

@keyframes fadeMsg {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
`

export default function Loader() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => {
      setMsgIndex(i => (i + 1) % messages.length)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <>
      <style>{styles}</style>
      <div className="loader-wrap">
        <div className="orbit-container">
          <div className="orbit-ring" />
          <div className="orbit-track"><div className="orb orb-green" /></div>
          <div className="orbit-track"><div className="orb orb-purple" /></div>
          <div className="orbit-track"><div className="orb orb-cyan" /></div>
          <div className="orbit-center" />
        </div>
        <p className="loader-msg" key={msgIndex}>{messages[msgIndex]}</p>
      </div>
    </>
  )
}
