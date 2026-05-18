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

async function deleteMigratedWords() {
  // Find words already migrated
  const words = await client.fetch(`
    *[_type == "word" && migratedToPhrase == true]{
      _id,
      romanized
    }
  `)

  console.log(`Found ${words.length} migrated words`)

  for (const word of words) {
    try {
      await client.delete(word._id)
      console.log(`Deleted: ${word.romanized} (${word._id})`)
    } catch (err) {
      console.error(`Failed to delete ${word._id}`, err)
    }
  }

  console.log('Done')
}

deleteMigratedWords()
