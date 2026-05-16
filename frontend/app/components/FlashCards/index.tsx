'use client'

import {useCallback, useEffect, useReducer, useRef} from 'react'
import styles from './FlashCards.module.css'
import Toggle from '@/app/components/Toggle'

export interface WordEntry {
  english: string
  romanized: string
  pronunciation?: string
  devanagari?: string
  tags?: string[]
}

interface Card {
  en: string
  nep: string
  pron: string
  dev: string | null
}

interface Stats {
  correct: number
  wrong: number
}

interface State {
  queue: Card[]
  wrongTail: Card[]
  idx: number
  showingFront: boolean
  currentCard: Card | null
  stats: Stats
  sideIsEnglish: boolean
  showDevanagari: boolean
  forceEnglish: boolean
  done: boolean
}

type Action =
  | {type: 'FLIP'}
  | {type: 'NEXT'; correct: boolean}
  | {type: 'RESTART'; queue: Card[]}
  | {type: 'TOGGLE_DEV'}
  | {type: 'TOGGLE_FORCE_ENGLISH'}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickSide(forceEnglish: boolean): boolean {
  return forceEnglish ? true : Math.random() < 0.5
}

function buildInitialState(cards: Card[], forceEnglish = false, showDevanagari = false): State {
  const queue = shuffle(cards)
  const sideIsEnglish = pickSide(forceEnglish)
  return {
    queue,
    wrongTail: [],
    idx: 0,
    showingFront: true,
    currentCard: queue[0] ?? null,
    stats: {correct: 0, wrong: 0},
    sideIsEnglish,
    showDevanagari,
    forceEnglish,
    done: queue.length === 0,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FLIP':
      return {...state, showingFront: !state.showingFront}

    case 'NEXT': {
      const stats = {
        correct: state.stats.correct + (action.correct ? 1 : 0),
        wrong: state.stats.wrong + (action.correct ? 0 : 1),
      }
      const wrongTail = action.correct
        ? state.wrongTail
        : [...state.wrongTail, {...state.currentCard!}]

      let newIdx = state.idx + 1
      let newQueue = state.queue
      let done = false

      if (newIdx >= newQueue.length) {
        if (wrongTail.length > 0) {
          newQueue = [...newQueue, ...wrongTail]
        } else {
          done = true
        }
      }

      const currentCard = done ? null : (newQueue[newIdx] ?? null)
      const sideIsEnglish = pickSide(state.forceEnglish)

      return {
        ...state,
        queue: newQueue,
        wrongTail: action.correct ? state.wrongTail : [],
        idx: newIdx,
        showingFront: true,
        currentCard,
        stats,
        sideIsEnglish,
        done,
      }
    }

    case 'RESTART':
      return buildInitialState(action.queue, state.forceEnglish, state.showDevanagari)

    case 'TOGGLE_DEV':
      return {...state, showDevanagari: !state.showDevanagari}

    case 'TOGGLE_FORCE_ENGLISH':
      return {...state, forceEnglish: !state.forceEnglish}

    default:
      return state
  }
}

function normalizeCards(words: WordEntry[]): Card[] {
  return words.map((w) => ({
    en: w.english,
    nep: w.romanized,
    pron: w.pronunciation ?? w.romanized,
    dev: w.devanagari ?? null,
  }))
}

interface FlashCardsProps {
  words: WordEntry[]
}

export default function FlashCards({words}: FlashCardsProps) {
  const cards = useRef<Card[]>(normalizeCards(words))

  const [state, dispatch] = useReducer(reducer, undefined, () => buildInitialState(cards.current))

  const {
    queue,
    idx,
    showingFront,
    currentCard,
    stats,
    sideIsEnglish,
    showDevanagari,
    forceEnglish,
    done,
  } = state

  const total = queue.length + (state.wrongTail.length > 0 && idx < queue.length ? 0 : 0)
  const queueTotal = queue.length
  const attempts = stats.correct + stats.wrong
  const accuracy = attempts ? Math.round((100 * stats.correct) / attempts) : null
  const progress = queueTotal ? (100 * idx) / queueTotal : 0

  let primaryText = ''
  let pronLine = ''
  let devLine: string | null = null

  if (currentCard) {
    const {en, nep, pron, dev} = currentCard
    if (showingFront) {
      primaryText = sideIsEnglish ? en : nep
      pronLine = sideIsEnglish ? '' : pron
    } else {
      primaryText = sideIsEnglish ? nep : en
      pronLine = sideIsEnglish ? pron : ''
    }
    if (showDevanagari && dev) devLine = dev
  }

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (done) return
      if (e.key === 'ArrowLeft' || e.key === ' ') {
        e.preventDefault()
        dispatch({type: 'FLIP'})
      } else if (e.key === 'ArrowRight') {
        dispatch({type: 'NEXT', correct: true})
      } else if (e.key === 'w' || e.key === 'W') {
        dispatch({type: 'NEXT', correct: false})
      }
    },
    [done],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className={styles.root}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <Toggle
          checked={showDevanagari}
          onChange={() => dispatch({type: 'TOGGLE_DEV'})}
          label="Devanagari"
        />
        <Toggle
          checked={forceEnglish}
          onChange={() => dispatch({type: 'TOGGLE_FORCE_ENGLISH'})}
          label="Always English first"
        />
        <button
          className={styles.btn}
          onClick={() => dispatch({type: 'RESTART', queue: shuffle(cards.current)})}
        >
          Restart
        </button>
      </div>

      {/* Progress */}
      <div className={styles.stats}>
        <div className={styles.progressWrap}>
          <div className={styles.bar} style={{width: `${progress}%`}} />
        </div>
        <span className={styles.small}>
          {idx} / {queueTotal}
        </span>
        <span className={styles.small}>
          {accuracy !== null ? `Accuracy: ${accuracy}%` : 'Accuracy: —'}
        </span>
      </div>

      {/* Card */}
      {!done ? (
        <>
          <div
            className={styles.card}
            onClick={() => dispatch({type: 'FLIP'})}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') dispatch({type: 'FLIP'})
            }}
            role="button"
            aria-label="Flip card"
          >
            <div className={`${styles.hint} ${styles.small}`}>← Flip · → Next · W Wrong</div>
            {devLine && <div className={styles.dev}>{devLine}</div>}
            <div className={styles.side}>{primaryText || 'Tap to flip'}</div>
            {pronLine && <div className={styles.pron}>{pronLine}</div>}
          </div>

          <div className={styles.controls}>
            <button className={styles.btn} onClick={() => dispatch({type: 'FLIP'})}>
              Flip <span className={styles.desktop}>(←)</span>
            </button>
            <button
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => dispatch({type: 'NEXT', correct: true})}
            >
              Next <span className={styles.desktop}>(→)</span>
            </button>
            <button
              className={`${styles.btn} ${styles.btnBad}`}
              onClick={() => dispatch({type: 'NEXT', correct: false})}
            >
              Mark Wrong <span className={styles.desktop}>(W)</span>
            </button>
          </div>
        </>
      ) : (
        <div className={styles.end}>
          <h3>Great job! 🎉</h3>
          <div className={styles.summary}>
            <div>
              Cards completed: <b>{attempts}</b>
            </div>
            <div>
              Correct: <b className={styles.good}>{stats.correct}</b>
            </div>
            <div>
              Wrong (reviewed): <b className={styles.bad}>{stats.wrong}</b>
            </div>
            <div>
              Accuracy: <b>{attempts ? Math.round((100 * stats.correct) / attempts) : 0}%</b>
            </div>
          </div>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={() => dispatch({type: 'RESTART', queue: shuffle(cards.current)})}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

/* CSS lives in FlashCards.module.css */
const _PLACEHOLDER = `
.fc-root {
  --fc-bg: #ffffff;
  --fc-fg: #111111;
  --fc-muted: #666;
  --fc-card: #f7f7f9;
  --fc-accent: #4b7bec;
  --fc-accent-weak: #dfe7ff;
  --fc-good: #2ecc71;
  --fc-bad: #e74c3c;
  --fc-shadow: 0 6px 18px rgba(0,0,0,0.08);
  background: var(--fc-bg);
  color: var(--fc-fg);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  max-width: 720px;
  margin: 0 auto;
}
.fc-root.dark {
  --fc-bg: #0f1115;
  --fc-fg: #f5f7ff;
  --fc-muted: #aab1c6;
  --fc-card: #171a21;
  --fc-accent: #7aa2ff;
  --fc-accent-weak: #233055;
  --fc-good: #47e6a1;
  --fc-bad: #ff6b6b;
  --fc-shadow: 0 6px 18px rgba(0,0,0,0.35);
}
.fc-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  justify-content: flex-end;
}
.fc-toggle-label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 0.9rem;
  color: var(--fc-muted);
  cursor: pointer;
}
.fc-tog {
  appearance: none;
  width: 44px;
  height: 28px;
  border-radius: 99px;
  background: var(--fc-accent-weak);
  position: relative;
  cursor: pointer;
  border: 1px solid rgba(127,127,127,0.25);
  flex-shrink: 0;
}
.fc-tog:checked { background: var(--fc-accent); }
.fc-tog::before {
  content: '';
  position: absolute;
  top: 2px; left: 2px;
  width: 22px; height: 22px;
  background: #fff;
  border-radius: 50%;
  transition: transform 0.18s ease;
  box-shadow: var(--fc-shadow);
}
.fc-tog:checked::before { transform: translateX(16px); }
.fc-stats {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
}
.fc-progress-wrap {
  height: 10px;
  background: var(--fc-accent-weak);
  border-radius: 999px;
  overflow: hidden;
}
.fc-bar {
  height: 100%;
  background: var(--fc-accent);
  transition: width 0.3s ease;
}
.fc-small {
  font-size: 0.85rem;
  color: var(--fc-muted);
}
.fc-card {
  width: min(680px, 92vw);
  min-height: 36vh;
  background: var(--fc-card);
  border-radius: 18px;
  box-shadow: var(--fc-shadow);
  padding: 24px 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  cursor: pointer;
  user-select: none;
}
.fc-card:focus-visible { outline: 2px solid var(--fc-accent); }
.fc-hint {
  margin-bottom: 8px;
}
.fc-dev {
  font-size: clamp(1.05rem, 4.6vw, 1.25rem);
  margin-bottom: 8px;
}
.fc-side {
  font-size: clamp(1.35rem, 6vw, 2rem);
  font-weight: 700;
  margin: 4px 0;
}
.fc-pron {
  font-size: clamp(1rem, 4.2vw, 1.15rem);
  color: var(--fc-muted);
  margin-top: 6px;
}
.fc-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}
.fc-btn {
  border-radius: 12px;
  border: 1px solid rgba(127,127,127,0.25);
  background: var(--fc-card);
  color: var(--fc-fg);
  padding: 10px 16px;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--fc-shadow);
  transition: transform 0.06s ease;
  min-width: 110px;
}
.fc-btn:active { transform: translateY(1px); }
.fc-btn-primary { background: var(--fc-accent); color: white; border-color: transparent; }
.fc-btn-bad { background: var(--fc-bad); color: white; border-color: transparent; }
.fc-end {
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
  background: var(--fc-card);
  padding: 28px;
  border-radius: 16px;
  box-shadow: var(--fc-shadow);
  width: min(680px, 92vw);
}
.fc-summary { display: flex; flex-direction: column; gap: 6px; text-align: center; }
.fc-good { color: var(--fc-good); }
.fc-bad { color: var(--fc-bad); }
.fc-desktop { font-size: 0.8em; opacity: 0.6; }
@media (max-width: 600px) { .fc-desktop { display: none; } }
`
