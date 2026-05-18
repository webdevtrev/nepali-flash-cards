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

async function removeAllTags() {
  // Fetch all words + phrases that have tags
  const docs = await client.fetch(`
    *[
      _type in ["word", "phrase"]
      && defined(tags)
    ]{
      _id,
      _type,
      romanized
    }
  `)

  console.log(`Found ${docs.length} documents with tags`)

  for (const doc of docs) {
    try {
      await client.patch(doc._id).unset(['tags']).commit()

      console.log(`Removed tags from ${doc._type}: ${doc.romanized}`)
    } catch (err) {
      console.error(`Failed: ${doc._id}`, err)
    }
  }

  console.log('Done removing tags')
}

removeAllTags()
