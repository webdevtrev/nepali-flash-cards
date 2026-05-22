// Utility for promoting scheduled "word of the day" entries to real
// word documents by adding a tag and cleaning up scheduled entries.
//
// This script is intended to run on a schedule (e.g. via a cron job) and
// will:
// 1. Find all `wordOfTheDay` documents scheduled before tomorrow.
// 2. Ensure a "Word of the Day" tag exists, creating it if necessary.
// 3. Tag the underlying word documents (published and draft) for the
//    most recent eligible entry.
// 4. Delete the scheduled entries that are no longer needed.

import {createClient} from '@sanity/client'
import {uuid} from '@sanity/uuid'

import {apiVersion, dataset, projectId} from './api'

// Constants used for tag creation / lookup
const WORD_OF_THE_DAY_TAG_TITLE = 'Word of the Day'
const WORD_OF_THE_DAY_TAG_ID = 'word-of-the-day'

/**
 * Create a Sanity write client using an API token from the environment.
 * Throws if the required token is not present so callers fail fast.
 */
function getWriteClient() {
  const token = process.env.SANITY_API_WRITE_TOKEN

  if (!token) {
    throw new Error('Missing SANITY_API_WRITE_TOKEN')
  }

  // create and return a write-enabled Sanity client
  // (do not log the token itself for security)
  console.debug && console.debug('Creating Sanity write client')

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
  })
}

// Minimal shape we expect from the `wordOfTheDay` documents we query.
type DueWordOfTheDay = {
  _id: string
  scheduledFor: string
  // We project the referenced word and only need its id here.
  word?: {
    _id: string
  }
}

/**
 * Add a reference to the given `tagId` on the target document if it's
 * not already present. Returns `true` if the tag was appended, `false`
 * if it already existed.
 */
async function addTagIfMissing(
  client: ReturnType<typeof createClient>,
  documentId: string,
  tagId: string,
) {
  // Fetch existing tag reference ids (if any) for the document.
  const existingTagIds = await client.fetch<string[]>(
    /* groq */ `*[_id == $documentId][0].tags[]._ref`,
    {documentId},
  )

  // If the tag is already applied, nothing to do.
  if ((existingTagIds ?? []).includes(tagId)) {
    console.debug && console.debug('Tag already present on document', {documentId, tagId})
    return false
  }

  // Ensure `tags` array exists and append a reference to the tag.
  console.info && console.info('Appending tag to document', {documentId, tagId})

  await client
    .patch(documentId)
    .setIfMissing({tags: []})
    .append('tags', [{_key: uuid(), _type: 'reference', _ref: tagId}])
    .commit()

  return true
}

/**
 * Promote scheduled `wordOfTheDay` entries that are due (scheduled before
 * the start of tomorrow). For the most-recent eligible entry that has an
 * associated word, add the "Word of the Day" tag to the underlying word
 * document(s) (both published and draft if present), and delete the
 * scheduled entries that are no longer needed.
 *
 * Returns a summary object describing how many entries were promoted,
 * deleted, and whether the tag was created during the run.
 */
export async function promoteDueWordOfTheDay(now = new Date()) {
  const client = getWriteClient()
  // Compute an ISO timestamp for the start of tomorrow in America/New_York
  // (midnight ET). This converts that local midnight to the corresponding
  // UTC instant so we can compare absolute timestamps stored in Sanity.
  function getTomorrowStartIsoInTimeZone(d: Date, timeZone = 'America/New_York') {
    // Get the year/month/day in the target timezone for the provided date.
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(d)
    const map = parts.reduce<Record<string, string>>((acc, p) => {
      if (p.type !== 'literal') acc[p.type] = p.value
      return acc
    }, {})

    const year = Number(map.year)
    const month = Number(map.month)
    const day = Number(map.day)

    // Determine the hour offset between UTC and the target timezone for
    // the current instant. This yields 4 for EDT or 5 for EST.
    const utcHour = Number(
      new Intl.DateTimeFormat('en-US', {timeZone: 'UTC', hour: 'numeric', hour12: false}).format(d),
    )
    const tzHour = Number(
      new Intl.DateTimeFormat('en-US', {timeZone, hour: 'numeric', hour12: false}).format(d),
    )
    const offsetHours = (utcHour - tzHour + 24) % 24

    // Compute the UTC instant that corresponds to midnight of the next
    // day in the target timezone by adding the offset hours to local
    // midnight and constructing a UTC timestamp.
    const utcMillis = Date.UTC(year, month - 1, day + 1, offsetHours, 0, 0)
    return new Date(utcMillis).toISOString()
  }

  const tomorrowStartIso = getTomorrowStartIsoInTimeZone(now, 'America/New_York')

  console.info &&
    console.info('promoteDueWordOfTheDay run', {now: now.toISOString(), tomorrowStartIso})

  // Fetch all scheduled `wordOfTheDay` entries that are due, ordered
  // ascending so older entries are processed first.
  const dueEntries = await client.fetch<DueWordOfTheDay[]>(
    /* groq */ `
      *[_type == "wordOfTheDay" && scheduledFor < $tomorrowStartIso] | order(scheduledFor asc) {
        _id,
        scheduledFor,
        word-> {
          _id,
        }
      }
    `,
    {tomorrowStartIso},
  )

  console.info && console.info('Found due entries', {count: dueEntries.length})

  // Nothing to do if no entries are due.
  if (dueEntries.length === 0) {
    console.info && console.info('No due entries to promote')
    return {promoted: 0, deleted: 0, kept: 0, tagCreated: false}
  }

  // Ensure the "Word of the Day" tag exists. If it doesn't, create it
  // with a deterministic id so we can reference it reliably across runs.
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
    console.info && console.info('Created Word of the Day tag', {tagId})
  }

  let promoted = 0
  let deleted = 0

  // Choose the most-recent entry (last in time) that has an associated
  // word to keep; all other scheduled entries will be deleted. We reverse
  // the array because `dueEntries` is ordered oldest->newest.
  const keepEntry = [...dueEntries].reverse().find((entry) => Boolean(entry.word?._id))

  console.debug && console.debug('Selected keepEntry', {keepEntryId: keepEntry?._id})

  for (const entry of dueEntries) {
    const shouldKeep = keepEntry?._id === entry._id

    console.info &&
      console.info('Processing scheduled entry', {
        entryId: entry._id,
        scheduledFor: entry.scheduledFor,
        hasWord: Boolean(entry.word?._id),
      })

    // If this scheduled entry references a word, tag the underlying
    // word document(s). We attempt to tag both the published document
    // and its draft (if present) so the tag is visible in both states.
    if (entry.word?._id) {
      const publishedWordId = entry.word._id
      const draftWordId = `drafts.${publishedWordId}`

      // Find which of the published/draft documents actually exist so
      // we only patch present documents.
      const existingWordDocumentIds = await client.fetch<string[]>(
        /* groq */ `*[_id in [$publishedWordId, $draftWordId]]._id`,
        {publishedWordId, draftWordId},
      )

      const wordDocumentIdsToPatch =
        existingWordDocumentIds.length > 0 ? existingWordDocumentIds : [publishedWordId]

      let addedToAnyDocument = false

      for (const wordDocumentId of wordDocumentIdsToPatch) {
        console.debug &&
          console.debug('Attempting to add tag to word document', {wordDocumentId, tagId})
        const added = await addTagIfMissing(client, wordDocumentId, tagId)
        if (added) {
          addedToAnyDocument = true
          console.info && console.info('Added tag to word document', {wordDocumentId, tagId})
        }
      }

      if (addedToAnyDocument) {
        promoted += 1
      }
    }

    // Delete the scheduled entry unless it's the one we selected to keep.
    if (!shouldKeep) {
      console.info && console.info('Deleting scheduled entry', {entryId: entry._id})
      await client.delete(entry._id)
      deleted += 1
    }
  }

  const result = {promoted, deleted, kept: keepEntry ? 1 : 0, tagCreated}
  console.info && console.info('Promotion summary', result)
  return result
}
