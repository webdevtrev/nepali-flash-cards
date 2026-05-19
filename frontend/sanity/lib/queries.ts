import {defineQuery} from 'next-sanity'

export const settingsQuery = defineQuery(`*[_type == "settings"][0]`)

const lessonFields = /* groq */ `
  _id,
  "status": select(_originalId in path("drafts.**") => "draft", "published"),
  "title": coalesce(title, "Untitled"),
  "slug": slug.current,
  excerpt,
  coverImage,
  "date": coalesce(date, _updatedAt),
  "author": author->{firstName, lastName, picture},
`

const linkReference = /* groq */ `
  _type == "link" => {
    "page": page->slug.current,
    "lesson": lesson->slug.current
  }
`

const linkFields = /* groq */ `
  link {
      ...,
      ${linkReference}
      }
`

export const getPageQuery = defineQuery(`
  *[_type == 'page' && slug.current == $slug][0]{
    _id,
    _type,
    name,
    slug,
    heading,
    subheading,
    "pageBuilder": pageBuilder[]{
      ...,
      _type == "callToAction" => {
        ...,
        button {
          ...,
          ${linkFields}
        }
      },
      _type == "infoSection" => {
        content[]{
          ...,
          markDefs[]{
            ...,
            ${linkReference}
          }
        }
      },
    },
  }
`)

export const sitemapData = defineQuery(`
  *[_type == "page" || _type == "lesson" && defined(slug.current)] | order(_type asc) {
    "slug": slug.current,
    _type,
    _updatedAt,
  }
`)

export const allLessonsQuery = defineQuery(`
  *[_type == "lesson" && defined(slug.current)] | order(date desc, _updatedAt desc) {
    ${lessonFields}
  }
`)

export const moreLessonsQuery = defineQuery(`
  *[_type == "lesson" && _id != $skip && defined(slug.current)] | order(date desc, _updatedAt desc) [0...$limit] {
    ${lessonFields}
  }
`)

export const lessonQuery = defineQuery(`
  *[_type == "lesson" && slug.current == $slug] [0] {
    content[]{
    ...,
    markDefs[]{
      ...,
      ${linkReference}
    }
  },
    ${lessonFields}
  }
`)

export const lessonPagesSlugs = defineQuery(`
  *[_type == "lesson" && defined(slug.current)]
  {"slug": slug.current}
`)

export const pagesSlugs = defineQuery(`
  *[_type == "page" && defined(slug.current)]
  {"slug": slug.current}
`)

// Backwards compatibility exports
export const allPostsQuery = allLessonsQuery
export const morePostsQuery = moreLessonsQuery
export const postQuery = lessonQuery
export const postPagesSlugs = lessonPagesSlugs

export const wordsQuery = defineQuery(`
  *[_type == "word"] | order(english asc) {
    english,
    romanized,
    devanagari,
    pronunciation,
    "tags": tags[]->_id,
  }
`)

export const tagsQuery = defineQuery(`
  *[_type == "tags"] | order(title asc) {
    _id,
    title,
  }
`)

export const currentWordOfTheDayQuery = defineQuery(`
  *[_type == "wordOfTheDay" && scheduledFor < $tomorrowStartIso] | order(scheduledFor desc)[0] {
    _id,
    scheduledFor,
    notes,
    word-> {
      _id,
      english,
      romanized,
      devanagari,
      pronunciation,
    }
  }
`)
