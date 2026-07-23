'use client'

import {useEffect, useState} from 'react'
import Toggle from '@/app/components/Toggle'
import {
  REVIEW_CARD_LIMIT,
  getReviewCardLimitFromClient,
  setReviewCardLimitOnClient,
} from '@/app/lib/reviewSettings'
import styles from './page.module.css'

export default function SettingsPage() {
  const [limitEnabled, setLimitEnabled] = useState(false)

  useEffect(() => {
    setLimitEnabled(getReviewCardLimitFromClient() !== null)
  }, [])

  function toggleLimit() {
    setLimitEnabled((prev) => {
      const next = !prev
      setReviewCardLimitOnClient(next)
      return next
    })
  }

  return (
    <main className={styles.container}>
      <h1>Settings</h1>
      <Toggle
        checked={limitEnabled}
        onChange={toggleLimit}
        label={`Limit review sessions to ${REVIEW_CARD_LIMIT} cards`}
      />
    </main>
  )
}
