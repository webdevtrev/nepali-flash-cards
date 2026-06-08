'use client'

import React, {useEffect, useRef, useState} from 'react'
import {HiSpeakerWave} from 'react-icons/hi2'
import {FaCheck} from 'react-icons/fa'
import styles from './AudioButton.module.css'

type Props = {
  src?: string
  label?: string
  className?: string
  onPlay?: () => void
  onEnd?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'speaker'
  size?: 'small' | 'medium' | 'large'
  /** Render element type — use 'span' or 'div' to avoid nesting inside another <button> */
  as?: 'button' | 'span' | 'div'
}

export default function AudioButton({
  src,
  label = 'Play',
  className = '',
  onPlay,
  onEnd,
  disabled = false,
  variant = 'primary',
  size = 'medium',
  as = 'button',
}: Props) {
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    if (!src) {
      if (audioElementRef.current) {
        audioElementRef.current.pause()
        audioElementRef.current.currentTime = 0
      }
      return
    }

    const audio = new Audio(src)
    audioElementRef.current = audio

    const handleEnded = () => {
      setIsPlaying(false)
      setComplete(true)
      onEnd?.()
      // clear complete state after a moment so button returns to default
      setTimeout(() => setComplete(false), 1800)
    }
    const handlePause = () => setIsPlaying(false)
    const handlePlayEvent = () => setIsPlaying(true)
    const handleError = () => {
      setLoading(false)
      setIsPlaying(false)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('play', handlePlayEvent)
    audio.addEventListener('error', handleError)

    return () => {
      audio.pause()
      audio.currentTime = 0
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('play', handlePlayEvent)
      audio.removeEventListener('error', handleError)
      if (audioElementRef.current === audio) {
        audioElementRef.current = null
      }
    }
  }, [src, onEnd])

  const playAudioFromBeginning = async (e?: React.SyntheticEvent) => {
    if (e && typeof (e as any).stopPropagation === 'function') (e as any).stopPropagation()
    const audio = audioElementRef.current
    if (!audio) return

    try {
      setLoading(true)
      audio.pause()
      audio.currentTime = 0
      await audio.play()
      setLoading(false)
      setIsPlaying(true)
      setComplete(false)
      onPlay?.()
    } catch (error) {
      console.error('Unable to play audio pronunciation:', error)
      setLoading(false)
      setIsPlaying(false)
    }
  }

  return (
    <>
      {as === 'button' ? (
        <button
          type="button"
          className={`${styles.button} ${
            variant === 'secondary'
              ? styles.secondary
              : variant === 'ghost'
                ? styles.ghost
                : variant === 'speaker'
                  ? styles.speaker
                  : styles.primary
          } ${
            size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium
          } ${isPlaying ? styles.playing : ''} ${loading ? styles.loading : ''} ${
            complete ? styles.complete : ''
          } ${className}`}
          aria-pressed={isPlaying}
          onClick={playAudioFromBeginning}
          disabled={disabled || !src}
        >
          {complete ? (
            <FaCheck className={styles.icon} />
          ) : (
            <HiSpeakerWave className={styles.icon} />
          )}
        </button>
      ) : (
        <span
          role="button"
          tabIndex={disabled ? -1 : 0}
          className={`${styles.button} ${
            variant === 'secondary'
              ? styles.secondary
              : variant === 'ghost'
                ? styles.ghost
                : variant === 'speaker'
                  ? styles.speaker
                  : styles.primary
          } ${
            size === 'small' ? styles.small : size === 'large' ? styles.large : styles.medium
          } ${isPlaying ? styles.playing : ''} ${loading ? styles.loading : ''} ${
            complete ? styles.complete : ''
          } ${className}`}
          aria-label={label}
          aria-pressed={isPlaying}
          onClick={playAudioFromBeginning}
          onKeyDown={(e) => {
            if (disabled) return
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              playAudioFromBeginning(e)
            }
          }}
        >
          <span className={styles.icon} aria-hidden="true">
            {complete ? '✓' : <HiSpeakerWave />}
          </span>
        </span>
      )}
    </>
  )
}
