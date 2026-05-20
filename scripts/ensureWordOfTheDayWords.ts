import {randomUUID} from 'node:crypto'

import dotenv from 'dotenv'
import {createClient} from '@sanity/client'

dotenv.config({path: './frontend/.env.local'})

const WORD_OF_THE_DAY_TAG_TITLE = 'Word of the Day'
const WORD_OF_THE_DAY_TAG_ID = 'word-of-the-day'

type InputWord = {
  english: string
  romanized: string
  pronunciation: string
  devanagari: string
}

const WORDS: InputWord[] = [
  {english: 'Bird', romanized: 'charā', pronunciation: 'chuh-raa', devanagari: 'चरा'},
  {english: 'Egg', romanized: 'aṇḍā', pronunciation: 'uhn-daa', devanagari: 'अण्डा'},
  {english: 'Water', romanized: 'pānī', pronunciation: 'paa-nee', devanagari: 'पानी'},
  {english: 'Potato', romanized: 'ālu', pronunciation: 'aa-loo', devanagari: 'आलु'},
  {english: 'Dreams', romanized: 'sapanā', pronunciation: 'suh-puh-naa', devanagari: 'सपना'},
  {english: 'Home', romanized: 'ghar', pronunciation: 'ghur', devanagari: 'घर'},
  {english: 'Food', romanized: 'khānā', pronunciation: 'khaa-naa', devanagari: 'खाना'},
  {english: 'Love', romanized: 'maya', pronunciation: 'muh-yaa', devanagari: 'माया'},
  {
    english: 'I love you',
    romanized: 'ma timilai maya garchu',
    pronunciation: 'mah tee-mee-lai muh-yaa gar-chu',
    devanagari: 'म तिमीलाई माया गर्छु',
  },
  {english: 'Work', romanized: 'kām', pronunciation: 'kaam', devanagari: 'काम'},
  {english: 'Tree', romanized: 'rukh', pronunciation: 'rookh', devanagari: 'रुख'},
  {english: 'Door', romanized: 'dhokā', pronunciation: 'dho-kah', devanagari: 'ढोका'},
  {english: 'Flower', romanized: 'phool', pronunciation: 'fool', devanagari: 'फूल'},
  {english: 'Clock', romanized: 'ghaḍī', pronunciation: 'ghuh-dee', devanagari: 'घडी'},
  {english: 'Tea', romanized: 'chiyā', pronunciation: 'chee-yaa', devanagari: 'चिया'},
  {english: 'Moon', romanized: 'jūn', pronunciation: 'joon', devanagari: 'जून'},
  {english: 'Book', romanized: 'kitāb', pronunciation: 'kee-taab', devanagari: 'किताब'},
  {english: 'Good', romanized: 'ramro', pronunciation: 'rahm-ro', devanagari: 'राम्रो'},
  {english: 'Light', romanized: 'battī', pronunciation: 'buht-tee', devanagari: 'बत्ती'},
  {
    english: 'Good Morning',
    romanized: 'shubha bihānī',
    pronunciation: 'shoo-bha bee-haa-nee',
    devanagari: 'शुभ बिहान',
  },
  {
    english: 'Music or Song',
    romanized: 'gīt',
    pronunciation: 'geet',
    devanagari: 'गीत',
  },
  {english: 'Flag', romanized: 'jhaṇḍā', pronunciation: 'jhun-daa', devanagari: 'झण्डा'},
  {english: 'Wind', romanized: 'hawā', pronunciation: 'huh-waa', devanagari: 'हावा'},
  {english: 'Windy', romanized: 'hurī', pronunciation: 'hoo-ree', devanagari: 'हुरी'},
  {english: 'Happy', romanized: 'khushī', pronunciation: 'khoo-shee', devanagari: 'खुशी'},
  {
    english: 'Friday',
    romanized: 'shukrabār',
    pronunciation: 'shook-ruh-baar',
    devanagari: 'शुक्रबार',
  },
  {english: 'Day', romanized: 'din', pronunciation: 'deen', devanagari: 'दिन'},
  {english: 'Metal', romanized: 'phalām', pronunciation: 'fuh-laam', devanagari: 'फलाम'},
  {english: 'Duck', romanized: 'hās', pronunciation: 'haas', devanagari: 'हाँस'},
  {english: 'Vehicle', romanized: 'gāḍī', pronunciation: 'gaa-dee', devanagari: 'गाडी'},
]

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1pqgqh3y',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-25',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
})

const slug = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

const wordId = (word: InputWord) => `word-${slug(word.english)}-${slug(word.romanized)}`

const createArrayKey = () => randomUUID().replace(/-/g, '').slice(0, 12)

async function addTagIfMissing(documentId: string, tagId: string, dryRun: boolean) {
  const existingTagIds = await client.fetch<string[]>(
    /* groq */ `*[_id == $documentId][0].tags[]._ref`,
    {documentId},
  )

  if ((existingTagIds ?? []).includes(tagId)) {
    return false
  }

  if (dryRun) {
    return true
  }

  await client
    .patch(documentId)
    .setIfMissing({tags: []})
    .append('tags', [{_key: createArrayKey(), _type: 'reference', _ref: tagId}])
    .commit()

  return true
}

async function getOrCreateWordOfTheDayTag(dryRun: boolean) {
  const existingTag = await client.fetch<{_id: string} | null>(
    /* groq */ `*[_type == "tags" && title == $title][0]{_id}`,
    {title: WORD_OF_THE_DAY_TAG_TITLE},
  )

  if (existingTag?._id) {
    return {tagId: existingTag._id, created: false}
  }

  if (dryRun) {
    return {tagId: WORD_OF_THE_DAY_TAG_ID, created: true}
  }

  await client.createIfNotExists({
    _id: WORD_OF_THE_DAY_TAG_ID,
    _type: 'tags',
    title: WORD_OF_THE_DAY_TAG_TITLE,
  })

  return {tagId: WORD_OF_THE_DAY_TAG_ID, created: true}
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  if (!dryRun && !process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN')
  }

  const {tagId, created: tagCreated} = await getOrCreateWordOfTheDayTag(dryRun)

  let createdWords = 0
  let existingWords = 0
  let taggedWords = 0
  let unchangedWords = 0

  for (const word of WORDS) {
    const matchingWordDocumentIds = await client.fetch<string[]>(
      /* groq */ `*[_type == "word" && english == $english && romanized == $romanized]._id`,
      {english: word.english, romanized: word.romanized},
    )

    if (matchingWordDocumentIds.length === 0) {
      if (!dryRun) {
        await client.createIfNotExists({
          _id: wordId(word),
          _type: 'word',
          english: word.english,
          romanized: word.romanized,
          pronunciation: word.pronunciation,
          devanagari: word.devanagari,
          tags: [{_key: createArrayKey(), _type: 'reference', _ref: tagId}],
        })
      }

      createdWords += 1
      continue
    }

    existingWords += 1

    let addedToAnyDocument = false
    for (const documentId of matchingWordDocumentIds) {
      const added = await addTagIfMissing(documentId, tagId, dryRun)
      if (added) {
        addedToAnyDocument = true
      }
    }

    if (addedToAnyDocument) {
      taggedWords += 1
    } else {
      unchangedWords += 1
    }
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        totalInputWords: WORDS.length,
        tagCreated,
        createdWords,
        existingWords,
        taggedWords,
        unchangedWords,
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error('❌ Ensure word-of-the-day words failed')
  console.error(error)
  process.exitCode = 1
})
