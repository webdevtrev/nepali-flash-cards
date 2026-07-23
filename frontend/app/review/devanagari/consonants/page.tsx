'use client'

import React, {useEffect, useState} from 'react'
import {publicClient} from '@/sanity/lib/client'
import FlashCards from '@/app/components/FlashCards/FlashCards'

import styles from './page.module.css'

// Fetch examples dereferenced (they expose `romanized` and `english` fields in the CMS)
const consonantsQuery = `*[_type == "consonant" && type == 'consonant'] | order(title asc){_id, char, transliteration, title, pronunciationDescription, "examples": examples[]->{devanagari, romanized, english}}`

export default function ConsonantsPage() {
  const [consonants, setConsonants] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    publicClient
      .fetch(consonantsQuery)
      .then((data: any[]) => {
        if (!mounted) return
        const shuffledData = [...(data || [])]
        for (let i = shuffledData.length - 1; i > 0; i -= 1) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledData[i], shuffledData[j]] = [shuffledData[j], shuffledData[i]]
        }
        // Debug: log raw fetched data to inspect why `examples` may be missing
        // Remove this log after debugging
        // eslint-disable-next-line no-console
        console.log('raw fetched consonants:', shuffledData)
        const items = shuffledData.map((c: any) => {
          const examples = c.examples || []
          const raw = examples.length ? examples[Math.floor(Math.random() * examples.length)] : null
          // Normalize example fields so UI can use `transliteration` and `translation`
          const example = raw
            ? {
                ...raw,
                transliteration: raw.transliteration ?? raw.romanized ?? null,
                translation: raw.translation ?? raw.english ?? null,
              }
            : null
          return {...c, example}
        })
        console.log(items)
        setConsonants(items)
      })
      .catch((err) => {
        // Log errors but don't break the UI
        // eslint-disable-next-line no-console
        console.error('Error fetching consonants:', err)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className={styles.container}>
      <h1>Devanagari Consonants</h1>
      <p>Review the Devanagari consonants here.</p>
      {consonants.length > 0 ? (
        <FlashCards
          type="devanagari"
          cards={consonants.map((c) => ({
            devanagari: c.char,
            transliteration: c.transliteration,
            translation: c.title,
            example: c.example,
            description: c.pronunciationDescription,
          }))}
          className={styles.flashCards}
        />
      ) : (
        <p>No consonants found.</p>
      )}
    </div>
  )
}
