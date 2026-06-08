import {client} from '@/sanity/lib/client'
import styles from './page.module.css'
import FlashCards from '@/app/components/FlashCards/FlashCards'

type Word = {
  _id: string
  english: string
  romanized?: string
  devanagari?: string
  pronunciation?: string
  audio?: string
}

const wordOfTheDayQuery = `*[_type == "word" && references("word-of-the-day")] | order(english asc) {
  _id,
  english,
  romanized,
  devanagari,
  pronunciation,
  "audio": audio.asset->url
}`

export default async function WordOfTheDayReview() {
  const words: Word[] = await client.fetch(wordOfTheDayQuery)
  const mapped = words.map((w) => ({
    devanagari: w.devanagari ?? '',
    transliteration: w.romanized ?? '',
    translation: w.english ?? '',
    pronunciation: w.pronunciation ?? '',
    audio: w.audio ?? '',
  }))

  return (
    <div className={styles.container}>
      <h1>Word of the Day</h1>
      {mapped.length === 0 ? (
        <p>No Word of the Day entries found.</p>
      ) : (
        <FlashCards type="word" cards={mapped} className={styles.flashCards} />
      )}
    </div>
  )
}
