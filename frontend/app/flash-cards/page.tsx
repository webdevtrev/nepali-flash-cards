'use client'

import {useEffect, useState} from 'react'
import {useSearchParams} from 'next/navigation'
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
  tags?: string[] | null
}

const wordsByTagQuery = `
  *[_type == "word" && $tagId in tags[]._ref] | order(english asc) {
    english,
    romanized,
    devanagari,
    pronunciation,
    "tags": tags[]->_id,
  }
`

export default function FlashCardsPage() {
  const searchParams = useSearchParams()
  const [words, setWords] = useState<Word[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [wordsLoading, setWordsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTagId, setSelectedTagId] = useState<string>('')

  const urlTagId = searchParams.get('tag') ?? ''

  async function fetchWords(tagId: string) {
    if (!tagId) {
      const allWords = await client.fetch<Word[]>(wordsQuery)
      return allWords ?? []
    }

    const filteredWords = await client.fetch<Word[]>(wordsByTagQuery, {tagId})
    return filteredWords ?? []
  }

  useEffect(() => {
    async function loadData() {
      try {
        setError(null)
        const tagsData = await client.fetch<Tag[]>(tagsQuery)
        const availableTags = tagsData ?? []
        setTags(availableTags)

        const preloadTagId = availableTags.some((tag) => tag._id === urlTagId) ? urlTagId : ''
        setSelectedTagId(preloadTagId)

        setWordsLoading(true)
        const wordsData = await fetchWords(preloadTagId)
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
  }, [urlTagId])

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

    try {
      setError(null)
      setWordsLoading(true)
      const data = await fetchWords(tagId)
      setWords(data)
    } catch (err) {
      console.error('Error fetching words:', err)
      setError(tagId ? 'Failed to load words for this tag' : 'Failed to load words')
    } finally {
      setWordsLoading(false)
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
        <option value="">All Words</option>
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
