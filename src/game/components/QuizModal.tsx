import { useEffect, useMemo, useRef, useState } from 'react'
import { useGame } from '../../context/GameContext'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

export default function QuizModal() {
  const { state, dispatch } = useGame()
  const { currentQuiz, quizAnswered, quizCorrect } = state

  if (!currentQuiz) return null

  const close = () => dispatch({ type: 'SET_PHASE', phase: 'exploring' })

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [localSubmitted, setLocalSubmitted] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)
  const primaryBtnRef = useRef<HTMLButtonElement | null>(null)

  // Reset local state when quiz changes
  useEffect(() => {
    setSelectedIndex(null)
    setLocalSubmitted(false)
  }, [currentQuiz?.id])

  const streakKey = 'osmon_quiz_streak'
  const currentStreak = useMemo(() => {
    const raw = sessionStorage.getItem(streakKey)
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0
  }, [])

  useEffect(() => {
    if (!quizAnswered) return
    const next = quizCorrect ? currentStreak + 1 : 0
    sessionStorage.setItem(streakKey, String(next))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizAnswered, quizCorrect])

  const canSubmit = selectedIndex !== null && !quizAnswered

  const submit = () => {
    if (!canSubmit || selectedIndex === null) return
    setLocalSubmitted(true)
    dispatch({ type: 'ANSWER_QUIZ', index: selectedIndex })
  }

  // Keyboard UX + basic focus trap
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!currentQuiz) return
      if (e.key === 'Escape') {
        close()
        return
      }
      if (quizAnswered) {
        if (e.key === 'Enter') close()
        return
      }

      const k = e.key.toLowerCase()
      const labelIdx = OPTION_LABELS.map(x => x.toLowerCase()).indexOf(k)
      if (labelIdx >= 0 && labelIdx < currentQuiz.options.length) {
        setSelectedIndex(labelIdx)
        return
      }
      if (e.key >= '1' && e.key <= '4') {
        const idx = Number(e.key) - 1
        if (idx >= 0 && idx < currentQuiz.options.length) setSelectedIndex(idx)
        return
      }
      if (e.key === 'Enter') {
        submit()
        return
      }
      if (e.key === 'Tab') {
        const root = modalRef.current
        if (!root) return
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')
        ).filter(el => !el.hasAttribute('disabled'))
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizAnswered, selectedIndex, currentQuiz?.id])

  useEffect(() => {
    if (quizAnswered) primaryBtnRef.current?.focus()
  }, [quizAnswered])

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)' }}>
      <style>{`
        @keyframes quizPopIn { from { opacity: 0; transform: translateY(10px) scale(0.99) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label="OS knowledge quiz"
        className="w-full max-w-2xl flex flex-col gap-4"
        style={{
          background: '#050510',
          border: '3px solid #7a44cc',
          padding: 24,
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'quizPopIn 180ms ease-out',
          boxShadow: '0 18px 60px rgba(0,0,0,0.55)',
        }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-pixel text-sm" style={{ color: '#7a44cc' }}>
              ⚡ OS KNOWLEDGE QUIZ
            </h2>
            <p className="font-pixel mt-1" style={{ fontSize: 8, color: '#667799' }}>
              TOPIC: {currentQuiz.topic.toUpperCase()} · +{currentQuiz.xpReward} XP
            </p>
            <p className="font-pixel mt-1" style={{ fontSize: 7, color: '#445566' }}>
              Select an answer (1–4 / A–D), then press Enter to confirm.
              {currentStreak > 0 ? `  Current streak: ${currentStreak}` : ''}
            </p>
          </div>
          <button className="font-pixel text-xs cursor-pointer"
            style={{ background: 'none', border: '1px solid #333', color: '#556', padding: '4px 8px' }}
            onClick={close}>✕</button>
        </div>

        {/* Question */}
        <div className="font-vt text-xl leading-relaxed p-4"
          style={{ background: '#0d0d1a', border: '2px solid #1a3a6e', color: '#eee', lineHeight: 1.65 }}>
          {currentQuiz.question}
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-2">
          {currentQuiz.options.map((opt, i) => {
            const isSelected = selectedIndex === i && !quizAnswered
            let bg = isSelected ? '#15224a' : '#101830'
            let borderCol = isSelected ? '#7a44cc' : '#1a3a6e'
            let color = '#eee'
            if (quizAnswered) {
              if (i === currentQuiz.correctIndex) {
                bg = '#0d2a0d'; borderCol = '#44bb44'; color = '#88ff88'
              } else if (i !== currentQuiz.correctIndex) {
                bg = '#1a0808'; borderCol = '#553333'; color = '#886666'
              }
            }
            return (
              <button
                key={i}
                className="font-pixel text-left cursor-pointer transition-all"
                disabled={quizAnswered}
                style={{ fontSize: 8, padding: '12px 14px', background: bg, border: `2px solid ${borderCol}`, color, lineHeight: 1.7 }}
                onMouseEnter={e => { if (!quizAnswered) (e.currentTarget as HTMLButtonElement).style.background = '#1a3a6e' }}
                onMouseLeave={e => { if (!quizAnswered) (e.currentTarget as HTMLButtonElement).style.background = bg }}
                onClick={() => { setSelectedIndex(i); setLocalSubmitted(false) }}>
                <span style={{ color: '#7a44cc', marginRight: 10 }}>[{OPTION_LABELS[i]}]</span>
                {opt}
              </button>
            )
          })}
        </div>

        {!quizAnswered && (
          <div className="flex items-center justify-between gap-3">
            <div className="font-pixel" style={{ fontSize: 7, color: '#556' }}>
              {selectedIndex === null
                ? 'Choose an option to continue.'
                : `Selected: [${OPTION_LABELS[selectedIndex]}]  (Enter to confirm)`}
            </div>
            <button
              className="font-pixel text-xs px-5 py-2 cursor-pointer clip-corner-sm"
              style={{
                background: canSubmit ? '#e8a020' : '#2a2a2a',
                color: canSubmit ? '#000' : '#666',
                border: 'none',
                opacity: localSubmitted ? 0.85 : 1,
              }}
              disabled={!canSubmit}
              onClick={submit}
            >
              CONFIRM ▶
            </button>
          </div>
        )}

        {/* Feedback */}
        {quizAnswered && (
          <div className="anim-fadeIn">
            <div className="font-pixel text-xs mb-2" style={{ color: quizCorrect ? '#88ff88' : '#ff8888' }}>
              {quizCorrect ? '✓ CORRECT! +' + currentQuiz.xpReward + ' XP' : '✗ INCORRECT — read the explanation, then continue'}
            </div>
            <div className="font-vt text-lg leading-relaxed p-4"
              style={{ background: '#0a0a1a', border: '1px solid #2a2a4a', color: '#aabbcc', whiteSpace: 'pre-line', lineHeight: 1.65 }}>
              {currentQuiz.explanation}
            </div>
            <button
              ref={primaryBtnRef}
              className="font-pixel text-xs mt-3 px-6 py-2 cursor-pointer clip-corner-sm"
              style={{ background: '#e8a020', color: '#000', border: 'none' }}
              onClick={close}>
              CONTINUE ▶
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
