import { useEffect } from 'react'
import { useGame } from '../../context/GameContext'

const AREA_COLORS: Record<string, string> = {
  'CPU Valley':        '#44aaff',
  'Process Plains':    '#44ff88',
  'Memory Mountains':  '#8866ff',
  'File Forest':       '#44cc44',
  'Sync Sanctuary':    '#cc44ff',
  'Network Nexus':     '#00ccff',
  'Kernel Castle':     '#ff6600',
}

function HpBar({ cur, max }: { cur: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (cur / max) * 100))
  const col = pct > 50 ? '#3db83d' : pct > 20 ? '#d4a017' : '#c82020'
  return (
    <div style={{ height: 5, background: 'rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: col, transition: 'width 0.35s ease', borderRadius: 2 }} />
    </div>
  )
}

export default function GameUI() {
  const { state, dispatch } = useGame()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (['input','textarea','button','select'].includes(tag)) return
      if (e.key === 'Escape') {
        if (state.phase === 'inventory' || state.phase === 'quiz')
          dispatch({ type: 'SET_PHASE', phase: 'exploring' })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.phase, dispatch])

  if (state.phase !== 'exploring') return null

  const areaColor = AREA_COLORS[state.currentArea] ?? '#e8a020'
  const party = state.party

  return (
    <>
      {/* ── TOP-LEFT: Area name ─────────────────────────────────────────── */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none"
        style={{ animation: 'fadeIn 0.4s ease-out' }}>
        <div style={{
          background: 'rgba(4,4,16,0.82)',
          border: `1px solid ${areaColor}44`,
          borderLeft: `3px solid ${areaColor}`,
          padding: '6px 14px 6px 12px',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="font-pixel" style={{ fontSize: 9, color: areaColor, letterSpacing: '0.08em' }}>
            {state.currentArea.toUpperCase()}
          </div>
          <div className="font-vt" style={{ fontSize: 13, color: '#556688', marginTop: 1 }}>
            {state.caught.size}/{18} caught
          </div>
        </div>
      </div>

      {/* ── TOP-RIGHT: Controls + Menu btn ─────────────────────────────── */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <div style={{
          background: 'rgba(4,4,16,0.75)',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '5px 10px',
          backdropFilter: 'blur(8px)',
        }}>
          <div className="font-pixel" style={{ fontSize: 6, color: '#445566', lineHeight: 2.0 }}>
            WASD MOVE · E TALK · SPACE MENU
          </div>
        </div>
        <button
          className="font-pixel cursor-pointer"
          style={{
            fontSize: 8, padding: '7px 14px',
            background: 'rgba(4,4,16,0.85)',
            color: areaColor,
            border: `1px solid ${areaColor}66`,
            backdropFilter: 'blur(8px)',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = `${areaColor}22`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(4,4,16,0.85)')}
          onClick={() => dispatch({ type: 'SET_PHASE', phase: 'inventory' })}>
          MENU
        </button>
      </div>

      {/* ── BOTTOM-LEFT: Party HP bars ───────────────────────────────────── */}
      {party.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1.5 pointer-events-none"
          style={{ animation: 'fadeIn 0.4s ease-out' }}>
          {party.slice(0, 4).map((mon, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(4,4,16,0.82)',
              border: `1px solid rgba(255,255,255,0.07)`,
              padding: '5px 10px',
              minWidth: 170,
              backdropFilter: 'blur(8px)',
            }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: mon.curHp > mon.maxHp * 0.5 ? '#3db83d' : mon.curHp > mon.maxHp * 0.2 ? '#d4a017' : '#c82020',
                flexShrink: 0,
              }} />
              <div className="font-pixel" style={{ fontSize: 7, color: '#aabbcc', minWidth: 64, overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {mon.name.slice(0, 9)}
              </div>
              <div style={{ flex: 1 }}>
                <HpBar cur={mon.curHp} max={mon.maxHp} />
              </div>
              <div className="font-pixel" style={{ fontSize: 6, color: '#445566', minWidth: 28, textAlign: 'right' }}>
                {mon.curHp}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BOTTOM-RIGHT: Item quick counts ─────────────────────────────── */}
      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <div style={{
          background: 'rgba(4,4,16,0.82)',
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '6px 12px',
          backdropFilter: 'blur(8px)',
          display: 'flex', gap: 14, alignItems: 'center',
        }}>
          <div className="text-center">
            <div className="font-pixel" style={{ fontSize: 6, color: '#445' }}>KBALL</div>
            <div className="font-pixel" style={{ fontSize: 11, color: '#88ccff' }}>{state.items.kernelball}</div>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
          <div className="text-center">
            <div className="font-pixel" style={{ fontSize: 6, color: '#445' }}>SBALL</div>
            <div className="font-pixel" style={{ fontSize: 11, color: '#aaddff' }}>{state.items.superball}</div>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }} />
          <div className="text-center">
            <div className="font-pixel" style={{ fontSize: 6, color: '#445' }}>POT</div>
            <div className="font-pixel" style={{ fontSize: 11, color: '#88ff88' }}>{state.items.potion}</div>
          </div>
        </div>
      </div>

      {/* ── CENTER: encounter prompt (tall grass indicator) ──────────────── */}
      {/* This is subtle — shown when player is on tall grass */}
    </>
  )
}
