import Link from 'next/link'
import Card from '../../components/Card'
import styles from '../page.module.css'
import {FaArrowLeft} from 'react-icons/fa'
import {publicClient} from '@/sanity/lib/client'
import {tagsQuery} from '@/sanity/lib/queries'

export default async function ReviewPage() {
  const tags = await publicClient.fetch(tagsQuery)

  return (
    <div>
      <div>
        <Link href="/review" className={styles.backLink}>
          <FaArrowLeft /> Back
        </Link>
        <div>
          <h1>Vocabulary</h1>
          <h2>Select a category</h2>
        </div>
      </div>

      <div className={styles.cards}>
        {tags.map((tag) => (
          <Card key={tag._id} title={tag.title} href={`/review/vocabulary/${tag._id}`} />
        ))}
      </div>
    </div>
  )
}
