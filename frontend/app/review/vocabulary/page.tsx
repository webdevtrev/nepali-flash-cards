import Link from 'next/link'
import Card from '../../components/Card'
import styles from '../page.module.css'
import {FaArrowLeft} from 'react-icons/fa'
export default function ReviewPage() {
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
        <Card title="Word of the Day" href="/review/vocabulary/word-of-the-day" />
        <Card title="Random" href="/review/vocabulary/random" />
      </div>
    </div>
  )
}
