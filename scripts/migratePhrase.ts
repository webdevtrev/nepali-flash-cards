import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({path: './frontend/.env.local'})
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1pqgqh3y',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

async function migratePhrases() {
  const words = await client.fetch(`
    *[_type == "word" && migrateToPhrase == true]{
      _id,
      english,
      romanized,
      pronunciation,
      devanagari,
      tags
    }
  `)

  for (const word of words) {
    const phraseDoc = {
      _id: `phrase-${word._id.replace('drafts.', '')}`,
      _type: 'phrase',
      english: word.english,
      romanized: word.romanized,
      pronunciation: word.pronunciation,
      devanagari: word.devanagari,
      tags: word.tags ?? [],
      breakdown: [],
    }

    await client.createIfNotExists(phraseDoc)

    // Optional: archive old word instead of deleting immediately
    await client.patch(word._id).set({migratedToPhrase: true}).commit()
  }
}

migratePhrases()
