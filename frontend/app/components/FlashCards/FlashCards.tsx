import {useEffect, useState} from 'react'
import Card from '../Card'
import ProgressBar from '../ProgressBar/ProgressBar'
import CardButton from '../CardButton/CardButton'
import {FaArrowRotateLeft, FaArrowRotateRight, FaRegFaceSmile} from 'react-icons/fa6'
type Word = {
  devanagari: string
  transliteration: string
  translation: string
}
type FlashCard =
  | {
      type: 'devanagari'
      devanagari: string
      transliteration: string
      example: Word
    }
  | {
      type: 'word'
      devanagari: string
      transliteration: string
      translation: string
      pronunciation: string
      pronunciationAudioFile: string
    }

import styles from './FlashCards.module.css'
import Devanagari from './components/Devanagari'
import Word from './components/Word'
type FlashCardsProps = {
  cards?: FlashCard[]
}

export default function FlashCards({cards}: FlashCardsProps) {
  const [cardsState, setCardsState] = useState<FlashCard[] | undefined>(cards)
  const [flipped, setFlipped] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)

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
    setCurrentCard((prev) => prev + 1)
  }
  return (
    <div className={styles.container}>
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
                className={[
                  styles.devanagari,
                  cardsState?.[currentCard]?.type === 'devanagari' ? styles.large : '',
                ].join(' ')}
              >
                {cardsState?.[currentCard]?.devanagari}
              </span>
              {cardsState?.[currentCard]?.type === 'word' && (
                <span className={styles.transliteration}>
                  {cardsState[currentCard].transliteration}
                </span>
              )}
            </div>
          ) : (
            <>
              {cardsState?.[currentCard]?.type === 'devanagari' ? (
                <Devanagari {...cardsState[currentCard]} />
              ) : null}
              {cardsState?.[currentCard]?.type === 'word' ? (
                <Word {...cardsState[currentCard]} />
              ) : null}
            </>
          )}
        </Card>
      ) : (
        <Card className={styles.card}>
          <h2>All done!</h2>
          <p>You've gone through all the cards.</p>
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
              onClick={nextCard}
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
