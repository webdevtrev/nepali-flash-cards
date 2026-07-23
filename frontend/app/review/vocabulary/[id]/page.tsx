import {notFound} from 'next/navigation'
import {publicClient} from '@/sanity/lib/client'
import {tagByIdQuery, wordsByTagQuery} from '@/sanity/lib/queries'
import FlashCards from '@/app/components/FlashCards/FlashCards'
import styles from './page.module.css'

export default async function TagReview({params}: {params: Promise<{id: string}>}) {
  const {id} = await params
  const [tag, words] = await Promise.all([
    publicClient.fetch(tagByIdQuery, {tagId: id}),
    publicClient.fetch(wordsByTagQuery, {tagId: id}),
  ])

  if (!tag) {
    notFound()
  }

  const mapped = words.map((w) => ({
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
