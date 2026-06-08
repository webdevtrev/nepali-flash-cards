'use client'

import React, {useEffect, useState} from 'react'
import {publicClient} from '@/sanity/lib/client'

const consonantsQuery = `*[_type == "consonant"]{_id, char, transliteration, title} | order(title asc)`

export default function ConsonantsPage() {
  const [consonants, setConsonants] = useState<any[]>([])

  useEffect(() => {
    let mounted = true

    publicClient
      .fetch(consonantsQuery)
      .then((data) => {
        if (!mounted) return
        setConsonants(data || [])
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
    <div>
      <h1>Devanagari Consonants</h1>
      <p>Review the Devanagari consonants here.</p>
      {consonants.length > 0 ? (
        <ul>
          {consonants.map((c) => (
            <li key={c._id}>
              <strong>{c.char}</strong> — {c.transliteration || c.title}
            </li>
          ))}
        </ul>
      ) : (
        <p>No consonants found.</p>
      )}
    </div>
  )
}
