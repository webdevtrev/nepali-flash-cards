type WordProps = {
  devanagari: string
  transliteration: string
  translation: string
  pronunciation: string
  pronunciationAudioFile: string
}

export default function Word({
  devanagari,
  transliteration,
  translation,
  pronunciation,
  pronunciationAudioFile,
}: WordProps) {
  return <div>Word Card</div>
}
