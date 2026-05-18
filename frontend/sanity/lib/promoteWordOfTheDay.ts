import {createClient} from '@sanity/client'

import {apiVersion, dataset, projectId} from './api'

const WORD_OF_THE_DAY_TAG_TITLE = 'Word of the Day'
const WORD_OF_THE_DAY_TAG_ID = 'word-of-the-day'

function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!token) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN')
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  })
}

type DueWordOfTheDay = {
  _id: string
  scheduledFor: string
  word?: {
    _id: string
    tagIds?: string[]
  }
}

export async function promoteDueWordOfTheDay(now = new Date()) {
  const client = getWriteClient()
  const tomorrowStartIso = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  ).toISOString()

  const dueEntries = await client.fetch<DueWordOfTheDay[]>(
    /* groq */ `
      *[_type == "wordOfTheDay" && scheduledFor < $tomorrowStartIso] | order(scheduledFor asc) {
        _id,
        scheduledFor,
        word-> {
          _id,
          "tagIds": tags[]._ref,
        }
      }
    `,
    {tomorrowStartIso},
  )

  if (dueEntries.length === 0) {
    return {promoted: 0, deleted: 0, kept: 0, tagCreated: false}
  }

  const tag = await client.fetch<{_id: string} | null>(
    /* groq */ `*[_type == "tags" && title == $title][0]{_id}`,
    {title: WORD_OF_THE_DAY_TAG_TITLE},
  )

  let tagCreated = false
  let tagId = tag?._id

  if (!tagId) {
    await client.createIfNotExists({
      _id: WORD_OF_THE_DAY_TAG_ID,
      _type: 'tags',
      title: WORD_OF_THE_DAY_TAG_TITLE,
    })
    tagCreated = true
    tagId = WORD_OF_THE_DAY_TAG_ID
  }

  let promoted = 0
  let deleted = 0

  const keepEntry = [...dueEntries].reverse().find((entry) => Boolean(entry.word?._id))

  for (const entry of dueEntries) {
    const shouldKeep = keepEntry?._id === entry._id

    if (entry.word?._id) {
      const currentTagIds = entry.word.tagIds ?? []
      if (!currentTagIds.includes(tagId)) {
        await client
          .patch(entry.word._id)
          .append('tags', [{_type: 'reference', _ref: tagId}])
          .commit()
        promoted += 1
      }
    }

    if (!shouldKeep) {
      await client.delete(entry._id)
      deleted += 1
    }
  }

  return {promoted, deleted, kept: keepEntry ? 1 : 0, tagCreated}
}
