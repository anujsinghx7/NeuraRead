import { useState, useEffect } from 'react'
import { executeMode } from '../api/client'
import Loader from './Loader'

const styles = `
.quiz-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-y: auto;
}

.quiz-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 24px 60px;
  width: 100%;
}

.quiz-header {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeInUp 0.6s ease-out;
}

.quiz-header-icon {
  font-size: 40px;
  display: inline-block;
  margin-bottom: 12px;
  filter: drop-shadow(0 0 20px rgba(139, 118, 245, 0.5));
}

.quiz-header h2 {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 400;
  color: var(--text);
  margin-bottom: 8px;
}

.quiz-header p {
  font-size: 14px;
  color: var(--text-muted);
}

/* Progress bar */
.quiz-progress {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 10px;
  margin-bottom: 32px;
  overflow: hidden;
}

.quiz-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--purple));
  border-radius: 10px;
  transition: width 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  box-shadow: 0 0 10px rgba(61, 255, 160, 0.3);
}

/* Score banner */
.quiz-score {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  animation: fadeInUp 0.5s ease-out;
}

.score-card {
  padding: 12px 24px;
  background: var(--glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  text-align: center;
  min-width: 80px;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--accent);
}

.score-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-top: 2px;
}

/* Question card */
.question-card {
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.5s ease-out;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.question-num {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
}

.difficulty-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.difficulty-Easy {
  background: rgba(61, 255, 160, 0.1);
  color: var(--accent);
  border: 1px solid rgba(61, 255, 160, 0.2);
}

.difficulty-Medium {
  background: rgba(255, 200, 50, 0.1);
  color: #ffc832;
  border: 1px solid rgba(255, 200, 50, 0.2);
}

.difficulty-Hard {
  background: rgba(255, 107, 107, 0.1);
  color: var(--danger);
  border: 1px solid rgba(255, 107, 107, 0.2);
}

.question-text {
  font-size: 16px;
  font-weight: 500;
  color: var(--text);
  line-height: 1.6;
  margin-bottom: 20px;
}

/* Options */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-sm);
  color: var(--text);
  font-family: var(--font-body);
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: all 0.25s ease;
}

.option-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

.option-btn:disabled {
  cursor: default;
}

.option-btn.selected {
  border-color: rgba(139, 118, 245, 0.4);
  background: rgba(139, 118, 245, 0.08);
}

.option-btn.correct {
  border-color: rgba(61, 255, 160, 0.5);
  background: rgba(61, 255, 160, 0.08);
  color: var(--accent);
}

.option-btn.wrong {
  border-color: rgba(255, 107, 107, 0.5);
  background: rgba(255, 107, 107, 0.08);
  color: var(--danger);
}

.option-key {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
  flex-shrink: 0;
}

.option-btn.correct .option-key {
  background: rgba(61, 255, 160, 0.15);
}

.option-btn.wrong .option-key {
  background: rgba(255, 107, 107, 0.15);
}

/* Explanation */
.explanation-box {
  margin-top: 16px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--glass-border);
  border-left: 2px solid var(--accent);
  border-radius: var(--radius-sm);
  font-size: 13px;
  line-height: 1.7;
  color: var(--text-muted);
  animation: fadeInUp 0.3s ease;
}

.explanation-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

/* Buttons */
.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--purple), #6a5acd);
  color: #fff;
  border: none;
  border-radius: var(--radius);
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(139, 118, 245, 0.25);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(139, 118, 245, 0.35);
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

/* Final result */
.quiz-result {
  text-align: center;
  padding: 40px 20px;
  background: var(--glass);
  backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius);
  margin-top: 20px;
  animation: fadeInUp 0.5s ease;
}

.result-emoji {
  font-size: 60px;
  display: block;
  margin-bottom: 16px;
}

.result-title {
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--text);
  margin-bottom: 8px;
}

.result-score {
  font-size: 18px;
  color: var(--accent);
  font-weight: 600;
}
`

export default function QuizView({ docInfo }) {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [answers, setAnswers] = useState({})       // { qId: 'A' }
  const [revealed, setRevealed] = useState({})      // { qId: true }

  const answered = Object.keys(answers).length
  const total = questions.length
  const correct = questions.filter(q => answers[q.id] === q.correct_answer).length

  const generate = async () => {
    const sessionOrDocId = docInfo?.sessionId || docInfo?.documentId
    setLoading(true)
    setError('')
    setAnswers({})
    setRevealed({})
    try {
      const res = await executeMode('quiz', sessionOrDocId)
      setQuestions(res.data.questions || [])
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate quiz.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (questions.length === 0 && !loading) generate()
  }, [])

  const selectAnswer = (qId, key) => {
    if (revealed[qId]) return
    setAnswers(prev => ({ ...prev, [qId]: key }))
    setRevealed(prev => ({ ...prev, [qId]: true }))
  }

  const getOptionClass = (q, key) => {
    if (!revealed[q.id]) {
      return answers[q.id] === key ? 'selected' : ''
    }
    if (key === q.correct_answer) return 'correct'
    if (key === answers[q.id] && key !== q.correct_answer) return 'wrong'
    return ''
  }

  return (
    <>
      <style>{styles}</style>
      <div className="quiz-layout">
        <div className="quiz-container">

          <div className="quiz-header">
            <span className="quiz-header-icon">🧠</span>
            <h2>Knowledge Quiz</h2>
            <p>{(docInfo?.filenames || [docInfo?.filename]).join(', ')} — {total} questions</p>
          </div>

          {loading && <div className="loader-center"><Loader /></div>}
          {error && <div className="error-box">{error}</div>}

          {questions.length > 0 && (
            <>
              {/* Progress */}
              <div className="quiz-progress">
                <div className="quiz-progress-fill" style={{ width: `${total ? (answered / total) * 100 : 0}%` }} />
              </div>

              {/* Score */}
              <div className="quiz-score">
                <div className="score-card">
                  <div className="score-value">{answered}</div>
                  <div className="score-label">Answered</div>
                </div>
                <div className="score-card">
                  <div className="score-value" style={{ color: 'var(--accent)' }}>{correct}</div>
                  <div className="score-label">Correct</div>
                </div>
                <div className="score-card">
                  <div className="score-value" style={{ color: 'var(--danger)' }}>{answered - correct}</div>
                  <div className="score-label">Wrong</div>
                </div>
              </div>

              {/* Questions */}
              {questions.map((q) => (
                <div key={q.id} className="question-card">
                  <div className="question-meta">
                    <span className="question-num">Q{q.id}</span>
                    <span className={`difficulty-badge difficulty-${q.difficulty}`}>{q.difficulty}</span>
                  </div>
                  <p className="question-text">{q.question}</p>

                  <div className="options-list">
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <button
                        key={key}
                        className={`option-btn ${getOptionClass(q, key)}`}
                        onClick={() => selectAnswer(q.id, key)}
                        disabled={revealed[q.id]}
                      >
                        <span className="option-key">{key}</span>
                        <span>{value}</span>
                      </button>
                    ))}
                  </div>

                  {revealed[q.id] && q.explanation && (
                    <div className="explanation-box">
                      <div className="explanation-label">Explanation</div>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}

              {/* Final result */}
              {answered === total && total > 0 && (
                <div className="quiz-result">
                  <span className="result-emoji">{correct / total >= 0.7 ? '🎉' : correct / total >= 0.4 ? '📚' : '💪'}</span>
                  <h3 className="result-title">
                    {correct / total >= 0.7 ? 'Excellent!' : correct / total >= 0.4 ? 'Good effort!' : 'Keep studying!'}
                  </h3>
                  <p className="result-score">{correct} / {total} correct ({Math.round(correct / total * 100)}%)</p>
                </div>
              )}

              {/* Regenerate */}
              <button className="generate-btn" onClick={generate} disabled={loading} style={{ marginTop: 24 }}>
                🔄 Generate New Quiz
              </button>
            </>
          )}

          {!questions.length && !loading && !error && (
            <button className="generate-btn" onClick={generate}>
              🧠 Generate Quiz
            </button>
          )}

        </div>
      </div>
    </>
  )
}
