import styles from './Word.module.css'
import AudioButton from '../../AudioButton/AudioButton'
type WordProps = {
  devanagari: string
  transliteration: string
  translation: string
  pronunciation: string
  audio: string
}

export default function Word({
  devanagari,
  transliteration,
  translation,
  pronunciation,
  audio,
}: WordProps) {
  return (
    <div className={styles.container}>
      <div className={styles.answer}>
        <div className={styles.translation}>{translation}</div>
        <div lang="ne" className={styles.devanagari}>
          {devanagari}
        </div>
        <div className={styles.transliteration}>{transliteration}</div>
      </div>

      <div className={styles.pronunciation}>
        <span className={styles.pronunciationLabel}>Pronunciation: {pronunciation}</span>
        {audio && <AudioButton src={audio} variant="primary" size="medium" as="span" />}
      </div>
    </div>
  )
}
