'use client'

import {useCallback, useEffect, useMemo, useReducer} from 'react'
import styles from './FlashCards.module.css'
import Toggle from '@/app/components/Toggle'

export interface WordEntry {
  english: string
  romanized: string
  pronunciation?: string
  devanagari?: string
  tags?: string[] | null
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

      const newIdx = state.idx + 1
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
  const cards = useMemo(() => normalizeCards(words), [words])

  const [state, dispatch] = useReducer(reducer, cards, buildInitialState)

  const {queue, idx, showingFront, currentCard, stats, sideIsEnglish, forceEnglish, done} = state

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
      devLine = sideIsEnglish ? '' : dev
    } else {
      primaryText = sideIsEnglish ? nep : en
      pronLine = sideIsEnglish ? pron : ''
      devLine = sideIsEnglish ? dev : ''
    }
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
          checked={forceEnglish}
          onChange={() => dispatch({type: 'TOGGLE_FORCE_ENGLISH'})}
          label="Always English first"
        />
        <button
          className={styles.btn}
          onClick={() => dispatch({type: 'RESTART', queue: shuffle(cards)})}
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
            onClick={() => dispatch({type: 'RESTART', queue: shuffle(cards)})}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

/* CSS lives in FlashCards.module.css */
const _PLACEHOLDER = ''
