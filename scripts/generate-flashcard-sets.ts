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

async function fetchGroq(query: string, params?: Record<string, any>) {
  return client.fetch(query, params)
}

async function mutateDocs(docs: any[]) {
  if (DRY) {
    console.log('Dry run — would upsert', docs.length, 'documents')
    console.log(JSON.stringify(docs.slice(0, 10), null, 2))
    return
  }

  if (!client.config().token)
    throw new Error('Missing SANITY_API_WRITE_TOKEN env var (required to write)')

  const BATCH_SIZE = 100
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = docs.slice(i, i + BATCH_SIZE)
    const tx = client.transaction()
    for (const doc of batch) tx.createOrReplace(doc)
    await tx.commit()
    console.log('Committed batch:', batch.length)
  }
}

function safeId(prefix: string, key: string) {
  return `${prefix}-${key}`.replace(/[^a-zA-Z0-9-_]/g, '-')
}

async function main() {
  console.log('Fetching consonants and combinations...')
  const consonantsQuery = `*[_type == "consonant"]{_id, char, transliteration, title}`
  const combosQuery = `*[_type == "combination"]{_id, "baseId": base->_id, glyph, transliteration}`

  const [consonants, combos] = await Promise.all([
    fetchGroq(consonantsQuery),
    fetchGroq(combosQuery),
  ])

  const combosByBase = new Map<string, any[]>()
  for (const c of combos || []) {
    const list = combosByBase.get(c.baseId) || []
    list.push(c)
    combosByBase.set(c.baseId, list)
  }

  const docs: any[] = []

  // Define canonical consonant lines (traditional order)
  const lines = [
    {id: 'ka-line', title: 'Ka Line', keys: ['ka', 'kha', 'ga', 'gha', 'nga']},
    {id: 'ca-line', title: 'Ca Line', keys: ['ca', 'cha', 'ja', 'jha', 'nya']},
    {id: 'tta-line', title: 'Tta Line', keys: ['tta', 'ttha', 'dda', 'ddha', 'nna']},
    {id: 'ta-line', title: 'Ta Line', keys: ['ta', 'tha', 'da', 'dha', 'na']},
    {id: 'pa-line', title: 'Pa Line', keys: ['pa', 'pha', 'ba', 'bha', 'ma']},
    {id: 'ya-line', title: 'Ya/Ra/La/Va', keys: ['ya', 'ra', 'la', 'va']},
    {id: 'sha-line', title: 'Sha/Ssa/Sa/Ha', keys: ['sha', 'ssha', 'sa', 'ha', 'qa', 'za']},
  ]

  // Map consonant key => doc, and collect any that aren't matched
  const consonantByKey = new Map<string, any>()
  const leftover: any[] = []
  for (const c of consonants || []) {
    // c._id is like 'consonant-ka' from the seed
    const m = /^consonant-(.+)$/.exec(c._id)
    const key = m ? m[1] : c._id
    consonantByKey.set(key, c)
  }

  // Create sets per defined line
  for (const line of lines) {
    const cards: any[] = []
    let anyFound = false
    for (const key of line.keys) {
      const consonant = consonantByKey.get(key)
      if (!consonant) continue
      anyFound = true
      // reference the base consonant (include _key for Studio list editing)
      cards.push({_key: safeId('card', consonant._id), _type: 'reference', _ref: consonant._id})
      const combosForBase = combosByBase.get(consonant._id) || []
      for (const combo of combosForBase)
        cards.push({_key: safeId('card', combo._id), _type: 'reference', _ref: combo._id})
      // mark as used
      consonantByKey.delete(key)
    }

    if (!anyFound) continue

    const setId = safeId('flashcardSet', line.id)
    const doc = {
      _id: setId,
      _type: 'flashcardSet',
      title: line.title,
      description: `Auto-generated flashcard set for ${line.title}`,
      cards,
      settings: {shuffle: true, spacedRepetition: false},
    }
    docs.push(doc)
  }

  // Any remaining consonants become their own small sets
  for (const [key, consonant] of consonantByKey.entries()) {
    const cards: any[] = [
      {_key: safeId('card', consonant._id), _type: 'reference', _ref: consonant._id},
    ]
    const combosForBase = combosByBase.get(consonant._id) || []
    for (const combo of combosForBase)
      cards.push({_key: safeId('card', combo._id), _type: 'reference', _ref: combo._id})
    const setId = safeId('flashcardSet', consonant._id)
    docs.push({
      _id: setId,
      _type: 'flashcardSet',
      title: `${consonant.char || key} — ${consonant.transliteration || key}`,
      description: `Auto-generated flashcard set for ${consonant.char || key}`,
      cards,
      settings: {shuffle: true, spacedRepetition: false},
    })
  }

  console.log(`Prepared ${docs.length} flashcard set documents`)
  await mutateDocs(docs)
  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
