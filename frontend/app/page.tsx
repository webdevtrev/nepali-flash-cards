import Link from 'next/link'
import styles from './HomePage.module.css'
import {sanityFetch} from '@/sanity/lib/live'
import {currentWordOfTheDayQuery} from '@/sanity/lib/queries'

const WORD_OF_THE_DAY_TAG_ID = 'word-of-the-day'

type CurrentWordOfTheDay = {
  _id: string
  scheduledFor: string
  notes?: string
  word?: {
    _id: string
    english: string
    romanized: string
    devanagari?: string
    pronunciation?: string
  }
}

export default async function Page() {
  const now = new Date()
  const tomorrowStartIso = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString()

  const {data} = await sanityFetch({
    query: currentWordOfTheDayQuery,
    params: {tomorrowStartIso},
  })
  const wordOfTheDay = (data as CurrentWordOfTheDay | null) ?? null

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>Welcome</h1>

        <section className={styles.wordOfDayCard}>
          <h2 className={styles.wordOfDayHeading}>Word of the Day</h2>

          {wordOfTheDay?.word ? (
            <>
              <p className={styles.wordEnglish}>{wordOfTheDay.word.english}</p>
              <p className={styles.wordRomanized}>{wordOfTheDay.word.romanized}</p>
              {wordOfTheDay.word.devanagari ? (
                <p className={styles.wordDevanagari}>{wordOfTheDay.word.devanagari}</p>
              ) : null}
              {wordOfTheDay.word.pronunciation ? (
                <p className={styles.wordPronunciation}>
                  Pronunciation: {wordOfTheDay.word.pronunciation}
                </p>
              ) : null}
              <Link
                href={`/flash-cards?tag=${WORD_OF_THE_DAY_TAG_ID}`}
                className={styles.wordOfDayLink}
              >
                Practice Word of the Day
              </Link>
            </>
          ) : (
            <p className={styles.wordEmpty}>No word has been promoted yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}
