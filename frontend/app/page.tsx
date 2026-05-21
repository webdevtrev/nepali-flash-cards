import styles from './HomePage.module.css'
import {sanityFetch} from '@/sanity/lib/live'
import {currentWordOfTheDayQuery} from '@/sanity/lib/queries'
import WordOfTheDay from '@/app/components/PageBlocks/Home/WordOfTheDay'
import Image from 'next/image'

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
    audio?: string
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
      <header>
        <Image
          src="/images/logo.png"
          alt="Learn Nepali"
          width={140}
          height={92}
          className={styles.logo}
          priority
        />
      </header>
      <div className={styles.inner}>
        <WordOfTheDay wordOfTheDay={wordOfTheDay} tagId={WORD_OF_THE_DAY_TAG_ID} />
      </div>
    </div>
  )
}
