import dotenv from 'dotenv'
import {createClient} from '@sanity/client'

dotenv.config({path: './frontend/.env.local'})

const DRY = process.argv.includes('--dry-run')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function fetchGroq(query: string) {
  return client.fetch(query)
}

async function mutateDocs(docs: any[]) {
  if (DRY) {
    console.log('Dry run — would upsert', docs.length, 'documents')
    console.log(JSON.stringify(docs.slice(0, 10), null, 2))
    return
  }

  if (!client.config().token)
    throw new Error('Missing SANITY_API_WRITE_TOKEN env var (required to write)')

  const BATCH_SIZE = 200
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const tx = client.transaction()
    for (const doc of batch) tx.createOrReplace(doc)
    const res = await tx.commit()
    console.log('Committed batch:', batch.length)
  }
}

function makeCombinationId(baseId: string, vowelId: string) {
  // Combine ids but make them valid IDs (no slashes)
  const safe = (s: string) => s.replace(/[^a-zA-Z0-9_-]/g, '-')
  return `combination-${safe(baseId)}-${safe(vowelId)}`
}

function buildGlyph(baseChar: string, matra?: string) {
  // Basic concatenation — works for most Devanagari matras.
  if (!matra) return baseChar
  return baseChar + matra
}

async function main() {
  console.log('Fetching consonants and vowels from Sanity...')
  const charQuery = `*[_type == "consonant"]{_id, char, transliteration, type}`
  const vowelQuery = `*[_type == "vowel"]{_id, label, matra, transliteration, order}`
  const wordQuery = `*[_type == "word"]{_id, devanagari}`
  const phraseQuery = `*[_type == "phrase"]{_id, devanagari}`

  const [characters, vowels] = await Promise.all([fetchGroq(charQuery), fetchGroq(vowelQuery)])

  const consonants = characters
  if (consonants.length === 0) console.warn('No consonants found — check your consonant documents')
  if (vowels.length === 0) console.warn('No vowels found — check your vowel documents')

  const [words, phrases] = await Promise.all([fetchGroq(wordQuery), fetchGroq(phraseQuery)])

  const wordMap = new Map<string, string[]>()
  for (const w of words || []) {
    if (!w.devanagari) continue
    const list = wordMap.get(w.devanagari) || []
    list.push(w._id)
    wordMap.set(w.devanagari, list)
  }
  for (const p of phrases || []) {
    if (!p.devanagari) continue
    const list = wordMap.get(p.devanagari) || []
    list.push(p._id)
    wordMap.set(p.devanagari, list)
  }

  const docs: any[] = []

  const safeId = (prefix: string, key: string) => `${prefix}-${key}`.replace(/[^a-zA-Z0-9-_]/g, '-')

  for (const base of consonants) {
    for (const v of vowels) {
      const glyph = buildGlyph(base.char, v.matra)
      const transliteration = `${base.transliteration || ''}${v.transliteration || ''}`
      const _id = makeCombinationId(base._id, v._id)

      const exampleIds = wordMap.get(glyph) || []

      // If no matching words/phrases, create a minimal word doc for the glyph
      if (exampleIds.length === 0) {
        const newWordId = safeId('word', glyph)
        const newWordDoc = {
          _id: newWordId,
          _type: 'word',
          devanagari: glyph,
          romanized: transliteration,
          english: '',
        }
        docs.push(newWordDoc)
        exampleIds.push(newWordId)
        // add to map to avoid duplication
        wordMap.set(glyph, exampleIds)
      }

      const doc = {
        _id,
        _type: 'combination',
        base: {_type: 'reference', _ref: base._id},
        vowel: {_type: 'reference', _ref: v._id},
        glyph,
        transliteration,
        examples: exampleIds.map((id) => ({_type: 'reference', _ref: id})),
      }
      docs.push(doc)
    }
  }

  console.log(`Prepared ${docs.length} documents (combinations + any new words)`)
  await mutateDocs(docs)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
