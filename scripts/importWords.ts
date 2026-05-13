import dotenv from 'dotenv'
import {createClient} from '@sanity/client'
import {RAW_KNOWN_UNSORTED} from './words'

dotenv.config({path: './frontend/.env.local'})

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1pqgqh3y',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const slug = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const tagId = (tag: string) => `tag-${slug(tag)}`

const wordId = (word: {english: string; romanized: string}) =>
  `word-${slug(word.english)}-${slug(word.romanized)}`

async function main() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN')
  }

  const uniqueTags = [...new Set(RAW_KNOWN_UNSORTED.flatMap((word) => word.tags ?? []))]

  const tx = client.transaction()

  for (const tag of uniqueTags) {
    tx.createIfNotExists({
      _id: tagId(tag),
      _type: 'tags',
      title: tag,
    })
  }

  for (const word of RAW_KNOWN_UNSORTED) {
    tx.createOrReplace({
      _id: wordId(word),
      _type: 'word',
      english: word.english,
      romanized: word.romanized,
      devanagari: word.devanagari,
      pronunciation: word.pronunciation || '',
      tags: (word.tags ?? []).map((tag) => ({
        _type: 'reference',
        _ref: tagId(tag),
        _key: `${wordId(word)}-${tagId(tag)}`,
      })),
    })
  }

  await tx.commit()

  console.log(`✅ Imported ${RAW_KNOWN_UNSORTED.length} words and ${uniqueTags.length} tags`)
}

main().catch((err) => {
  console.error('❌ Import failed')
  console.error(err)
  process.exit(1)
})
