import styles from './Devanagari.module.css'
type DevanagariProps = {
  devanagari: string
  transliteration: string
  description?: string
  example: {
    devanagari: string
    transliteration: string
    translation: string
  }
}

export default function Devanagari({
  devanagari,
  transliteration,
  description,
  example,
}: DevanagariProps) {
  return (
    <div className={styles.container}>
      <div className={styles.answer}>
        <div className={styles.devanagari}>{devanagari}</div>
        <div className={styles.transliteration}>{transliteration}</div>
      </div>
      {example && (
        <div className={styles.example}>
          <span className={styles.exampleLabel}>Example</span>
          <div className={styles.exampleContent}>
            {example.devanagari} ({example.transliteration})
          </div>
          <div className={styles.exampleTranslation}>{example.translation}</div>
        </div>
      )}
      {description && <div className={styles.pronunciation}>{description}</div>}
    </div>
  )
}
