'use client'

import {useEffect, useState} from 'react'
import {client} from '@/sanity/lib/client'
import {wordsQuery, tagsQuery} from '@/sanity/lib/queries'
import FlashCards from '@/app/components/FlashCards'
import styles from './FlashCardsPage.module.css'

interface Tag {
  _id: string
  title: string
}

interface Word {
  english: string
  romanized: string
  devanagari: string
  pronunciation: string
  tags?: string[]
}

export default function FlashCardsPage() {
  const [words, setWords] = useState<Word[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [wordsLoading, setWordsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string>('')

  useEffect(() => {
    async function loadData() {
      try {
        const tagsData = await client.fetch(tagsQuery)
        setTags(tagsData ?? [])

        // Load all words initially
        setWordsLoading(true)
        const wordsData = await client.fetch(wordsQuery)
        setWords(wordsData ?? [])
      } catch (err) {
        console.error('Error loading flash cards data:', err)
        setError('Failed to load flash cards')
      } finally {
        setLoading(false)
        setWordsLoading(false)
      }
    }
    loadData()
  }, [])

  const handleAddWord = () => {
    // Open Sanity studio in a new tab to create a new word
    window.open(
      `${process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333'}/desk/word`,
      '_blank',
    )
  }

  const handleTagChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tagId = e.target.value
    setSelectedTagId(tagId)

    if (tagId) {
      try {
        setWordsLoading(true)
        // Fetch words filtered by tag
        const filteredWords = await client.fetch(
          `
          *[_type == "word" && $tagId in tags[]._ref] | order(english asc) {
            english,
            romanized,
            devanagari,
            pronunciation,
            "tags": tags[]->_id,
          }
        `,
          {tagId},
        )
        setWords(filteredWords ?? [])
      } catch (err) {
        console.error('Error fetching filtered words:', err)
        setError('Failed to load words for this tag')
      } finally {
        setWordsLoading(false)
      }
    } else {
      try {
        setWordsLoading(true)
        // Fetch all words
        const allWords = await client.fetch(wordsQuery)
        setWords(allWords ?? [])
      } catch (err) {
        console.error('Error fetching all words:', err)
        setError('Failed to load words')
      } finally {
        setWordsLoading(false)
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>Loading...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <h1 className={styles.heading}>Error</h1>
        <p className={styles.error}>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.headerRow}>
        <h1 className={styles.heading}>Flash Cards</h1>
        <button className={styles.addButton} onClick={handleAddWord}>
          + Add Word
        </button>
      </div>
      <select className={styles.tagFilter} value={selectedTagId} onChange={handleTagChange}>
        <option value="">All Tags</option>
        {tags.map((tag) => (
          <option key={tag._id} value={tag._id}>
            {tag.title}
          </option>
        ))}
      </select>
      {wordsLoading ? (
        <p className={styles.loading}>Loading words...</p>
      ) : (
        <FlashCards words={words ?? []} />
      )}
    </div>
  )
}
