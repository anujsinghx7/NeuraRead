import { useState } from 'react'
import PDFUploader from './components/PDFUploader'
import ChatBox from './components/ChatBox'
import ModeSidebar from './components/ModeSidebar'
import SummaryView from './components/SummaryView'
import QuizView from './components/QuizView'
import MindMapView from './components/MindMapView'

const appStyles = `
.app-layout {
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
`

export default function App() {
  const [docInfo, setDocInfo] = useState(null)
  const [activeMode, setActiveMode] = useState('qa')

  if (!docInfo) {
    return <PDFUploader onUploadSuccess={setDocInfo} />
  }

  const renderModeView = () => {
    switch (activeMode) {
      case 'qa':
        return <ChatBox docInfo={docInfo} onReset={() => setDocInfo(null)} />
      case 'summary':
        return <SummaryView docInfo={docInfo} onReset={() => setDocInfo(null)} />
      case 'quiz':
        return <QuizView docInfo={docInfo} onReset={() => setDocInfo(null)} />
      case 'mindmap':
        return <MindMapView docInfo={docInfo} onReset={() => setDocInfo(null)} />
      default:
        return <ChatBox docInfo={docInfo} onReset={() => setDocInfo(null)} />
    }
  }

  return (
    <>
      <style>{appStyles}</style>
      <div className="app-layout">
        <ModeSidebar
          activeMode={activeMode}
          onModeChange={setActiveMode}
          docInfo={docInfo}
          onReset={() => setDocInfo(null)}
        />
        <div className="app-main">
          {renderModeView()}
        </div>
      </div>
    </>
  )
}
