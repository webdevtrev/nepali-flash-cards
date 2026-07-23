import {person} from './documents/person'
import {lesson} from './documents/lesson'
import {courseSection} from './documents/courseSection'
import {tags} from './documents/tags'
import {word} from './documents/word'
import {phrase} from './documents/phrase'
import {wordOfTheDay} from './documents/wordOfTheDay'
import {consonant} from './documents/consonant'
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
  courseSection,
  lesson,
  person,
  tags,
  word,
  phrase,
  wordOfTheDay,
  consonant,
  // Objects
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  button,
]
