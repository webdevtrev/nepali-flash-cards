'use client'

import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'
import {HiOutlineSpeakerWave} from 'react-icons/hi2'
import {PiSunDim} from 'react-icons/pi'
import styles from './WordOfTheDay.module.css'

type WordOfTheDayData = {
  _id: string
  scheduledFor: string
  notes?: string
  word?: {
    _id: string
    english: string
    romanized: string
    devanagari?: string
    pronunciation?: string
    audio?: string
  }
}

interface WordOfTheDayProps {
  wordOfTheDay: WordOfTheDayData | null
  tagId: string
}

export default function WordOfTheDay({wordOfTheDay, tagId}: WordOfTheDayProps) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioUrl = wordOfTheDay?.word?.audio

  useEffect(() => {
    if (!audioUrl) {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.currentTime = 0
      }
      return
    }

    const audio = new Audio(audioUrl)
    audioElementRef.current = audio

    const handleEnded = () => setIsPlaying(false)
    const handlePause = () => setIsPlaying(false)

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.pause()
      audio.currentTime = 0
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      if (audioElementRef.current === audio) {
        audioElementRef.current = null
      }
    }
  }, [audioUrl])

  const playAudioFromBeginning = async () => {
    const audio = audioElementRef.current
    if (!audio) {
      return
    }

    try {
      audio.pause()
      audio.currentTime = 0
      await audio.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Unable to play audio pronunciation:', error)
      setIsPlaying(false)
    }
  }

  return (
    <section className={styles.wordOfDayCard}>
      <div className={styles.wordOfDayHeader}>
        <h2 className={styles.wordOfDayHeading}>
          <PiSunDim className={styles.sunIcon} aria-hidden="true" />
          Word of the Day
        </h2>
        {wordOfTheDay?.word?.audio && (
          <button
            type="button"
            className={styles.speakerButton}
            aria-label="Play pronunciation from beginning"
            aria-pressed={isPlaying}
            onClick={playAudioFromBeginning}
          >
            <HiOutlineSpeakerWave />
          </button>
        )}
      </div>
      <div className={styles.wordOfDayContent}>
        {wordOfTheDay?.word ? (
          <>
            <div>
              {wordOfTheDay.word.devanagari ? (
                <p lang="ne" className={styles.wordDevanagari}>
                  {wordOfTheDay.word.devanagari}
                </p>
              ) : (
                <p className={styles.wordDevanagari}>{wordOfTheDay.word.romanized}</p>
              )}
            </div>
            <span className={styles.wordRomanized}>({wordOfTheDay.word.romanized})</span>
            <p className={styles.wordRomanizedEnglish}>{wordOfTheDay.word.english}</p>
            {wordOfTheDay.notes ? <p className={styles.wordNotes}>{wordOfTheDay.notes}</p> : null}
            <div className={styles.wordOfDayFooter}>
              <Link href={`/words?tag=${tagId}`} className={styles.wordOfDayLink}>
                Click to study
              </Link>
            </div>
          </>
        ) : (
          <p className={styles.wordEmpty}>No word has been promoted yet.</p>
        )}
      </div>
    </section>
  )
}
