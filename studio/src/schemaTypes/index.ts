import {person} from './documents/person'
import {lesson} from './documents/lesson'
import {courseSection} from './documents/courseSection'
import {tags} from './documents/tags'
import {word} from './documents/word'
import {phrase} from './documents/phrase'
import {wordOfTheDay} from './documents/wordOfTheDay'
import {consonant} from './documents/consonant'
import {vowel} from './documents/vowel'
import {combination} from './documents/combination'
import {flashcardSet} from './documents/flashcardSet'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import flashcard from './objects/flashcard'

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
  vowel,
  combination,
  flashcardSet,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  flashcard,
]
