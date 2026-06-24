'use client'

import React, {useEffect, useState} from 'react'
import {publicClient} from '@/sanity/lib/client'
import FlashCards from '@/app/components/FlashCards/FlashCards'

import styles from './page.module.css'
import { set } from 'date-fns'

// Fetch examples dereferenced (they expose `romanized` and `english` fields in the CMS)
const vowelsQuery = `*[_type == "vowel"] | order(title asc){_id, char, transliteration, title, "examples": examples[]->{devanagari, romanized, english}}`

export default function VowelsPage() {
  const [vowels, setVowels] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    publicClient
      .fetch(vowelsQuery)
      .then((data: any[]) => {
        if (!mounted) return
        // Debug: log raw fetched data to inspect why `examples` may be missing
        // Remove this log after debugging
        // eslint-disable-next-line no-console
        console.log('raw fetched vowels:', data)
        const items = (data || []).map((c: any) => {
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
        setVowels(items)
      })
      .catch((err) => {
        // Log errors but don't break the UI
        // eslint-disable-next-line no-console
        console.error('Error fetching vowels:', err)
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className={styles.container}>
      <h1>Devanagari Vowels</h1>
      <p>Review the Devanagari vowels here.</p>
      {vowels.length > 0 ? (
        <FlashCards
          type="devanagari"
          cards={vowels.map((c) => ({
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
