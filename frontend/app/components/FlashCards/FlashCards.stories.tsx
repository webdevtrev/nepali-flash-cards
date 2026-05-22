import type {Meta, StoryObj} from '@storybook/nextjs-vite'
import FlashCards, {type WordEntry} from './index'

const meta = {
  title: 'Components/FlashCards',
  component: FlashCards,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof FlashCards>

export default meta
type Story = StoryObj<typeof meta>

const greetings: WordEntry[] = [
  {
    english: 'Hello',
    romanized: 'Namaste',
    pronunciation: 'nuh-muh-STAY',
    devanagari: 'नमस्ते',
    tags: ['greetings'],
  },
  {
    english: 'Good morning',
    romanized: 'Subha prabhat',
    pronunciation: 'SOO-bha pra-BHAT',
    devanagari: 'शुभ प्रभात',
    tags: ['greetings'],
  },
  {
    english: 'Good night',
    romanized: 'Shubha ratri',
    pronunciation: 'SHOO-bha RAT-ree',
    devanagari: 'शुभ रात्रि',
    tags: ['greetings'],
  },
  {
    english: 'Goodbye',
    romanized: 'Pheri bhetaula',
    pronunciation: 'PHEH-ree BHE-tow-la',
    devanagari: 'फेरि भेटौला',
    tags: ['greetings'],
  },
  {
    english: 'How are you?',
    romanized: 'Tapai lai kasto cha?',
    pronunciation: 'ta-PAI lai KAS-to cha',
    devanagari: 'तपाईलाई कस्तो छ?',
    tags: ['greetings'],
  },
]

const mixed: WordEntry[] = [
  ...greetings,
  {
    english: 'Thank you',
    romanized: 'Dhanyabad',
    pronunciation: 'DHAN-ya-bad',
    devanagari: 'धन्यवाद',
    tags: ['politeness'],
  },
  {
    english: 'Please',
    romanized: 'Kripaya',
    pronunciation: 'kri-PA-ya',
    devanagari: 'कृपया',
    tags: ['politeness'],
  },
  {
    english: 'Sorry',
    romanized: 'Maaf garnuhos',
    pronunciation: 'maaf GAR-nu-hos',
    devanagari: 'माफ गर्नुहोस्',
    tags: ['politeness'],
  },
  {english: 'One', romanized: 'Ek', pronunciation: 'ek', devanagari: 'एक', tags: ['numbers']},
  {english: 'Two', romanized: 'Dui', pronunciation: 'doo-ee', devanagari: 'दुई', tags: ['numbers']},
  {
    english: 'Three',
    romanized: 'Teen',
    pronunciation: 'teen',
    devanagari: 'तीन',
    tags: ['numbers'],
  },
  {
    english: 'Water',
    romanized: 'Paani',
    pronunciation: 'PAA-nee',
    devanagari: 'पानी',
    tags: ['food'],
  },
  {
    english: 'Food / Rice',
    romanized: 'Bhat',
    pronunciation: 'bhat',
    devanagari: 'भात',
    tags: ['food'],
  },
]

export const Default: Story = {
  args: {
    words: greetings,
  },
}

export const LargeDeck: Story = {
  args: {
    words: mixed,
  },
}

export const SingleCard: Story = {
  args: {
    words: [{english: 'Hello', romanized: 'Namaste', devanagari: 'नमस्ते'}],
  },
}

export const NoDevanagari: Story = {
  args: {
    words: greetings.map(({devanagari: _dev, ...rest}) => rest),
  },
}
