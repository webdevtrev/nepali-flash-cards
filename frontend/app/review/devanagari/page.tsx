import Card from '../../components/Card'
import styles from '../page.module.css'
import Link from 'next/link'
import {FaArrowLeft} from 'react-icons/fa'
export default function ReviewPage() {
  return (
    <div>
      <div>
        <Link href="/review" className={styles.backLink}>
          <FaArrowLeft /> Back
        </Link>
        <div>
          <h1>Devanagari</h1>
          <h2>Select a category</h2>
        </div>
      </div>
      <div className={styles.cards}>
        <Card title="Consonants" href="/review/devanagari/consonants" />
        <Card title="Vowels" href="/review/devanagari/vowels" />
      </div>
    </div>
  )
}
