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

async function deleteAllCombinations() {
  const combinations = await client.fetch(`
    *[_type == "combination"]{
      _id,
      glyph,
      transliteration
    }
  `)

  console.log(`Found ${combinations.length} combinations`)

  for (const combination of combinations) {
    try {
      await client.delete(combination._id)
      const label = combination.glyph || combination.transliteration || combination._id
      console.log(`Deleted: ${label} (${combination._id})`)
    } catch (err) {
      console.error(`Failed to delete ${combination._id}`, err)
    }
  }

  console.log('Done deleting combinations')
}

deleteAllCombinations()
