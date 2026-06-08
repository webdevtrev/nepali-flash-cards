import Card from '../components/Card'
import styles from './page.module.css'
export default function ReviewPage() {
  return (
    <div>
      <h1>Select a review type</h1>
      <div className={styles.cards}>
        <Card title="Devanagari" href="/review/devanagari" />
        <Card title="Vocabulary" href="/review/vocabulary" />
      </div>
    </div>
  )
}
