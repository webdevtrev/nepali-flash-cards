import {person} from './documents/person'
import {page} from './documents/page'
import {lesson} from './documents/post'
import {tags} from './documents/tags'
import {word} from './documents/word'
import {phrase} from './documents/phrase'
import {wordOfTheDay} from './documents/wordOfTheDay'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Documents
  page,
  lesson,
  person,
  tags,
  word,
  phrase,
  wordOfTheDay,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
]
