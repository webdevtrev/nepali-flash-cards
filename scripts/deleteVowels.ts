import {createClient} from '@sanity/client'
import dotenv from 'dotenv'

dotenv.config({path: '../.env.local'})

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1pqgqh3y',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const dryRun = process.argv.includes('--dry-run')

async function deleteAllVowels() {
  const vowels = await client.fetch(`
    *[_type == "vowel"]{
      _id,
      glyph,
      transliteration
    }
  `)

  console.log(`Found ${vowels.length} vowels`)

  for (const vowel of vowels) {
    const label = vowel.glyph || vowel.transliteration || vowel._id

    if (dryRun) {
      console.log(`[DRY RUN] Would delete: ${label} (${vowel._id})`)
      continue
    }

    try {
      await client.delete(vowel._id)
      console.log(`Deleted: ${label} (${vowel._id})`)
    } catch (err) {
      console.error(`Failed to delete ${vowel._id}`, err)
    }
  }

  console.log(dryRun ? 'Dry run complete' : 'Done deleting vowels')
}

deleteAllVowels()
