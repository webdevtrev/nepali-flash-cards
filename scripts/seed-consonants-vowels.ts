#!/usr/bin/env ts-node
/**
 * seed-consonants-vowels.ts
 *
 * Upserts a standard set of Devanagari consonants and vowels into the Sanity dataset.
 * Usage:
 * SANITY_PROJECT_ID=yourId SANITY_DATASET=production SANITY_API_WRITE_TOKEN=token \
 *   npx ts-node scripts/seed-consonants-vowels.ts
 *
 * Use --dry-run to preview the documents without writing.
 */

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

async function mutate(docs: any[]) {
  if (DRY) {
    console.log('Dry run — would upsert', docs.length, 'docs')
    console.log(JSON.stringify(docs, null, 2))
    return
  }
  if (!client.config().token) throw new Error('Missing SANITY_API_WRITE_TOKEN')

  const BATCH = 200
  for (let i = 0; i < docs.length; i += BATCH) {
    const batch = docs.slice(i, i + BATCH)
    const tx = client.transaction()
    for (const d of batch) tx.createOrReplace(d)
    const res = await tx.commit()
    console.log('Committed batch — created/updated ops:', batch.length)
  }
}

function safeId(prefix: string, key: string) {
  return `${prefix}-${key}`.replace(/[^a-zA-Z0-9-_]/g, '-')
}

async function main() {
  // Minimal consonant list (common Nepali Devanagari consonants)
  const consonants: Array<{key: string; char: string; transliteration: string}> = [
    {key: 'ka', char: 'क', transliteration: 'ka'},
    {key: 'kha', char: 'ख', transliteration: 'kha'},
    {key: 'ga', char: 'ग', transliteration: 'ga'},
    {key: 'gha', char: 'घ', transliteration: 'gha'},
    {key: 'nga', char: 'ङ', transliteration: 'nga'},
    {key: 'ca', char: 'च', transliteration: 'ca'},
    {key: 'cha', char: 'छ', transliteration: 'cha'},
    {key: 'ja', char: 'ज', transliteration: 'ja'},
    {key: 'jha', char: 'झ', transliteration: 'jha'},
    {key: 'nya', char: 'ञ', transliteration: 'nya'},
    {key: 'tta', char: 'ट', transliteration: 'ṭa'},
    {key: 'ttha', char: 'ठ', transliteration: 'ṭha'},
    {key: 'dda', char: 'ड', transliteration: 'ḍa'},
    {key: 'ddha', char: 'ढ', transliteration: 'ḍha'},
    {key: 'nna', char: 'ण', transliteration: 'ṇa'},
    {key: 'ta', char: 'त', transliteration: 'ta'},
    {key: 'tha', char: 'थ', transliteration: 'tha'},
    {key: 'da', char: 'द', transliteration: 'da'},
    {key: 'dha', char: 'ध', transliteration: 'dha'},
    {key: 'na', char: 'न', transliteration: 'na'},
    {key: 'pa', char: 'प', transliteration: 'pa'},
    {key: 'pha', char: 'फ', transliteration: 'pha'},
    {key: 'ba', char: 'ब', transliteration: 'ba'},
    {key: 'bha', char: 'भ', transliteration: 'bha'},
    {key: 'ma', char: 'म', transliteration: 'ma'},
    {key: 'ya', char: 'य', transliteration: 'ya'},
    {key: 'ra', char: 'र', transliteration: 'ra'},
    {key: 'la', char: 'ल', transliteration: 'la'},
    {key: 'va', char: 'व', transliteration: 'va'},
    {key: 'sha', char: 'श', transliteration: 'śa'},
    {key: 'ssha', char: 'ष', transliteration: 'ṣa'},
    {key: 'sa', char: 'स', transliteration: 'sa'},
    {key: 'ha', char: 'ह', transliteration: 'ha'},
    // Nukta / additional letters commonly used in Nepali/Hindi loanwords
    {key: 'qa', char: 'क़', transliteration: 'qa'},
    {key: 'kha_nukta', char: 'ख़', transliteration: 'kh\u0325a'},
    {key: 'gha_nukta', char: 'ग़', transliteration: 'ġa'},
    {key: 'za', char: 'ज़', transliteration: 'za'},
    {key: 'rra_nukta', char: 'ड़', transliteration: 'ṛa'},
    {key: 'rdha_nukta', char: 'ढ़', transliteration: 'ṛha'},
  ]

  // Common vowels with matra signs
  const vowels: Array<{
    key: string
    label: string
    matra: string
    transliteration: string
    order?: number
  }> = [
    {key: 'a', label: 'a', matra: '', transliteration: 'a', order: 0},
    {key: 'aa', label: 'ā', matra: 'ा', transliteration: 'ā', order: 1},
    {key: 'i', label: 'i', matra: 'ि', transliteration: 'i', order: 2},
    {key: 'ii', label: 'ī', matra: 'ी', transliteration: 'ī', order: 3},
    {key: 'u', label: 'u', matra: 'ु', transliteration: 'u', order: 4},
    {key: 'uu', label: 'ū', matra: 'ू', transliteration: 'ū', order: 5},
    {key: 'ri', label: 'ṛ', matra: 'ृ', transliteration: 'ṛ', order: 6},
    {key: 'e', label: 'e', matra: 'े', transliteration: 'e', order: 7},
    {key: 'ai', label: 'ai', matra: 'ै', transliteration: 'ai', order: 8},
    {key: 'o', label: 'o', matra: 'ो', transliteration: 'o', order: 9},
    {key: 'au', label: 'au', matra: 'ौ', transliteration: 'au', order: 10},
    {key: 'an', label: 'an', matra: 'ं', transliteration: 'aṁ', order: 11},
    {key: 'ah', label: 'ah', matra: 'ः', transliteration: 'aḥ', order: 12},
    // Additional vocalic vowels
    {key: 'rri', label: 'rri', matra: 'ॄ', transliteration: 'r̥ī', order: 13},
    {key: 'li', label: 'ḷ', matra: 'ॢ', transliteration: 'ḷ', order: 14},
    {key: 'lli', label: 'ḹ', matra: 'ॣ', transliteration: 'ḹ', order: 15},
  ]

  const docs: any[] = []

  for (const c of consonants) {
    docs.push({
      _id: safeId('consonant', c.key),
      _type: 'consonant',
      title: c.transliteration,
      char: c.char,
      transliteration: c.transliteration,
      type: 'consonant',
    })
  }

  for (const v of vowels) {
    docs.push({
      _id: safeId('vowel', v.key),
      _type: 'vowel',
      label: v.label,
      matra: v.matra,
      transliteration: v.transliteration,
      order: v.order,
    })
  }

  await mutate(docs)
  console.log('Seed complete.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
