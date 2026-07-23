import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'
import {publicClient} from '@/sanity/lib/client'
import {tagByIdQuery, wordsByTagQuery} from '@/sanity/lib/queries'
import FlashCards from '@/app/components/FlashCards/FlashCards'
import {REVIEW_CARD_LIMIT, REVIEW_CARD_LIMIT_COOKIE} from '@/app/lib/reviewSettings'
import styles from './page.module.css'

export default async function TagReview({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const [tag, words, cookieStore] = await Promise.all([
    publicClient.fetch(tagByIdQuery, {tagId: id}),
    publicClient.fetch(wordsByTagQuery, {tagId: id}),
    cookies(),
  ])

  if (!tag) {
    notFound()
  }

  const limitEnabled = cookieStore.get(REVIEW_CARD_LIMIT_COOKIE)?.value === '1'
  const limitedWords = limitEnabled ? words.slice(0, REVIEW_CARD_LIMIT) : words

  const mapped = limitedWords.map((w) => ({
    devanagari: w.devanagari ?? '',
    transliteration: w.romanized ?? '',
    translation: w.english ?? '',
    pronunciation: w.pronunciation ?? '',
    audio: w.audio ?? '',
  }))

  return (
    <div className={styles.container}>
      <h1>{tag.title}</h1>
      {mapped.length === 0 ? (
        <p>No words found for this tag.</p>
      ) : (
        <FlashCards type="word" cards={mapped} className={styles.flashCards} />
      )}
    </div>
  )
}
