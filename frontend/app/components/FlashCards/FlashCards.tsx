'use client'
import {useState} from 'react'
import Card from '../Card'
import ProgressBar from '../ProgressBar/ProgressBar'
import CardButton from '../CardButton/CardButton'
import {FaArrowRotateLeft, FaArrowRotateRight, FaRegFaceSmile, FaRotate} from 'react-icons/fa6'
type Word = {
  devanagari: string
  transliteration: string
  translation: string
}
type FlashCard =
  | {
      devanagari: string
      transliteration: string
      example: Word
    }
  | {
      devanagari: string
      transliteration: string
      translation: string
      pronunciation: string
      audio: string
    }

import styles from './FlashCards.module.css'
import Devanagari from './components/Devanagari'
import Word from './components/Word'
type FlashCardsProps = {
  type: 'devanagari' | 'word'
  cards?: FlashCard[]
  className?: string
}

export default function FlashCards({cards, type, className}: FlashCardsProps) {
  const [cardsState, setCardsState] = useState<FlashCard[] | undefined>(cards)
  const [flipped, setFlipped] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)

  const again = () => {
    setCardsState((prev) => {
      if (!prev) return prev
      const newCards = [...prev]
      const currentCardData = newCards[currentCard]
      console.log([...newCards, currentCardData])
      return [...newCards, currentCardData]
    })
    nextCard()
  }
  const nextCard = () => {
    setFlipped(false)
    setAnsweredCount((prev) => prev + 1)
    setCurrentCard((prev) => prev + 1)
  }
  const markCorrectAndNext = () => {
    setCorrectCount((prev) => prev + 1)
    nextCard()
  }
  return (
    <div className={[styles.container, className].filter(Boolean).join(' ')}>
      <span>
        {Math.min(currentCard + 1, cardsState?.length || 0)} / {cardsState?.length}
      </span>
      <ProgressBar progress={(currentCard / (cardsState?.length || 1)) * 100} size="medium" />
      {currentCard < (cardsState?.length || 0) ? (
        <Card onClick={() => setFlipped(!flipped)} className={styles.card}>
          {!flipped ? (
            <div className={styles.testingSide}>
              <span
                lang="ne"
                className={[styles.devanagari, type === 'devanagari' ? styles.large : ''].join(' ')}
              >
                {cardsState?.[currentCard]?.devanagari}
              </span>
              {type === 'word' && (
                <span className={styles.transliteration}>
                  {cardsState[currentCard].transliteration}
                </span>
              )}
            </div>
          ) : (
            <>
              {type === 'devanagari' ? <Devanagari {...cardsState[currentCard]} /> : null}
              {type === 'word' ? <Word {...cardsState[currentCard]} /> : null}
            </>
          )}
        </Card>
      ) : (
        <Card className={[styles.card].join(' ')}>
          <div className={styles.finishCard}>
            <h2 className={styles.finishTitle}>All done!</h2>
            <p className={styles.finishText}>You've gone through all the cards.</p>
            {answeredCount > 0 ? (
              <div className={styles.score}>
                <strong>Score:</strong> {Math.round((correctCount / answeredCount) * 100)}% (
                {correctCount} / {answeredCount})
              </div>
            ) : null}
          </div>
        </Card>
      )}
      <div className={styles.actions}>
        {currentCard < (cardsState?.length || 0) ? (
          <>
            <CardButton
              onClick={again}
              disabled={!flipped}
              color="#f50b0b"
              icon={<FaArrowRotateRight />}
              title="Again"
            />
            <CardButton
              onClick={() => setFlipped(!flipped)}
              color="#f59e0b"
              icon={<FaRotate />}
              title="Flip"
            />
            <CardButton
              onClick={markCorrectAndNext}
              disabled={!flipped}
              color="#10B981"
              icon={<FaRegFaceSmile />}
              title="Easy"
            />
          </>
        ) : (
          <CardButton
            onClick={() => {
              setCurrentCard(0)
              setCardsState(cards)
              setFlipped(false)
              setAnsweredCount(0)
              setCorrectCount(0)
            }}
            icon={<FaArrowRotateLeft />}
            color="#3b82f6"
            title="Restart"
          />
        )}
      </div>
    </div>
  )
}
